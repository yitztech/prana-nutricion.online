/** Carga de datos de una pantalla: estado de carga, error con reintento y recarga tras guardar. */
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage } from "./api";

export type Resource<T> =
  | { status: "loading"; data?: undefined; reload: () => void }
  | { status: "error"; message: string; code: string; data?: undefined; reload: () => void }
  | { status: "ready"; data: T; reload: () => void; set: (data: T) => void };

export function useResource<T>(path: string | null): Resource<T> {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string; code: string } | { status: "ready"; data: T }>({ status: "loading" });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const set = useCallback((data: T) => setState({ status: "ready", data }), []);
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    // Al recargar la misma dirección se conservan los datos a la vista; con otra, se espera a los nuevos.
    if (loaded.current !== path) setState({ status: "loading" });
    loaded.current = path;
    api<T>("GET", path, { signal: controller.signal })
      .then((data) => setState({ status: "ready", data }))
      .catch((error) => {
        if (!(error instanceof DOMException)) setState({ status: "error", message: errorMessage(error), code: error instanceof ApiError ? error.code : "error" });
      });
    return () => controller.abort();
  }, [path, version]);

  if (state.status === "ready") return { ...state, reload, set };
  return { ...state, reload } as Resource<T>;
}
