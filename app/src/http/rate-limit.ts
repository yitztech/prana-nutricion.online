/**
 * Límite de peticiones por IP real (§24, §31), en memoria y acotado: frena ráfagas antes de llegar a la base
 * de datos. Es la primera barrera; los fallos de inicio de sesión los cuenta además `auth/attempts.ts`, en
 * PostgreSQL, por IP y por cuenta.
 */
import type { RateLimitPluginOptions } from "@fastify/rate-limit";
import type { FastifyRequest } from "fastify";
import { HttpProblem } from "./problem.ts";

/** Peticiones por minuto y por IP. */
export const requestLimits = {
  /** Toda la API: holgado para el panel, también con varias pestañas o personas tras la misma IP. */
  api: 1200,
  /**
   * Inicio de sesión y cambio de contraseña (Argon2id de 64 MiB). Holgado a propósito: los fallos ya los corta
   * `auth/attempts.ts` antes de calcular el hash; este frena las ráfagas que llegan a la base de datos.
   */
  credentials: 300,
} as const;

const WINDOW = "1 minute";
/** IPs distintas que se recuerdan a la vez (LRU): memoria acotada (§20). */
const TRACKED_IPS = 10_000;

/** La IP del cliente es la que pone el gateway, nunca la de la conexión (§20). */
export function clientIp(request: FastifyRequest) {
  const real = request.headers["x-real-ip"];
  return typeof real === "string" && /^[0-9a-fA-F.:]{2,45}$/.test(real) ? real : request.ip;
}

/** Límite de las rutas que verifican una contraseña (`config.rateLimit` de la ruta). */
export const credentialsLimit = { max: requestLimits.credentials, timeWindow: WINDOW };

/** Límite global de la API, para `app.register(rateLimit, …)`. */
export const rateLimitOptions: RateLimitPluginOptions = {
  global: true,
  max: requestLimits.api,
  timeWindow: WINDOW,
  cache: TRACKED_IPS,
  keyGenerator: clientIp,
  errorResponseBuilder: (_request, context) => {
    const retry = String(Math.max(Math.ceil(context.ttl / 1000), 1));
    return new HttpProblem(429, "rate_limited", "Demasiadas peticiones. Espera un momento y vuelve a probar.", undefined, { "Retry-After": retry });
  },
};
