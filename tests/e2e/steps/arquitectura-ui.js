import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { hidratada, MARCA } from "../support/sitio.js";

const { Given, When, Then } = createBdd();

Then("veo las promociones pasadas con sus condiciones", async ({ page }) => {
  const archive = page.getByRole("region", { name: "Promociones pasadas", exact: true });
  await expect(archive.getByRole("article")).toHaveCount(2);
  await expect(archive.getByText("Promoción pasada · No vigente", { exact: true })).toHaveCount(2);
  const august = archive.getByRole("article", { name: "Agosto de transformación", exact: true });
  for (const percent of [30, 20, 40]) await expect(august.getByText(`${percent}% de descuento`, { exact: true })).toBeVisible();
  const july = archive.getByRole("article", { name: "Julio regalado", exact: true });
  await expect(july.getByText("3×2", { exact: true })).toBeVisible();
  await expect(july.getByText(/en el mismo servicio/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
Then("las promociones pasadas no ofrecen contratar la oferta", async ({ page }) => {
  const archive = page.getByRole("region", { name: "Promociones pasadas", exact: true });
  await expect(archive.getByRole("link", { name: /Consultar|Agendar|Reservar|Apartar/ })).toHaveCount(0);
  const hrefs = await archive.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs.every((href) => href.startsWith("/tratamientos/"))).toBe(true);
});
When("consulto la carboxiterapia desde el archivo", async ({ page }) => {
  await page.getByRole("region", { name: "Promociones pasadas", exact: true })
    .getByRole("article", { name: "Agosto de transformación", exact: true })
    .getByRole("link", { name: "Carboxiterapia", exact: true }).click();
});
Then("no aparece el archivo de promociones en inicio", async ({ page }) => {
  await expect(page.getByRole("region", { name: "Promociones pasadas", exact: true })).toHaveCount(0);
});

Given("que la fecha de la clínica es {string}", async ({ page }, date) => {
  await page.clock.install({ time: new Date(`${date}T18:00:00Z`) });
});
Then("veo Reset Praná con sus sesiones, precio y apartado", async ({ page }) => {
  const offer = page.getByRole("region", { name: "Promociones", exact: true }).getByRole("article", { name: "Reset Praná", exact: true });
  await expect(offer.getByRole("heading", { name: "Reset Praná", exact: true })).toBeVisible();
  await expect(offer.getByText("5 sesiones de aparatología corporal", { exact: true })).toBeVisible();
  await expect(offer.getByText("3 sesiones de carboxiterapia", { exact: true })).toBeVisible();
  await expect(offer.getByText("Valoración corporal", { exact: true })).toBeVisible();
  await expect(offer.getByText("Gratis", { exact: true })).toBeVisible();
  await expect(offer.getByText("$2,490.00", { exact: true })).toBeVisible();
  await expect(offer.getByText("$500.00 MXN", { exact: true })).toBeVisible();
  await expect(offer.getByText("Próximamente · Buen Fin 2026", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
Then("puedo consultar la promoción por WhatsApp", async ({ page }) => {
  const href = await page.getByRole("region", { name: "Promociones", exact: true })
    .getByRole("link", { name: /Consultar Reset Praná/ }).getAttribute("href");
  const url = new URL(href);
  expect(url.origin).toBe("https://wa.me");
  expect(url.searchParams.get("text")).toContain("Reset Praná");
});
Then("la promoción Reset Praná aparece como {string}", async ({ page }, state) => {
  const section = page.getByRole("region", { name: "Promociones", exact: true });
  const offer = section.getByRole("article", { name: "Reset Praná", exact: true });
  if (state === "vencida") {
    await expect(offer).toHaveCount(0);
  } else {
    await expect(offer).toBeVisible();
    await expect(offer.getByText(state === "próxima" ? "Próximamente · Buen Fin 2026" : "Buen Fin 2026", { exact: true })).toBeVisible();
    await expect(offer.getByText("Del 13 de noviembre de 2026 al 17 de noviembre de 2026", { exact: true })).toBeVisible();
  }
});
Then("no hay promociones vigentes y se invita a preguntar", async ({ page }) => {
  const section = page.getByRole("region", { name: "Promociones", exact: true });
  await expect(section.getByRole("article")).toHaveCount(0);
  await expect(section.getByRole("heading", { name: "Muy pronto, nuevas promociones" })).toBeVisible();
});
When("consulto la aparatología incluida en Reset Praná", async ({ page }) => {
  await page.getByRole("region", { name: "Promociones", exact: true })
    .getByRole("link", { name: "Aparatología corporal", exact: true }).click();
});
Then("veo el apartado de Aparatología corporal sin diálogo", async ({ page }) => {
  await expect(page).toHaveURL(/\/tratamientos\/reductivos\/#aparatologia-corporal$/);
  await expect(page.getByRole("article", { name: "Aparatología corporal", exact: true })).toBeInViewport();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

When("consulto Ver paquetes desde las promociones", async ({ page }) => {
  const catalogLink = page.getByRole("region", { name: "Encuentra tu tratamiento" })
    .getByRole("link", { name: /Paquetes y promociones/ });
  const packagesLink = page.getByRole("link", { name: "Ver paquetes", exact: true });
  await expect(packagesLink).toHaveAttribute("href", await catalogLink.getAttribute("href"));
  await packagesLink.click();
});

// ── Tema: el control de la cabecera, la preferencia del sistema y otras pestañas ──
const controlTema = (page, destino) =>
  page.getByRole("banner").getByRole("button", { name: `Cambiar a modo ${destino}`, exact: true });

async function enModo(page, modo) {
  // Un solo control, que ofrece el modo contrario, y la clase del documento.
  await expect(controlTema(page, modo === "oscuro" ? "claro" : "oscuro")).toBeVisible();
  if (modo === "oscuro") await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  else await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
}

Given("que el navegador bloquea el almacenamiento", async ({ context }) => {
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Bloqueado", "SecurityError"); } });
  });
});

When("elijo el modo {word}", async ({ page }, modo) => {
  await hidratada(page);
  await controlTema(page, modo).click();
});
Then("la página está en modo {word}", async ({ page }, modo) => {
  await enModo(page, modo);
});
Then("la elección se conserva al recargar", async ({ page }) => {
  await page.reload();
  await hidratada(page);
  await enModo(page, "oscuro");
});
When("el sistema cambia a modo oscuro", async ({ page }) => {
  await hidratada(page);
  await page.emulateMedia({ colorScheme: "dark" });
});
When("el sistema cambia a modo claro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
});
When("el sistema vuelve a cambiar de claro a oscuro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
});
When("elijo el modo oscuro en otra pestaña", async ({ page, context }) => {
  await hidratada(page);
  const other = await context.newPage();
  await other.goto(page.url());
  await hidratada(other);
  await controlTema(other, "oscuro").click();
});
When("retiro la preferencia desde la otra pestaña", async ({ page, context }) => {
  const other = context.pages().find((item) => item !== page);
  await other.evaluate(() => localStorage.removeItem("prana-tema"));
});

Given("que abro el catálogo de Praná", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Encuentra tu tratamiento" })).toBeVisible();
});
When("consulto los tratamientos reductivos", async ({ page }) => {
  const catalog = page.getByRole("region", { name: "Encuentra tu tratamiento" });
  // La fila móvil incluye el alt de la foto; en escritorio el botón incluye la categoría.
  await catalog.getByRole("link", { name: /Reductivos/ }).click();
});
Then("veo la ficha de Mini Lipo", async ({ page }) => {
  await expect(page).toHaveURL(/\/tratamientos\/reductivos\/$/);
  await expect(page.getByRole("heading", { name: "Mini Lipo", exact: true })).toBeVisible();
});
When("selecciono Cavitación", async ({ page }) => {
  await page.getByRole("navigation", { name: "Tratamientos de esta categoría" }).getByRole("link", { name: "Cavitación", exact: true }).click();
});
Then("veo la ficha de Cavitación", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Cavitación", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#cavitacion$/);
});
Then("puedo solicitar su valoración por WhatsApp", async ({ page }) => {
  const href = await page.getByRole("article", { name: "Cavitación", exact: true }).getByRole("link", { name: /Solicitar valoración/ }).getAttribute("href");
  const url = new URL(href);
  expect(url.origin).toBe("https://wa.me");
  expect(url.searchParams.get("text")).toContain("Cavitación");
});
When("cierro la ficha", async ({ page }) => {
  await page.getByRole("dialog").getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
Then("puedo consultar los tratamientos corporales desde el pie", async ({ page }) => {
  await page.getByRole("contentinfo").getByRole("link", { name: "Corporales", exact: true }).click();
  await expect(page).toHaveURL(/\/tratamientos\/corporales\/$/);
  await expect(page.getByRole("heading", { name: "Carboxiterapia", exact: true })).toBeVisible();
});

Then("la categoría se muestra en una página sin diálogo", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

When("consulto la categoría {string}", async ({ page }, title) => {
  const catalog = page.getByRole("region", { name: "Encuentra tu tratamiento" });
  await catalog.getByRole("link", { name: new RegExp(title) }).click();
});
Then("veo la página de {string} en {string}", async ({ page }, title, path) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  await expect(page).toHaveTitle(`${title} · ${MARCA}`);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Tratamientos de esta categoría" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
Then("puedo recargar y volver al catálogo", async ({ page }) => {
  const url = page.url();
  const title = await page.getByRole("heading", { level: 1 }).textContent();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  await expect(page).toHaveURL(url);
  await page.getByRole("link", { name: "Volver a todos los tratamientos" }).click();
  await expect(page).toHaveURL(/\/#tratamientos$/);
  await expect(page.getByRole("heading", { name: "Encuentra tu tratamiento" })).toBeVisible();
});
Given("que abro directamente {string}", async ({ page }, path) => {
  await page.goto(path);
});
Then("veo el apartado de Cavitación y puedo regresar con el navegador", async ({ page }) => {
  const article = page.getByRole("article", { name: "Cavitación", exact: true });
  await expect(article).toBeInViewport();
  await expect(article).toBeFocused();
  await expect(article).toHaveCSS("outline-style", "none");
  await page.getByRole("link", { name: "Volver a todos los tratamientos" }).click();
  await expect(page).toHaveURL(/\/#tratamientos$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/tratamientos\/reductivos\/#cavitacion$/);
  await expect(page.getByRole("heading", { name: "Cavitación", exact: true })).toBeVisible();
});
Then("la cabecera permite volver a contacto en inicio", async ({ page }) => {
  const menu = page.getByRole("button", { name: "Abrir menú", exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole("navigation", { name: "Principal (móvil)", exact: true }).getByRole("link", { name: "Contacto", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Contacto", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/#contacto$/);
  await expect(page.getByRole("heading", { name: "Tu cuidado empieza aquí" })).toBeVisible();
});
When("consulto Promociones desde el menú principal", async ({ page }) => {
  const menu = page.getByRole("button", { name: "Abrir menú", exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole("navigation", { name: "Principal (móvil)", exact: true }).getByRole("link", { name: "Promociones", exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Promociones", exact: true }).click();
  }
});
Then("veo una página no encontrada con regreso al catálogo", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todos los tratamientos" })).toHaveAttribute("href", "/#tratamientos");
});

When("consulto Cavitación desde los beneficios", async ({ page }) => {
  await page.getByRole("link", { name: "Reducción de medidas", exact: true }).click();
  await expect(page).toHaveURL(/\/beneficios\/reduccion-medidas\/$/);
  await page.getByRole("article", { name: "Cavitación", exact: true }).getByRole("link", { name: /Conocer tratamiento/ }).click();
});
Then("veo el apartado de Cavitación desde su objetivo", async ({ page }) => {
  await expect(page).toHaveURL(/\/tratamientos\/reductivos\/#cavitacion$/);
  await expect(page.getByRole("article", { name: "Cavitación", exact: true })).toBeInViewport();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

When("consulto el objetivo {string}", async ({ page }, title) => {
  const section = page.getByRole("region", { name: "Objetivos que te acompañamos a cuidar" });
  await expect(section.getByRole("link")).toHaveCount(5);
  await section.getByRole("link", { name: title, exact: true }).click();
});
Then("veo el objetivo {string} en {string} con {int} tratamientos", async ({ page }, title, path, count) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  await expect(page).toHaveTitle(`${title} · ${MARCA}`);
  await expect(page.getByRole("region", { name: "Tratamientos relacionados" }).getByRole("article")).toHaveCount(count);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const href = await page.getByRole("main").getByRole("link", { name: /Agenda tu valoración/ }).getAttribute("href");
  expect(new URL(href).searchParams.get("text")).toContain(title);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
});
Then("puedo volver a la franja de objetivos", async ({ page }) => {
  await page.getByRole("link", { name: "Volver a todos los objetivos" }).click();
  await expect(page).toHaveURL(/\/#beneficios$/);
  await expect(page.getByRole("region", { name: "Objetivos que te acompañamos a cuidar" })).toBeInViewport();
});
When("abro Bienestar integral con el teclado", async ({ page }) => {
  const link = page.getByRole("link", { name: "Bienestar integral", exact: true });
  await link.focus();
  await link.press("Enter");
});
Then("veo la página de Bienestar integral", async ({ page }) => {
  await expect(page).toHaveURL(/\/beneficios\/bienestar-integral\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Bienestar integral", exact: true })).toBeVisible();
});

When("pasa el tiempo de una diapositiva", async ({ page }) => {
  await page.clock.runFor(8000);
});
Then("la portada muestra Reset Praná", async ({ page }) => {
  await expect(page.locator("#inicio").getByRole("heading", { name: /Reset Praná/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Tu bienestar/ })).toBeHidden();
  // Portada, Reset Praná y los dos paquetes de carboxiterapia.
  await expect(page.getByRole("button", { name: /^Ir a la diapositiva/ })).toHaveCount(4);
});
When("pulso la promoción de la portada", async ({ page }) => {
  await page.locator("#inicio").getByText(/Paquete de bienestar/).click();
});
Then("la portada sigue en Reset Praná con el carrusel detenido", async ({ page }) => {
  await expect(page.locator("#inicio").getByRole("heading", { name: /Reset Praná/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reanudar el carrusel", exact: true })).toBeVisible();
});
