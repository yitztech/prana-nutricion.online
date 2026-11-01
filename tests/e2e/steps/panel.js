// Pasos de features/editor/: el panel del editor en su dominio (adminURL), contra el compose de pruebas.
import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import sharp from "sharp";
import { Given, When, Then } from "./fixtures.js";
import { adminURL, baseURL, teclado } from "../support/entorno.js";
import { correoPara, esperarSitio, liberarRecuperacion, nuevaCuenta } from "../support/editor.js";

const editor = (ruta) => new URL(ruta, adminURL).href;
const sitio = (ruta) => new URL(ruta, baseURL).href;
const escribir = (locator, texto) => (teclado ? locator.pressSequentially(texto, { delay: teclado }) : locator.fill(texto));

async function entrar(page, { email, password }) {
  await page.goto(editor("/entrar"));
  await escribir(page.getByLabel("Correo"), email);
  await escribir(page.getByLabel("Contraseña", { exact: true }), password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

// ── Acceso ───────────────────────────────────────────────────────

Given("que tengo una cuenta del editor", async ({ ctx }) => {
  ctx.cuenta = await nuevaCuenta("Ana Prueba");
});

Given("que entré al editor", async ({ page, ctx }) => {
  ctx.cuenta = await nuevaCuenta("Ana Prueba");
  await entrar(page, ctx.cuenta);
  await expect(page.getByRole("heading", { level: 1, name: /Hola/ })).toBeVisible();
});

When("entro al editor", async ({ page, ctx }) => {
  await entrar(page, ctx.cuenta);
});

When("entro al editor con una contraseña equivocada", async ({ page, ctx }) => {
  await entrar(page, { ...ctx.cuenta, password: "no-es-la-contraseña" });
});

Then("veo la pantalla para entrar", async ({ page }) => {
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole("heading", { level: 1, name: "Editor del sitio" })).toBeVisible();
  await expect(page.getByLabel("Correo")).toBeVisible();
});

Then("veo el inicio del editor con mi nombre", async ({ page, ctx }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Hola, ${ctx.cuenta.nombre.split(" ")[0]}`);
  await expect(page.getByRole("navigation", { name: "Secciones del editor" })).toBeVisible();
  await expect(page.getByText(/Última publicación|Publicando/)).toBeVisible();
});

When("cierro la sesión", async ({ page }) => {
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
});

Then("el editor avisa {string}", async ({ page }, texto) => {
  await expect(page.getByRole("alert").filter({ hasText: texto }).or(page.getByText(texto)).first()).toBeVisible();
});

Then("el campo {string} avisa {string}", async ({ page }, campo, texto) => {
  const control = page.getByLabel(campo, { exact: true });
  await expect(control).toHaveAttribute("aria-invalid", "true");
  await expect(control).toHaveAccessibleDescription(new RegExp(texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

When("pido un enlace para restablecer mi contraseña", async ({ page, ctx }) => {
  await liberarRecuperacion();
  await page.goto(editor("/entrar"));
  await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
  await escribir(page.getByLabel("Correo"), ctx.cuenta.email);
  await page.getByRole("button", { name: "Enviar el enlace" }).click();
  await expect(page.getByRole("status").filter({ hasText: "te enviamos un enlace" })).toBeVisible();
});

When("abro el enlace del correo y elijo una contraseña nueva", async ({ page, ctx }) => {
  const correo = await correoPara(ctx.cuenta.email, /Restablece/);
  const enlace = correo.Text.match(/https?:\/\/\S+\/restablecer#token=[\w-]{43}/)?.[0];
  expect(enlace, "el correo lleva el enlace al dominio del editor").toBeTruthy();
  // El correo enlaza al ADMIN_URL de la app; en local es el mismo destino que adminURL.
  await page.goto(editor(new URL(enlace).pathname + new URL(enlace).hash));
  ctx.nueva = `nueva clave ${randomUUID().slice(0, 8)}`;
  await escribir(page.getByLabel("Contraseña nueva", { exact: true }), ctx.nueva);
  await escribir(page.getByLabel("Repite la contraseña", { exact: true }), ctx.nueva);
  await page.getByRole("button", { name: "Guardar la contraseña" }).click();
  await expect(page.getByRole("status").filter({ hasText: "tu contraseña cambió" })).toBeVisible();
  await expect(page).not.toHaveURL(/token=/);
});

Then("puedo entrar con la contraseña nueva", async ({ page, ctx }) => {
  await entrar(page, { ...ctx.cuenta, password: ctx.nueva });
  await expect(page.getByRole("heading", { level: 1, name: /Hola/ })).toBeVisible();
});

When("cambio mi contraseña", async ({ page, ctx }) => {
  await page.getByRole("link", { name: "Tu cuenta" }).click();
  ctx.nueva = `nueva clave ${randomUUID().slice(0, 8)}`;
  await escribir(page.getByLabel("Contraseña actual", { exact: true }), ctx.cuenta.password);
  await escribir(page.getByLabel("Contraseña nueva", { exact: true }), ctx.nueva);
  await escribir(page.getByLabel("Repite la contraseña nueva", { exact: true }), ctx.nueva);
  await page.getByRole("button", { name: "Cambiar la contraseña" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Contraseña cambiada" })).toBeVisible();
});

// ── Tratamientos ─────────────────────────────────────────────────

async function abrirCategoria(page, titulo) {
  await page.getByRole("navigation", { name: "Secciones del editor" }).getByRole("link", { name: "Tratamientos" }).click();
  await page.getByRole("link", { name: new RegExp(`^${titulo}`) }).click();
  await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  return new URL(page.url()).pathname.split("/").pop();
}

When("añado un tratamiento a la categoría {string}", async ({ page, ctx }, titulo) => {
  ctx.categoria = await abrirCategoria(page, titulo);
  ctx.tratamiento = `Tratamiento de prueba ${randomUUID().slice(0, 8)}`;
  await page.getByRole("button", { name: "Añadir un tratamiento" }).click();
  const form = page.getByRole("form", { name: "Nuevo tratamiento" });
  await escribir(form.getByLabel("Nombre"), ctx.tratamiento);
  await escribir(form.getByLabel("Descripción", { exact: true }), "Descripción creada por las pruebas automáticas.");
  await form.getByRole("button", { name: "Añadir el tratamiento" }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${ctx.tratamiento}» se añadió` })).toBeVisible();
});

Then("el tratamiento aparece en su página del sitio", async ({ ctx }) => {
  await esperarSitio(sitio(`/tratamientos/${ctx.categoria}/`), ctx.tratamiento);
});

When("cambio la descripción del tratamiento", async ({ page, ctx }) => {
  ctx.descripcion = `Descripción editada ${randomUUID().slice(0, 8)}.`;
  await page.getByRole("button", { name: `Editar «${ctx.tratamiento}»` }).click();
  const form = page.getByRole("form", { name: `Editar «${ctx.tratamiento}»` });
  await form.getByLabel("Descripción", { exact: true }).fill("");
  await escribir(form.getByLabel("Descripción", { exact: true }), ctx.descripcion);
  await form.getByRole("button", { name: "Guardar el tratamiento" }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${ctx.tratamiento}» se guardó` })).toBeVisible();
});

Then("la descripción nueva aparece en su página del sitio", async ({ ctx }) => {
  await esperarSitio(sitio(`/tratamientos/${ctx.categoria}/`), ctx.descripcion);
});

When("borro el tratamiento", async ({ page, ctx }) => {
  await page.getByRole("button", { name: `Borrar «${ctx.tratamiento}»` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Borrar el tratamiento" }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${ctx.tratamiento}» se borró` })).toBeVisible();
});

Then("el tratamiento desaparece de su página del sitio", async ({ ctx }) => {
  await esperarSitio(sitio(`/tratamientos/${ctx.categoria}/`), ctx.tratamiento, { presente: false });
});

When("dejo vacío el título de la categoría {string} y la guardo", async ({ page }, titulo) => {
  await abrirCategoria(page, titulo);
  await page.getByLabel("Título", { exact: true }).fill("");
  await page.getByRole("button", { name: "Guardar la categoría" }).click();
});

// ── Promociones ──────────────────────────────────────────────────

/** Foto de prueba en el formato que pide el editor (3:2, al menos 1536 × 1024). */
const foto = () => sharp({ create: { width: 1600, height: 1067, channels: 3, background: { r: 236, g: 72, b: 153 } } }).jpeg().toBuffer();

async function nuevaPromocion(page) {
  await page.getByRole("navigation", { name: "Secciones del editor" }).getByRole("link", { name: "Promociones" }).click();
  await page.getByRole("link", { name: "Nueva promoción" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Nueva promoción" })).toBeVisible();
}

When("creo una promoción visible con una imagen subida", async ({ page, ctx }) => {
  ctx.promocion = `Promo de prueba ${randomUUID().slice(0, 8)}`;
  await nuevaPromocion(page);
  await page.getByLabel("Último día", { exact: true }).fill("2099-12-31");
  await escribir(page.getByLabel("Nombre", { exact: true }), ctx.promocion);
  await escribir(page.getByLabel("Descripción", { exact: true }), "Una promoción creada por las pruebas automáticas.");
  await escribir(page.getByRole("textbox", { name: /^Precio/ }), "1,499.50");
  await page.locator('input[type="file"]').setInputFiles({ name: "promo.jpg", mimeType: "image/jpeg", buffer: await foto() });
  await expect(page.getByRole("img", { name: "Vista previa de la imagen" })).toHaveAttribute("src", /\/uploads\/promociones\/[0-9a-f-]{36}-1024\.webp$/, { timeout: 20_000 });
  await escribir(page.getByLabel("Descripción de la imagen", { exact: true }), "Fondo rosa liso de prueba");
  await escribir(page.getByLabel("Texto del botón", { exact: true }), "Consultar promoción");
  await page.getByRole("button", { name: "Crear la promoción" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Promoción creada" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(ctx.promocion);
});

Then("la promoción aparece en la portada del sitio", async ({ ctx }) => {
  await esperarSitio(sitio("/"), ctx.promocion);
});

When("borro la promoción", async ({ page }) => {
  await page.getByRole("button", { name: "Borrar", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Borrar la promoción" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Promociones" })).toBeVisible();
});

Then("la promoción desaparece de la portada del sitio", async ({ ctx }) => {
  await esperarSitio(sitio("/"), ctx.promocion, { presente: false });
});

When("intento crear una promoción solo con el nombre", async ({ page }) => {
  await nuevaPromocion(page);
  await escribir(page.getByLabel("Nombre", { exact: true }), "Promoción incompleta");
  await page.getByRole("button", { name: "Crear la promoción" }).click();
});

// ── Documentos legales ───────────────────────────────────────────

When("abro el documento {string}", async ({ page }, nombre) => {
  await page.getByRole("navigation", { name: "Secciones del editor" }).getByRole("link", { name: nombre }).click();
  await expect(page.getByRole("heading", { level: 1, name: nombre })).toBeVisible();
});

Then("veo su texto con la barra de formato", async ({ page }) => {
  const toolbar = page.getByRole("toolbar", { name: "Formato del texto" });
  for (const boton of ["Título de sección", "Negrita", "Lista", "Enlace"]) await expect(toolbar.getByRole("button", { name: boton, exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Texto" })).toContainText(/\S{20,}/);
});

When("dejo vacío su título y lo guardo", async ({ page }) => {
  await page.getByLabel("Título", { exact: true }).fill("");
  await page.getByRole("button", { name: "Guardar y publicar" }).click();
});
