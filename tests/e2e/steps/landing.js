// Pasos de features/landing/: menú móvil y formulario de WhatsApp.
import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures.js";
import { teclado } from "../support/entorno.js";

/** El formulario abre WhatsApp en otra pestaña: se registra la URL en lugar de abrirla. */
async function capturarWhatsApp(page, bloqueado = false) {
  await page.addInitScript((bloqueado) => {
    window.open = (url, destino, opciones) => {
      window.__intentos = (window.__intentos ?? 0) + 1;
      window.__abierto = url;
      window.__opciones = opciones;
      return bloqueado ? null : {};
    };
  }, bloqueado);
}

async function pegar(page, campo, texto) {
  const input = page.getByLabel(campo, { exact: true });
  await input.focus();
  // El evento sintético no inserta nada por sí mismo. Si no se cancela, el navegador
  // inserta el texto con su editor nativo (selección, maxlength e input incluidos).
  const insertar = await input.evaluate((el, texto) => {
    const datos = new DataTransfer();
    datos.setData("text/plain", texto);
    return el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: datos, bubbles: true, cancelable: true }));
  }, texto);
  if (insertar) await page.keyboard.insertText(texto);
}

Given("que abro la portada en un móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
});

Given("que abro el formulario de contacto", async ({ page }) => {
  await capturarWhatsApp(page);
  await page.goto("/#contacto");
});

Given("que abro el formulario con las ventanas emergentes bloqueadas", async ({ page }) => {
  await capturarWhatsApp(page, true);
  await page.goto("/#contacto");
});

Given("que el navegador falla al intentar abrir WhatsApp", async ({ page }) => {
  await page.evaluate(() => { window.open = () => { throw new Error("Apertura no disponible"); }; });
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
  await pegar(page, campo, "a".repeat(largo));
});

When("pego {string} en el campo {string}", async ({ page }, texto, campo) => {
  await pegar(page, campo, texto);
});

When("selecciono {string} del campo {string}", async ({ page }, texto, campo) => {
  const input = page.getByLabel(campo, { exact: true });
  const inicio = (await input.inputValue()).indexOf(texto);
  expect(inicio).toBeGreaterThanOrEqual(0);
  await input.focus();
  await input.evaluate((el, { inicio, largo }) => el.setSelectionRange(inicio, inicio + largo), { inicio, largo: texto.length });
});

When("elijo el servicio {string}", async ({ page }, servicio) => {
  await page.getByLabel("Servicio de Interés").selectOption(servicio);
});

When("pulso {string}", async ({ page }, boton) => {
  await page.getByRole("button", { name: boton }).click();
});


Then("el campo {string} contiene {string}", async ({ page }, campo, valor) => {
  await expect(page.getByLabel(campo, { exact: true })).toHaveValue(valor);
});

Then("el campo {string} tiene {int} caracteres", async ({ page }, campo, largo) => {
  await expect.poll(async () => (await page.getByLabel(campo, { exact: true }).inputValue()).length).toBe(largo);
});

Then("el campo {string} empieza por {string}", async ({ page }, campo, inicio) => {
  await expect(page.getByLabel(campo, { exact: true })).toHaveValue(new RegExp(`^${inicio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
});

Then("el campo {string} no tiene errores", async ({ page }, campo) => {
  await expect(page.getByLabel(campo, { exact: true })).not.toHaveAttribute("aria-invalid", "true");
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

Then("se intenta abrir WhatsApp al {string} con un mensaje que incluye:", async ({ page }, numero, tabla) => {
  const url = new URL(await page.evaluate(() => window.__abierto));
  expect(url.origin + url.pathname).toBe(`https://wa.me/${numero}`);
  const texto = url.searchParams.get("text");
  for (const [linea] of tabla.raw()) expect(texto).toContain(linea);
  expect(await page.evaluate(() => window.__opciones)).toBe("noopener,noreferrer");
});

Then("puedo continuar con el mismo mensaje en WhatsApp", async ({ page }) => {
  const enlace = page.getByRole("link", { name: "Continuar en WhatsApp" });
  await expect(enlace).toBeVisible();
  await expect(enlace).toHaveAttribute("href", await page.evaluate(() => window.__abierto));
  await expect(enlace).toHaveAttribute("target", "_blank");
  await expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
});

Then("no aparece el enlace para continuar en WhatsApp", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Continuar en WhatsApp" })).toBeHidden();
});

Then("hay un enlace para continuar en WhatsApp", async ({ page }) => {
  const enlace = page.getByRole("link", { name: "Continuar en WhatsApp" });
  await expect(enlace).toBeVisible();
  await expect(enlace).toHaveAttribute("href", /^https:\/\/wa\.me\/527772095094\?text=/);
});

Then("solo se intenta abrir una ventana de WhatsApp", async ({ page }) => {
  expect(await page.evaluate(() => window.__intentos)).toBe(1);
});

Then("veo el aviso {string}", async ({ page }, texto) => {
  await expect(page.getByRole("status")).toHaveText(texto);
});
