import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures.js";

async function openBooking(page, ctx, link) {
  // Interceptar la navegación externa: la prueba nunca contacta con WhatsApp ni envía mensajes.
  await page.context().route("https://wa.me/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>WhatsApp de prueba</title>",
    }),
  );
  const opened = page.waitForEvent("popup");
  await link.click();
  const popup = await opened;
  await popup.waitForLoadState("domcontentloaded");
  ctx.bookingUrl = popup.url();
  await popup.close();
}

Given("que abro la portada sin su JavaScript", async ({ page }) => {
  await page.route("**/assets/main*.js", (route) => route.abort());
  await page.goto("/");
});

Then(
  "la primera pantalla ofrece agendar mi valoración",
  async ({ page, $testInfo }) => {
    await page.evaluate(() => document.fonts.ready);
    const link = page.locator('[data-reserva="hero"]');
    await expect(link).toHaveAccessibleName("Agendar mi valoración");
    await expect(link).toBeInViewport();
    await expect(
      page.getByText("Por WhatsApp. Confirmamos contigo día y hora."),
    ).toBeVisible();
    await $testInfo.attach("portada-viewport", {
      body: await page.screenshot({ animations: "disabled" }),
      contentType: "image/png",
    });
    for (const image of await page.locator("#servicios img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image) => image.decode());
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await $testInfo.attach("portada-completa", {
      body: await page.screenshot({ fullPage: true, animations: "disabled" }),
      contentType: "image/png",
    });
  },
);

When("abro la reserva rápida de {string}", async ({ page, ctx }, placement) => {
  await openBooking(page, ctx, page.locator(`[data-reserva="${placement}"]`));
});

When("agendo una valoración de {string}", async ({ page, ctx }, service) => {
  await openBooking(
    page,
    ctx,
    page.getByRole("link", {
      name: `Agendar valoración de ${service}`,
      exact: true,
    }),
  );
});

Then(
  "WhatsApp prepara una valoración sin datos obligatorios",
  async ({ page, ctx }) => {
    const url = new URL(ctx.bookingUrl);
    expect(url.origin + url.pathname).toBe("https://wa.me/527772095094");
    expect(url.searchParams.get("text")).toBe(
      "¡Hola Prana! Quisiera agendar una valoración. ¿Qué horarios tienen disponibles?",
    );
    await expect(page.locator("#wa-nombre")).toHaveValue("");
    await expect(page.locator("#wa-telefono")).toHaveValue("");
  },
);

Then(
  "WhatsApp prepara una valoración de {string}",
  async ({ ctx }, service) => {
    const url = new URL(ctx.bookingUrl);
    expect(url.origin + url.pathname).toBe("https://wa.me/527772095094");
    expect(url.searchParams.get("text")).toBe(
      `¡Hola Prana! Quisiera agendar una valoración de ${service}. ¿Qué horarios tienen disponibles?`,
    );
  },
);

Then("la barra de reserva móvil queda a la vista", async ({ page }) => {
  const link = page.locator('[data-reserva="mobile"]');
  await expect(link).toBeInViewport();
  const box = await link.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});

When("llego al final de la portada", async ({ page }) => {
  await page.locator("footer").scrollIntoViewIfNeeded();
});

Then(
  "puedo acceder a los enlaces legales sin que la barra los cubra",
  async ({ page }) => {
    const legal = page
      .locator("footer")
      .getByRole("link", { name: "Condiciones de uso" });
    await legal.scrollIntoViewIfNeeded();
    const bounds = await legal.boundingBox();
    const bar = await page.locator(".mobile-booking").boundingBox();
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(bar.y);
    await expect(legal).toBeInViewport();
  },
);

Given(
  "que abro la portada con un ancho de {int} píxeles",
  async ({ page }, width) => {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
  },
);

Then(
  "la navegación y la reserva caben en la pantalla",
  async ({ page, $testInfo }) => {
    const width = page.viewportSize().width;
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const control of await page
      .locator(
        '#navegacion a:visible, #menu-boton:visible, [data-reserva="hero"]',
      )
      .all()) {
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }
    await expect(page.locator('[data-reserva="hero"]')).toBeInViewport();
    if (width === 834 || width === 1440) {
      await $testInfo.attach(`portada-${width}`, {
        body: await page.screenshot({ animations: "disabled" }),
        contentType: "image/png",
      });
    }
  },
);
