import type { SiteContent } from "../content.ts";
import { categories } from "./catalog.ts";
import { legalSeed } from "./legal.ts";
import { archivedPromotions, promotions } from "./promotions.ts";

/** Fecha de publicación inicial de los textos legales. */
export const SEED_LEGAL_DATE = "2026-10-31";

/**
 * Contenido inicial: lo que carga la primera migración de datos y lo que usa `npm run dev` sin base
 * de datos. `today` (AAAA-MM-DD) decide qué promociones se anuncian.
 */
export function seedContent(today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date())): SiteContent {
  return {
    categories,
    promotions,
    archivedPromotions,
    legal: {
      privacidad: { ...legalSeed.privacidad, updatedOn: SEED_LEGAL_DATE },
      condiciones: { ...legalSeed.condiciones, updatedOn: SEED_LEGAL_DATE },
    },
    generatedOn: today,
  };
}
