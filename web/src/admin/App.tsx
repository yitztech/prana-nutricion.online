/** Panel del editor: comprueba la sesión, dibuja la navegación y elige la pantalla según la ruta. */
import { lazy, Suspense, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/ui/logo";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { Text } from "@/components/ui/typography";
import { Link, match, useRouter } from "./lib/router";
import { useSession } from "./lib/session";
import { Loading } from "./components/layout";
import { AccountPage } from "./pages/account";
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from "./pages/auth";
import { HomePage } from "./pages/home";
import { PromotionPage, PromotionsPage } from "./pages/promotions";
import { CategoriesPage, CategoryPage, NotFoundContent } from "./pages/treatments";

const nav = [
  { to: "/", label: "Inicio", section: "" },
  { to: "/tratamientos", label: "Tratamientos", section: "tratamientos" },
  { to: "/promociones", label: "Promociones", section: "promociones" },
  { to: "/legales/privacidad", label: "Aviso de privacidad", section: "legales/privacidad" },
  { to: "/legales/condiciones", label: "Condiciones", section: "legales/condiciones" },
  { to: "/cuenta", label: "Tu cuenta", section: "cuenta" },
];

const publicRoutes = ["/entrar", "/recuperar", "/restablecer"];

// El editor de texto enriquecido (Tiptap) solo se descarga al abrir un documento legal.
const LegalPage = lazy(() => import("./pages/legal").then((m) => ({ default: m.LegalPage })));

function Screen({ path }: { path: string }) {
  if (path === "/") return <HomePage />;
  if (path === "/tratamientos") return <CategoriesPage />;
  if (path === "/promociones") return <PromotionsPage />;
  if (path === "/cuenta") return <AccountPage />;
  let params = match("/tratamientos/:id", path);
  if (params) return <CategoryPage key={params.id} id={params.id} />;
  params = match("/promociones/:id", path);
  if (params) return <PromotionPage key={params.id} id={params.id} />;
  params = match("/legales/:slug", path);
  if (params) return <Suspense fallback={<Loading />}><LegalPage key={params.slug} slug={params.slug} /></Suspense>;
  return <NotFoundContent />;
}

function Shell({ path }: { path: string }) {
  const { state, signOut } = useSession();
  const current = path.split("/").filter(Boolean).slice(0, path.startsWith("/legales") ? 2 : 1).join("/");
  return (
    <div className="min-h-dvh">
      <TextLink href="#contenido" variant="skip">Saltar al contenido</TextLink>
      <Surface asChild variant="header"><header>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <TextLink asChild variant="default"><Link to="/" aria-label="Inicio del editor"><Logo className="h-10" /></Link></TextLink>
          <nav aria-label="Secciones del editor" className="order-last w-full overflow-x-auto md:order-none md:w-auto md:flex-1">
            <ul className="flex gap-1">
              {nav.map((item) => {
                const active = current === item.section;
                return (
                  <li key={item.to}>
                    <TextLink asChild variant="tab">
                      <Link to={item.to} aria-current={active ? "page" : undefined}>{item.label}</Link>
                    </TextLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Text asChild variant="small-muted"><span className="hidden sm:inline">{state.status === "signed-in" ? state.user.name : ""}</span></Text>
            <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut aria-hidden="true" />Cerrar sesión
            </Button>
          </div>
        </div>
      </header></Surface>
      <main id="contenido" className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Screen path={path} />
      </main>
    </div>
  );
}

export function App() {
  const { state } = useSession();
  const { path, navigate } = useRouter();
  const isPublic = publicRoutes.includes(path);

  // Sin sesión, a la entrada; con sesión, fuera de ella. /restablecer sirve en los dos casos.
  useEffect(() => {
    if (state.status === "anonymous" && !isPublic) navigate("/entrar", { replace: true });
    if (state.status === "signed-in" && (path === "/entrar" || path === "/recuperar")) navigate("/", { replace: true });
  }, [state.status, isPublic, path, navigate]);

  useEffect(() => {
    const titles: Record<string, string> = { "/entrar": "Entrar", "/recuperar": "Restablecer la contraseña", "/restablecer": "Contraseña nueva" };
    const label = titles[path] ?? nav.find((item) => item.to !== "/" && path.startsWith(item.to))?.label;
    document.title = label ? `${label} · Editor del sitio · Praná` : "Editor del sitio · Praná";
  }, [path]);

  if (state.status === "loading") {
    return <main id="contenido" className="flex min-h-dvh items-center justify-center"><Loading label="Abriendo el editor…" /></main>;
  }
  if (path === "/restablecer") return <ResetPasswordPage />;
  if (state.status === "anonymous") {
    return path === "/recuperar" ? <ForgotPasswordPage /> : <LoginPage expired={state.expired} />;
  }
  return <Shell path={path} />;
}
