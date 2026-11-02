import assert from "node:assert/strict";
import { test } from "node:test";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { HttpProblem, sendProblem } from "./problem.ts";
import { credentialsLimit, rateLimitOptions, requestLimits } from "./rate-limit.ts";

async function app() {
  const server = Fastify();
  await server.register(rateLimit, rateLimitOptions);
  server.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpProblem) return sendProblem(request, reply, error);
    throw error;
  });
  server.get("/api/datos", async () => ({ ok: true }));
  server.post("/api/auth/login", { config: { rateLimit: credentialsLimit } }, async () => ({ ok: true }));
  return server;
}

const desde = (ip: string) => ({ "x-real-ip": ip });

test("el inicio de sesión responde 429 en Problem Details, con Retry-After, al pasar el límite por IP", async () => {
  const server = await app();
  for (let i = 0; i < requestLimits.credentials; i++) {
    assert.equal((await server.inject({ method: "POST", url: "/api/auth/login", headers: desde("203.0.113.7") })).statusCode, 200);
  }
  const r = await server.inject({ method: "POST", url: "/api/auth/login", headers: desde("203.0.113.7") });
  assert.equal(r.statusCode, 429);
  assert.match(r.headers["content-type"] as string, /^application\/problem\+json/);
  assert.equal(r.json().code, "rate_limited");
  assert.ok(Number(r.headers["retry-after"]) >= 1);
  // El límite es por la IP que pone el gateway: otra IP no queda afectada.
  assert.equal((await server.inject({ method: "POST", url: "/api/auth/login", headers: desde("203.0.113.8") })).statusCode, 200);
  await server.close();
});

test("el resto de la API tiene un límite global más holgado", async () => {
  const server = await app();
  assert.ok(requestLimits.api > requestLimits.credentials);
  for (let i = 0; i < requestLimits.api; i++) {
    assert.equal((await server.inject({ url: "/api/datos", headers: desde("198.51.100.1") })).statusCode, 200);
  }
  assert.equal((await server.inject({ url: "/api/datos", headers: desde("198.51.100.1") })).statusCode, 429);
  await server.close();
});
