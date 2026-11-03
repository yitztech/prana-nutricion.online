import { expect } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";
import { pausa } from "../support/entorno.js";

/**
 * WebKit avisa de un style-src-attr en cualquier <select> de una página cuya CSP no admite 'unsafe-inline',
 * aunque la página no lleve ningún estilo (reproducido con un <select> suelto): es su propio menú y se ve igual
 * (comprobado con capturas). Como origen da el HTML o el script que creó el <select>. Solo se descarta si el
 * <select> no tiene atributo style: uno escrito por la página seguiría contando.
 */
export const delNavegador = (v) => v.directiva === "style-src-attr" && v.etiqueta === "SELECT" && v.estilo === null;

/** Playwright, en WebKit, inserta su propio <style> en cada page.screenshot(): es de la herramienta, no del sitio. */
const deLaCaptura = (v) => v.durante === "captura" && v.directiva === "style-src-elem" && !v.origen;
const ajenas = (v) => delNavegador(v) || deLaCaptura(v);

export const test = base.extend({
  /** Estado compartido entre los pasos de un mismo escenario. */
  ctx: async ({}, use) => use({}),
  /** @pendiente es la única forma de saltar un escenario (AGENTS.md §36): el motivo va en su comentario. */
  pendiente: [
    async ({}, use, testInfo) => {
      testInfo.skip(testInfo.tags.includes("@pendiente"), "Pendiente: el motivo está en el comentario del escenario");
      await use();
    },
    { auto: true },
  ],
  /**
   * Infracciones de la CSP en todas las páginas del escenario, también tras navegar o en ventanas nuevas: un
   * estilo o script bloqueado no siempre se nota a la vista (p. ej. el bloqueo del desplazamiento del menú).
   */
  cspInfracciones: [
    async ({ context, page }, use) => {
      const infracciones = [];
      let capturas = 0;
      await context.exposeBinding("__informarCsp", ({ page: origen }, v) => {
        infracciones.push({ ...v, pagina: origen.url(), durante: capturas > 0 ? "captura" : null });
      });
      // Las capturas se marcan hasta que la página ha entregado sus avisos: la ida y vuelta de evaluate llega
      // después de los mensajes que la página envió antes.
      const capturar = page.screenshot.bind(page);
      page.screenshot = async (opciones) => {
        capturas++;
        try {
          const imagen = await capturar(opciones);
          await page.evaluate(() => new Promise((listo) => setTimeout(listo, 50))).catch(() => {});
          return imagen;
        } finally {
          capturas--;
        }
      };
      await context.addInitScript(() => {
        document.addEventListener("securitypolicyviolation", (e) => window.__informarCsp?.({
          directiva: e.violatedDirective, bloqueado: e.blockedURI, origen: e.sourceFile, etiqueta: e.target?.tagName ?? null,
          estilo: e.target?.getAttribute?.("style") ?? null }));
      });
      await use(infracciones);
      expect(infracciones.filter((v) => !ajenas(v)), "infracciones de la política de contenido").toEqual([]);
    },
    { auto: true },
  ],
  /** Con E2E_PAUSA, deja el resultado a la vista unos segundos antes de cerrar el escenario. */
  verResultado: [
    async ({ page }, use) => {
      await use();
      if (pausa) await page.waitForTimeout(pausa);
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
