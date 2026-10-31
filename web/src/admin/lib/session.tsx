/** Sesión del editor: se comprueba al abrir el panel y se pierde con cualquier 401 de la API. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setUnauthenticatedHandler } from "./api";

export type User = { id: string; email: string; name: string };
type State = { status: "loading" } | { status: "anonymous"; expired: boolean } | { status: "signed-in"; user: User };

type Session = {
  state: State;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    api<{ user: User }>("GET", "/api/auth/session", { signal: controller.signal, quiet401: true })
      .then(({ user }) => setState({ status: "signed-in", user }))
      .catch((error) => {
        if (!(error instanceof DOMException)) setState({ status: "anonymous", expired: false });
      });
    setUnauthenticatedHandler(() => setState({ status: "anonymous", expired: true }));
    return () => {
      controller.abort();
      setUnauthenticatedHandler(null);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user } = await api<{ user: User }>("POST", "/api/auth/login", { body: { email, password }, quiet401: true });
    setState({ status: "signed-in", user });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api("POST", "/api/auth/logout", { quiet401: true });
    } finally {
      setState({ status: "anonymous", expired: false });
    }
  }, []);

  const value = useMemo(() => ({ state, signIn, signOut }), [state, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession necesita SessionProvider");
  return session;
}
