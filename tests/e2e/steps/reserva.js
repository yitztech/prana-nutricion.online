// Pasos de features/landing/reserva.feature: enlaces directos a WhatsApp (BookingButton).
import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures.js";
import { hidratada, RESERVA_GENERAL, reservaDe, WHATSAPP } from "../support/sitio.js";

const primeraPantalla = (page) => page.locator("#inicio").getByRole("link", { name: /^Agenda tu valoración/ });
const barraMovil = (page) => page.getByRole("complementary", { name: "Contacto rápido" });

async function abrirReserva(page, ctx, enlace) {
  // Se intercepta la navegación externa: la prueba nunca contacta con WhatsApp ni envía mensajes.
  await page.context().route("https://wa.me/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>WhatsApp de prueba</title>" }),
  );
  const abierta = page.waitForEvent("popup");
  await enlace.click();
  const popup = await abierta;
  await popup.waitForLoadState("domcontentloaded");
  ctx.reserva = new URL(popup.url());
  await popup.close();
}

Given("que abro la portada sin movimiento automático", async ({ page }) => {
  // Con movimiento reducido el carrusel no avanza solo: la primera diapositiva sigue a la vista.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await hidratada(page);
});

Given("que abro la portada sin su JavaScript", async ({ page }) => {
  await page.route("**/assets/*.js", (route) => route.abort());
  await page.goto("/");
});

Given("que abro la portada con un ancho de {int} píxeles", async ({ page }, ancho) => {
  await page.setViewportSize({ width: ancho, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

Then("la primera pantalla ofrece agendar mi valoración", async ({ page, $testInfo }) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(primeraPantalla(page)).toBeInViewport();
  await expect(primeraPantalla(page)).toHaveAccessibleName("Agenda tu valoración (abre WhatsApp)");
  await $testInfo.attach("portada-viewport", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
});

When("abro la reserva de la primera pantalla", async ({ page, ctx }) => {
  await abrirReserva(page, ctx, primeraPantalla(page));
});

When("abro la reserva de la barra de contacto rápido", async ({ page, ctx }) => {
  await abrirReserva(page, ctx, barraMovil(page).getByRole("link", { name: /WhatsApp/ }));
});

When("agendo una valoración de {string}", async ({ page, ctx }, tratamiento) => {
  const ficha = page.getByRole("article", { name: tratamiento, exact: true });
  await abrirReserva(page, ctx, ficha.getByRole("link", { name: /Solicitar valoración/ }));
});

Then("WhatsApp prepara una valoración sin datos obligatorios", async ({ page, ctx }) => {
  expect(ctx.reserva.origin + ctx.reserva.pathname).toBe(WHATSAPP);
  expect(ctx.reserva.searchParams.get("text")).toBe(RESERVA_GENERAL);
  // No hace falta el formulario: sigue vacío.
  await expect(page.getByLabel("Nombre completo", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Teléfono", { exact: true })).toHaveValue("");
});

Then("WhatsApp prepara una valoración de {string}", async ({ ctx }, tratamiento) => {
  expect(ctx.reserva.origin + ctx.reserva.pathname).toBe(WHATSAPP);
  expect(ctx.reserva.searchParams.get("text")).toBe(reservaDe(tratamiento));
});

Then("la barra de contacto rápido queda a la vista", async ({ page }) => {
  const barra = barraMovil(page);
  await expect(barra).toBeInViewport();
  await expect(barra.getByRole("link", { name: "Llamar", exact: true })).toHaveAttribute("href", "tel:+527772095094");
  for (const enlace of await barra.getByRole("link").all()) {
    expect((await enlace.boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
});

When("llego al final de la portada", async ({ page }) => {
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
});

Then("puedo acceder a los enlaces legales sin que la barra los cubra", async ({ page }) => {
  const legal = page.getByRole("contentinfo").getByRole("link", { name: "Condiciones de uso", exact: true });
  await expect(legal).toBeInViewport();
  const enlace = await legal.boundingBox();
  const barra = await barraMovil(page).boundingBox();
  expect(enlace.y + enlace.height).toBeLessThanOrEqual(barra.y);
});

Then("la navegación y la reserva caben en la pantalla", async ({ page, $testInfo }) => {
  const ancho = page.viewportSize().width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(ancho);
  const controles = page.getByRole("banner").locator("a:visible, button:visible");
  expect(await controles.count()).toBeGreaterThan(0);
  for (const control of [...(await controles.all()), primeraPantalla(page)]) {
    const caja = await control.boundingBox();
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.x + caja.width).toBeLessThanOrEqual(ancho + 1);
  }
  await expect(primeraPantalla(page)).toBeInViewport();
  if (ancho === 834 || ancho === 1440) {
    await $testInfo.attach(`portada-${ancho}`, {
      body: await page.screenshot({ animations: "disabled" }),
      contentType: "image/png",
    });
  }
});
