/**
 * Rutas del panel sin dependencias: History API y enlaces nativos. En producción el panel vive en la
 * raíz de su dominio; con `npm run dev`, Vite lo sirve en /admin/.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const BASE = import.meta.env.DEV ? "/admin" : "";

const strip = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || "/" : pathname);

type Router = { path: string; navigate: (to: string, options?: { replace?: boolean }) => void };
const RouterContext = createContext<Router | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => strip(window.location.pathname));
  useEffect(() => {
    const onPop = () => setPath(strip(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = useCallback((to: string, options: { replace?: boolean } = {}) => {
    const url = `${BASE}${to}`;
    if (options.replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
    setPath(strip(new URL(url, window.location.href).pathname));
    window.scrollTo(0, 0);
  }, []);
  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter necesita RouterProvider");
  return router;
}

/** `/promociones/:id` contra la ruta actual: parámetros, o null si no coincide. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (const [i, part] of a.entries()) {
    if (part.startsWith(":")) params[part.slice(1)] = decodeURIComponent(b[i]);
    else if (part !== b[i]) return null;
  }
  return params;
}

/** Enlace nativo (abre en otra pestaña con Ctrl/Cmd) que navega sin recargar. */
export function Link({ to, children, ...props }: { to: string; children: ReactNode } & Omit<React.ComponentProps<"a">, "href">) {
  const { navigate } = useRouter();
  return (
    <a
      {...props}
      href={`${BASE}${to}`}
      onClick={(event) => {
        props.onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
