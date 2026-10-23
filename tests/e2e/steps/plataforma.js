// Pasos de features/plataforma/: salud, cabeceras, páginas legales, SEO y accesibilidad.
// Comunes a todos los proyectos de la plataforma.
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Given, When, Then } from "./fixtures.js";
import { baseURL } from "../support/entorno.js";

// ── Salud y versión ──────────────────────────────────────────────

When("pido {string}", async ({ page, ctx }, ruta) => {
  ctx.respuesta = await page.request.get(ruta);
});

Then("responde {int}", async ({ ctx }, estado) => {
  expect(ctx.respuesta.status()).toBe(estado);
});

Then("la versión trae la revisión desplegada", async ({ ctx }) => {
  const { revision } = await ctx.respuesta.json();
  // Contra producción, E2E_REVISION es el commit que se acaba de desplegar
  if (process.env.E2E_REVISION) expect(revision).toBe(process.env.E2E_REVISION);
  else expect(revision).toMatch(/^[\w.-]+$/);
  expect(ctx.respuesta.headers()["cache-control"]).toBe("no-store");
});

Then("el cuerpo contiene {string}", async ({ ctx }, texto) => {
  expect(await ctx.respuesta.text()).toContain(texto);
});

// ── Páginas ──────────────────────────────────────────────────────

Given("que abro la página {string}", async ({ page, ctx }, ruta) => {
  ctx.respuesta = await page.goto(ruta);
});

When("abro la página {string}", async ({ page, ctx }, ruta) => {
  ctx.respuesta = await page.goto(ruta);
});

Then("la página responde {int} con el título principal {string}", async ({ page, ctx }, estado, titulo) => {
  expect(ctx.respuesta.status()).toBe(estado);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
});

Then("la página está en {string}", async ({ page }, idioma) => {
  await expect(page.locator("html")).toHaveAttribute("lang", idioma);
});

Then("el título de la pestaña empieza por {string}", async ({ page }, inicio) => {
  expect(await page.title()).toMatch(new RegExp(`^${inicio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
});

Then("la página tiene descripción", async ({ page }) => {
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
});

Then("el enlace canonical apunta a {string}", async ({ page }, url) => {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
});

Then("la página lleva las cabeceras de seguridad", async ({ ctx }) => {
  const h = ctx.respuesta.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["strict-transport-security"]).toMatch(/max-age=\d+/);
  expect(h["referrer-policy"]).toBeTruthy();
  expect(h["permissions-policy"]).toBeTruthy();
  expect(h["content-security-policy"]).toMatch(/frame-ancestors 'none'/);
});

Then("la política de contenido solo permite scripts del propio dominio y de la analítica", async ({ ctx }) => {
  const csp = ctx.respuesta.headers()["content-security-policy"];
  const scripts = csp.match(/script-src ([^;]+)/)[1].trim().split(/\s+/);
  for (const origen of scripts) expect(origen).toMatch(/^('self'|https:\/\/stats\.yunitztech\.com)$/);
});

Then("la página no carga nada de otros dominios salvo la analítica", async ({ page }) => {
  const externos = [];
  page.on("request", (r) => {
    const { origin } = new URL(r.url());
    if (origin !== new URL(baseURL).origin && origin !== "https://stats.yunitztech.com" && !r.url().startsWith("data:"))
      externos.push(r.url());
  });
  await page.reload({ waitUntil: "networkidle" });
  expect(externos).toEqual([]);
});

Then("la consola no muestra errores", async ({ page, ctx }) => {
  ctx.errores ??= [];
  page.on("console", (m) => m.type() === "error" && ctx.errores.push(m.text()));
  page.on("pageerror", (e) => ctx.errores.push(e.message));
  await page.reload({ waitUntil: "networkidle" });
  expect(ctx.errores).toEqual([]);
});

Then("todas las imágenes cargan y tienen texto alternativo", async ({ page }) => {
  const imagenes = page.locator("img");
  for (const img of await imagenes.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute("alt", /.+/);
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

Then("no hay desplazamiento horizontal a {int} píxeles de ancho", async ({ page }, ancho) => {
  await page.setViewportSize({ width: ancho, height: 800 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(ancho);
});

// ── Accesibilidad ────────────────────────────────────────────────

const axe = (page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);

async function comprobarAxe(builder) {
  const { violations } = await builder.analyze();
  const graves = violations
    .filter((v) => ["serious", "critical"].includes(v.impact))
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join(", ")}`);
  expect(graves).toEqual([]);
}

Then("axe no encuentra infracciones graves ni críticas", async ({ page }) => {
  await comprobarAxe(axe(page));
});

Then("axe no encuentra infracciones graves ni críticas salvo el contraste pendiente", async ({ page }) => {
  await comprobarAxe(axe(page).disableRules(["color-contrast"]));
});

Then("axe no encuentra infracciones de contraste", async ({ page }) => {
  await comprobarAxe(axe(page).withRules(["color-contrast"]));
});
