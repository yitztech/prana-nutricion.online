/** Documentos legales: título y texto, con el historial de las últimas versiones publicadas. */
import { useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { legalSlugs, type LegalSlug, type RichDoc } from "#shared/content.ts";
import { limits } from "#shared/limits.ts";
import { legalInputSchema } from "#shared/schemas.ts";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { api } from "../lib/api";
import { check, formatDateTime, formatDay, useSubmit } from "../lib/form";
import { useResource } from "../lib/resource";
import { siteUrl } from "../lib/site";
import { legalNames, type AdminLegal } from "../lib/types";
import { TextField } from "../components/fields";
import { Loading, Notice, PageTitle, Panel, SubmitButton } from "../components/layout";
import { RichTextField } from "../components/rich-text";
import { ErrorRetry, NotFoundContent } from "./treatments";

export function LegalPage({ slug }: { slug: string }) {
  const valid = (legalSlugs as readonly string[]).includes(slug);
  const doc = useResource<AdminLegal>(valid ? `/api/admin/legal/${slug}` : null);
  if (!valid) return <NotFoundContent />;
  return (
    <>
      <PageTitle
        description="Este texto se publica tal cual en el sitio. Revísalo con quien asesora legalmente a la clínica."
        actions={
          <Button asChild variant="ghost">
            <a href={siteUrl(`/${slug}`)} target="_blank" rel="noopener"><ExternalLink aria-hidden="true" />Ver en el sitio</a>
          </Button>
        }
      >
        {legalNames[slug as LegalSlug]}
      </PageTitle>
      {doc.status === "loading" ? <Loading /> : null}
      {doc.status === "error" ? <ErrorRetry message={doc.message} retry={doc.reload} /> : null}
      {doc.status === "ready" ? <LegalForm key={slug} doc={doc.data} onSaved={doc.set} /> : null}
    </>
  );
}

function LegalForm({ doc, onSaved }: { doc: AdminLegal; onSaved: (doc: AdminLegal) => void }) {
  const [title, setTitle] = useState(doc.title);
  const [body, setBody] = useState<RichDoc>(doc.body);
  const [saved, setSaved] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  const bodyError = Object.entries(errors).find(([field]) => field === "body" || field.startsWith("body."))?.[1];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form
        ref={form}
        noValidate
        className="lg:col-span-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(false);
          void run(async () => {
            const input = check(legalInputSchema, { title, body });
            onSaved(await api<AdminLegal>("PUT", `/api/admin/legal/${doc.slug}`, { body: input }));
            setSaved(true);
          }, form.current);
        }}
      >
        <FieldGroup>
          <TextField label="Título" required max={limits.legal.title} value={title} onChange={(v) => { setSaved(false); setTitle(v); }} error={errors.title} />
          <RichTextField label="Texto" value={body} onChange={(v) => { setSaved(false); setBody(v); }} error={bodyError} />
          <Notice tone="error">{message}</Notice>
          {saved ? <Notice tone="success">Documento publicado. El sitio se actualiza en unos segundos.</Notice> : null}
          <SubmitButton busy={busy} className="w-fit">Guardar y publicar</SubmitButton>
        </FieldGroup>
      </form>
      <Panel title="Versiones" className="h-fit">
        <Text variant="small-muted" className="mb-3">Publicado el {formatDay(doc.updatedOn)}.</Text>
        {doc.versions.length ? (
          <ol className="flex flex-col gap-3">
            {doc.versions.map((version) => (
              <Surface asChild variant="timeline" className="pl-3" key={version.id}>
                <li>
                  <Text variant="label">{formatDateTime(version.createdAt)}</Text>
                  <Text variant="small-muted">{version.author ?? "Contenido inicial"}</Text>
                </li>
              </Surface>
            ))}
          </ol>
        ) : (
          <Text variant="small-muted">Aún no hay cambios guardados desde el editor.</Text>
        )}
      </Panel>
    </div>
  );
}
