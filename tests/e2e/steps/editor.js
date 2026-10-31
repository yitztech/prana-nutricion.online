// Pasos de features/plataforma/editor-dominio.feature: el editor en su propio dominio (ADMIN_URL).
import { randomBytes, randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import argon2 from "argon2";
import pg from "pg";
import { Given, When, Then } from "./fixtures.js";
import { adminURL, baseURL, cookieSesion, pgURL } from "../support/entorno.js";

When("abro el editor en {string}", async ({ page, ctx }, ruta) => {
  ctx.respuesta = await page.goto(new URL(ruta, adminURL).href);
  expect(ctx.respuesta.status()).toBe(200);
  await expect(page).toHaveTitle(/Editor del sitio/);
});

Then("la página es el error 404 del sitio", async ({ page, ctx }) => {
  expect(ctx.respuesta.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).not.toHaveTitle(/Editor del sitio/);
});

Then("el editor queda fuera de los buscadores y sin analítica", async ({ page, ctx }) => {
  const h = ctx.respuesta.headers();
  expect(h["x-robots-tag"]).toBe("noindex, nofollow");
  expect(h["cache-control"]).toBe("no-store");
  expect(h["referrer-policy"]).toBe("no-referrer");
  const scripts = h["content-security-policy"].match(/script-src ([^;]+)/)[1].trim();
  expect(scripts).toBe("'self'");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
});

Then("el editor no carga nada de otros dominios", async ({ page }) => {
  const externos = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("data:") && !r.url().startsWith("blob:") && new URL(r.url()).origin !== new URL(adminURL).origin)
      externos.push(r.url());
  });
  await page.reload({ waitUntil: "networkidle" });
  expect(externos).toEqual([]);
});

Given("que inicio sesión en el editor con una cuenta nueva", async ({ page }) => {
  // Cuenta única por escenario, creada directamente en la base de datos del compose de pruebas.
  const email = `e2e-${randomUUID()}@ejemplo.mx`;
  const password = `clave-${randomBytes(9).toString("base64url")}`;
  const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
  const db = new pg.Client({ connectionString: pgURL, options: "-c search_path=prana" });
  await db.connect();
  try {
    await db.query("INSERT INTO admin_users (email, name, password_hash) VALUES ($1, 'Persona de prueba', $2)", [email, hash]);
  } finally {
    await db.end();
  }
  // page.request comparte las cookies con el navegador: es como iniciar sesión desde el panel.
  const r = await page.request.post(new URL("/api/auth/login", adminURL).href, {
    data: { email, password },
    headers: { origin: new URL(adminURL).origin, "x-requested-with": "prana-admin" },
  });
  expect(r.status(), await r.text()).toBe(200);
});

Then("el navegador guarda la sesión solo para el dominio del editor", async ({ page }) => {
  const [sesion] = (await page.context().cookies(adminURL)).filter((c) => c.name === cookieSesion);
  expect(sesion, "cookie de sesión en el dominio del editor").toBeTruthy();
  expect(sesion.domain).toBe(new URL(adminURL).hostname);
  expect(sesion.httpOnly).toBe(true);
  expect(sesion.sameSite).toBe("Lax");
  expect((await page.context().cookies(baseURL)).map((c) => c.name)).not.toContain(cookieSesion);
});

Then("el sitio público no recibe la cookie de sesión", async ({ page }) => {
  const respuesta = await page.goto(new URL("/", baseURL).href);
  expect(respuesta.status()).toBe(200);
  const cabeceras = await respuesta.request().allHeaders();
  expect(cabeceras.cookie ?? "").not.toContain(cookieSesion);
});
