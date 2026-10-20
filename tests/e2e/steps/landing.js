// Pasos de features/landing/: menú móvil y formulario de WhatsApp.
import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures.js";
import { teclado } from "../support/entorno.js";

/** El formulario abre WhatsApp en otra pestaña: se registra la URL en lugar de abrirla. */
async function capturarWhatsApp(page) {
  await page.addInitScript(() => {
    window.open = (url) => {
      window.__abierto = url;
      return null;
    };
  });
}

Given("que abro la portada en un móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
});

Given("que abro el formulario de contacto", async ({ page }) => {
  await capturarWhatsApp(page);
  await page.goto("/#contacto");
});

// ── Menú ─────────────────────────────────────────────────────────

When("abro el menú", async ({ page }) => {
  await page.getByRole("button", { name: "Abrir menú" }).click();
});

When("elijo {string} en el menú", async ({ page }, opcion) => {
  await page.locator("#menu-movil").getByRole("link", { name: opcion }).click();
});

When("pulso Escape", async ({ page }) => {
  await page.keyboard.press("Escape");
});

Then("veo el enlace {string} en el menú", async ({ page }, opcion) => {
  await expect(page.locator("#menu-movil").getByRole("link", { name: opcion })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
});

Then("el menú se cierra", async ({ page }) => {
  await expect(page.locator("#menu-movil")).toBeHidden();
  await expect(page.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
});

Then("la sección {string} queda a la vista", async ({ page }, titulo) => {
  await expect(page.getByRole("heading", { name: titulo })).toBeInViewport();
});

// ── Formulario ───────────────────────────────────────────────────

When("escribo {string} en el campo {string}", async ({ page }, texto, campo) => {
  await page.getByLabel(campo, { exact: true }).pressSequentially(texto, { delay: teclado });
});

When("pego un texto de {int} caracteres en el campo {string}", async ({ page }, largo, campo) => {
  // Evento de pegar con su texto, como el del portapapeles del sistema
  await page.getByLabel(campo, { exact: true }).evaluate((el, texto) => {
    const datos = new DataTransfer();
    datos.setData("text/plain", texto);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: datos, bubbles: true, cancelable: true }));
  }, "a".repeat(largo));
});

When("elijo el servicio {string}", async ({ page }, servicio) => {
  await page.getByLabel("Servicio de Interés").selectOption(servicio);
});

When("pulso {string}", async ({ page }, boton) => {
  await page.getByRole("button", { name: boton }).click();
});

When("pulso «Saber más» del servicio {string}", async ({ page }, servicio) => {
  await capturarWhatsApp(page);
  await page.getByRole("link", { name: `Saber más sobre ${servicio}` }).click();
});

Then("el campo {string} contiene {string}", async ({ page }, campo, valor) => {
  await expect(page.getByLabel(campo, { exact: true })).toHaveValue(valor);
});

Then("el campo {string} explica {string}", async ({ page }, campo, texto) => {
  const input = page.getByLabel(campo, { exact: true });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(new RegExp(texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

Then("el contador del mensaje dice {string}", async ({ page }, texto) => {
  await expect(page.getByText(texto, { exact: true })).toBeVisible();
});

Then("el servicio elegido es {string}", async ({ page }, servicio) => {
  await expect(page.getByLabel("Servicio de Interés")).toHaveValue(servicio);
});

Then("no se abre WhatsApp", async ({ page }) => {
  expect(await page.evaluate(() => window.__abierto ?? null)).toBeNull();
});

Then("se abre WhatsApp al {string} con un mensaje que incluye:", async ({ page }, numero, tabla) => {
  const url = new URL(await page.evaluate(() => window.__abierto));
  expect(url.origin + url.pathname).toBe(`https://wa.me/${numero}`);
  const texto = url.searchParams.get("text");
  for (const [linea] of tabla.raw()) expect(texto).toContain(linea);
});

Then("veo el aviso {string}", async ({ page }, texto) => {
  await expect(page.getByRole("status")).toHaveText(texto);
});
