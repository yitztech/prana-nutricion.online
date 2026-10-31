/** Inicio del panel: estado de la publicación del sitio y accesos a cada sección. */
import { useEffect, useState } from "react";
import { ExternalLink, FileText, Megaphone, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { api, errorMessage } from "../lib/api";
import { formatDateTime } from "../lib/form";
import { Link } from "../lib/router";
import { useResource } from "../lib/resource";
import { useSession } from "../lib/session";
import { siteUrl } from "../lib/site";
import type { Publication } from "../lib/types";
import { Loading, Notice, PageTitle, Panel } from "../components/layout";

const sections = [
  { to: "/tratamientos", icon: Sparkles, title: "Tratamientos", text: "Textos de cada categoría, sus beneficios y la lista de tratamientos." },
  { to: "/promociones", icon: Megaphone, title: "Promociones", text: "Ofertas vigentes, pausadas y el archivo de campañas anteriores." },
  { to: "/legales/privacidad", icon: FileText, title: "Aviso de privacidad", text: "El documento publicado en /privacidad." },
  { to: "/legales/condiciones", icon: FileText, title: "Condiciones de uso", text: "El documento publicado en /condiciones." },
];

export function PublicationStatus({ publication }: { publication: Publication }) {
  if (!publication) return <Text variant="muted">El sitio aún no se ha publicado.</Text>;
  if (publication.status === "pending") return <p>Publicando los últimos cambios…</p>;
  if (publication.status === "error") return <Notice tone="error">La última publicación falló. Vuelve a intentarlo; si sigue fallando, avisa a quien administra el sitio.</Notice>;
  return <p>Última publicación: {formatDateTime(publication.finishedAt!)}</p>;
}

export function HomePage() {
  const { state } = useSession();
  const site = useResource<{ publication: Publication }>("/api/admin/site");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const pending = site.status === "ready" && site.data.publication?.status === "pending";
  const { reload } = site;

  // Mientras se publica, se consulta cada pocos segundos hasta que termine.
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(reload, 2500);
    return () => clearTimeout(timer);
  }, [pending, reload]);

  const name = state.status === "signed-in" ? state.user.name.split(" ")[0] : "";
  return (
    <>
      <PageTitle description="Los cambios que guardes se publican solos en el sitio en unos segundos.">Hola, {name}</PageTitle>
      <div className="flex flex-col gap-6">
        <Panel title="Publicación del sitio">
          <div className="flex flex-col gap-4" aria-live="polite">
            {site.status === "loading" ? <Loading /> : null}
            {site.status === "error" ? <Notice tone="error">{site.message}</Notice> : null}
            {site.status === "ready" ? <PublicationStatus publication={site.data.publication} /> : null}
            {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={busy || pending}
                onClick={async () => {
                  setBusy(true);
                  setMessage(null);
                  try {
                    const result = await api<{ publication: Publication }>("POST", "/api/admin/site/publish");
                    if (site.status === "ready") site.set(result);
                    site.reload();
                    setMessage({ tone: "success", text: "Publicación solicitada." });
                  } catch (error) {
                    setMessage({ tone: "error", text: errorMessage(error) });
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <RefreshCw aria-hidden="true" />
                Publicar de nuevo
              </Button>
              <Button asChild variant="ghost">
                <a href={siteUrl()} target="_blank" rel="noopener">
                  <ExternalLink aria-hidden="true" />
                  Ver el sitio
                </a>
              </Button>
            </div>
          </div>
        </Panel>
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Surface asChild variant="tile" className="flex h-full gap-4 p-5">
                <Link to={to}>
                  <Icon aria-hidden="true" className="mt-1 size-6 shrink-0" />
                  <span className="flex flex-col gap-1">
                    <Text asChild variant="item-title"><span>{title}</span></Text>
                    <Text asChild variant="small-muted"><span>{text}</span></Text>
                  </span>
                </Link>
              </Surface>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
