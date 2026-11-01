// Pasos de features/plataforma/editor-dominio.feature: el editor en su propio dominio (ADMIN_URL).
import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures.js";
import { adminURL, baseURL, cookieSesion } from "../support/entorno.js";
import { nuevaCuenta } from "../support/editor.js";

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
  const { email, password } = await nuevaCuenta();
  // page.request comparte las cookies con el navegador: es como iniciar sesión desde el panel.
  const r = await page.request.post(new URL("/api/auth/login", adminURL).href, {
    data: { email, password },
    headers: { origin: new URL(adminURL).origin, "x-requested-with": "prana-admin" },
  });
  expect(r.status(), await r.text()).toBe(200);
});

Then("la consola solo avisa de la sesión sin iniciar", async ({ page }) => {
  // Al abrir el panel sin sesión, /api/auth/session responde 401 y el navegador lo anota: es lo esperado.
  const errores = [];
  page.on("console", (m) => m.type() === "error" && errores.push(`${m.text()} ${m.location().url}`));
  page.on("pageerror", (e) => errores.push(e.message));
  await page.reload({ waitUntil: "networkidle" });
  expect(errores.filter((e) => !/401/.test(e) || !e.includes("/api/auth/session"))).toEqual([]);
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
