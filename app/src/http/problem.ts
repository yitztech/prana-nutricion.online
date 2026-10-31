/** Errores en Problem Details (RFC 9457, AGENTS.md §22): códigos estables y textos en español. */
import type { FastifyReply, FastifyRequest } from "fastify";

export type FieldError = { field: string; code: string; message: string };

const titles: Record<number, string> = {
  400: "Petición no válida",
  401: "Inicia sesión",
  403: "Sin permiso",
  404: "No encontrado",
  409: "Conflicto",
  413: "Demasiado grande",
  415: "Formato no admitido",
  422: "Datos no válidos",
  429: "Demasiados intentos",
  500: "Error del servidor",
  503: "Servicio no disponible",
};

export class HttpProblem extends Error {
  status: number;
  code: string;
  detail: string;
  errors?: FieldError[];
  headers?: Record<string, string>;

  constructor(status: number, code: string, detail: string, errors?: FieldError[], headers?: Record<string, string>) {
    super(detail);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.errors = errors;
    this.headers = headers;
  }
}

export const validationFailed = (errors: FieldError[]) =>
  new HttpProblem(422, "validation_failed", "Revisa los campos marcados.", errors);

export const notFound = (detail = "No existe o no está disponible.") => new HttpProblem(404, "not_found", detail);

export function sendProblem(request: FastifyRequest, reply: FastifyReply, problem: HttpProblem) {
  for (const [name, value] of Object.entries(problem.headers ?? {})) reply.header(name, value);
  return reply
    .code(problem.status)
    .header("Content-Type", "application/problem+json; charset=utf-8")
    .header("Content-Language", "es-MX")
    .send({
      type: "about:blank",
      title: titles[problem.status] ?? "Error",
      status: problem.status,
      code: problem.code,
      detail: problem.detail,
      requestId: request.id,
      ...(problem.errors ? { errors: problem.errors } : {}),
    });
}
