import { test as base, createBdd } from "playwright-bdd";
import { pausa } from "../support/entorno.js";

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
