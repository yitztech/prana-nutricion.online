/**
 * Cliente de la API del editor (/api/…, mismo dominio). Toda escritura lleva la cabecera del editor
 * (protección CSRF del servidor) y la cookie de sesión, que el navegador manda solo a este dominio.
 * Los errores llegan como Problem Details (§22) y se convierten en ApiError.
 */
export type FieldError = { field: string; code: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: FieldError[];
  readonly retryAfter: number | null;

  constructor(status: number, code: string, message: string, errors: FieldError[] = [], retryAfter: number | null = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.retryAfter = retryAfter;
  }
}

/** Avisa cuando la sesión terminó (401): el panel vuelve a la pantalla de entrada. */
let onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(handler: (() => void) | null) {
  onUnauthenticated = handler;
}

type Options = { body?: unknown; form?: FormData; signal?: AbortSignal; /** Sin redirigir en un 401 (entrar, sesión). */ quiet401?: boolean };

export async function api<T>(method: string, path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "prana-admin", Accept: "application/json" };
  let body: BodyInit | undefined;
  if (options.form) body = options.form;
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  let response: Response;
  try {
    response = await fetch(path, { method, headers, body, credentials: "same-origin", signal: options.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "network_error", "No hay conexión con el servidor. Revisa tu internet y vuelve a intentarlo.");
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    /* respuesta sin JSON: se trata abajo */
  }
  if (response.ok) return data as T;

  const problem = (data ?? {}) as { code?: string; detail?: string; title?: string; errors?: FieldError[] };
  const retry = Number(response.headers.get("retry-after"));
  const error = new ApiError(
    response.status,
    problem.code ?? "http_error",
    problem.detail ?? problem.title ?? messageFor(response.status),
    Array.isArray(problem.errors) ? problem.errors : [],
    Number.isFinite(retry) && retry > 0 ? retry : null,
  );
  if (response.status === 401 && !options.quiet401) onUnauthenticated?.();
  throw error;
}

function messageFor(status: number) {
  if (status === 413) return "El archivo o el texto es demasiado grande.";
  if (status === 429) return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  if (status >= 500) return "Algo salió mal en el servidor. Vuelve a intentarlo en unos minutos.";
  return "No se pudo completar la acción.";
}

/** Mensaje general para mostrar junto al formulario. */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 429 && error.retryAfter) {
      const minutes = Math.ceil(error.retryAfter / 60);
      return `Demasiados intentos. Vuelve a intentarlo en ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`;
    }
    return error.message;
  }
  return "Algo salió mal. Vuelve a intentarlo.";
}
