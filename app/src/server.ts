/**
 * Servicio `app`: API del editor (/api/…), generación del sitio estático y trabajos en segundo plano.
 * Detrás del gateway (nginx), que pone X-Real-IP y X-Request-ID (§20).
 */
import { randomUUID } from "node:crypto";
import { access, readdir } from "node:fs/promises";
import { join } from "node:path";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import type pg from "pg";
import { promotionImage } from "#shared/limits.ts";
import type { ServiceConfig } from "./config.ts";
import type { SessionUser } from "./auth/sessions.ts";
import type { Mailer } from "./jobs/mail.ts";
import { HttpProblem, sendProblem } from "./http/problem.ts";
import { MIGRATIONS_DIR } from "./migrate.ts";
import { authRoutes } from "./routes/auth.ts";
import { adminRoutes } from "./routes/admin.ts";
import type { Publisher } from "./site/publisher.ts";

declare module "fastify" {
  interface FastifyRequest {
    user: SessionUser | null;
    realIp: string;
    startedAt: number;
  }
}

export type Deps = { config: ServiceConfig & { extraOrigins?: string[] }; pool: pg.Pool; mailer: Mailer; publisher: Publisher };

const REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;
const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function buildServer(deps: Deps): Promise<FastifyInstance> {
  const { config } = deps;
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      base: null,
      messageKey: "msg",
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      formatters: { level: (label) => ({ level: label }) },
      // Nunca en los logs: cookies, Authorization ni cuerpos (§30).
      redact: { paths: ["req.headers.cookie", "req.headers.authorization", "res.headers['set-cookie']"], remove: true },
    },
    disableRequestLogging: true,
    requestIdLogLabel: "requestId",
    genReqId: (req) => {
      const header = req.headers["x-request-id"];
      return typeof header === "string" && REQUEST_ID.test(header) ? header : randomUUID();
    },
    bodyLimit: 1024 * 1024,
    trustProxy: false,
    return503OnClosing: true,
  });

  const origins = new Set([config.SITE_URL, ...(config.extraOrigins ?? [])]);

  await app.register(cookie);
  await app.register(multipart, {
    limits: { fileSize: promotionImage.maxBytes, files: 1, fields: 0, parts: 1, headerPairs: 100 },
    throwFileSizeLimit: true,
  });

  app.decorateRequest("user", null);
  app.decorateRequest("realIp", "");
  app.decorateRequest("startedAt", 0);

  app.addHook("onRequest", async (request) => {
    request.startedAt = performance.now();
    // La IP del cliente es la que pone el gateway, nunca la de la conexión (§20).
    const real = request.headers["x-real-ip"];
    request.realIp = typeof real === "string" && /^[0-9a-fA-F.:]{2,45}$/.test(real) ? real : request.ip;
  });

  // Protección CSRF (§24): toda escritura llega del propio dominio y con la cabecera del editor.
  app.addHook("onRequest", async (request, reply) => {
    if (!UNSAFE.has(request.method) || !request.url.startsWith("/api/")) return;
    const origin = request.headers.origin;
    if (!origin || !origins.has(origin) || request.headers["x-requested-with"] !== "prana-admin") {
      return sendProblem(request, reply, new HttpProblem(403, "forbidden_origin", "La petición no viene del editor del sitio."));
    }
  });

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("X-Request-ID", request.id);
    if (request.url.startsWith("/api/")) {
      // Respuestas con datos del admin: nunca en caché (§31).
      reply.header("Cache-Control", "no-store");
      reply.header("X-Content-Type-Options", "nosniff");
    }
    return payload;
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info({
      method: request.method,
      path: request.url.split("?")[0],
      status: reply.statusCode,
      durationMs: Math.round(performance.now() - request.startedAt),
    }, "petición");
  });

  app.setErrorHandler((error: Error & { statusCode?: number; code?: string }, request, reply) => {
    if (error instanceof HttpProblem) return sendProblem(request, reply, error);
    const status = error.statusCode ?? 500;
    if (error.code === "FST_REQ_FILE_TOO_LARGE" || status === 413) {
      return sendProblem(request, reply, new HttpProblem(413, "payload_too_large", `El archivo supera los ${promotionImage.maxBytes / 1024 / 1024} MB.`));
    }
    if (status === 415) return sendProblem(request, reply, new HttpProblem(415, "unsupported_media_type", "Envía los datos como JSON."));
    if (status >= 400 && status < 500) {
      return sendProblem(request, reply, new HttpProblem(400, "bad_request", "La petición no se pudo leer."));
    }
    request.log.error({ err: { message: error.message, stack: error.stack } }, "Error no controlado");
    return sendProblem(request, reply, new HttpProblem(500, "internal_error", "Algo salió mal. Vuelve a intentarlo en unos minutos."));
  });

  app.setNotFoundHandler((request, reply) => sendProblem(request, reply, new HttpProblem(404, "not_found", "No existe o no está disponible.")));

  // ── Salud (§20) ──────────────────────────────────────────────────────────────
  app.get("/healthz", async (_request, reply) => reply.type("text/plain").send("ok"));

  const migrationFiles = (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith(".sql")).length;
  app.get("/api/health", async (_request, reply) => {
    try {
      const { rows: [row] } = await Promise.race([
        deps.pool.query<{ applied: number }>("SELECT count(*)::int AS applied FROM pgmigrations"),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 900)),
      ]);
      await access(join(config.SITE_DIR, "current", "index.html"));
      if (row.applied < migrationFiles) throw new Error("migraciones pendientes");
      return reply.send({ status: "ok" });
    } catch {
      return reply.code(503).send({ status: "error" });
    }
  });

  await app.register(authRoutes(deps), { prefix: "/api/auth" });
  await app.register(adminRoutes(deps), { prefix: "/api/admin" });
  return app;
}

export function requireUser(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) return sendProblem(request, reply, new HttpProblem(401, "unauthenticated", "Tu sesión terminó. Vuelve a iniciar sesión."));
}
