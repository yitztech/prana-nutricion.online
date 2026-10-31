// Datos y esperas comunes de los escenarios del sitio.
import { expect } from "@playwright/test";

/** Marca del sitio: sufijo de los títulos (web/src/site/routes.ts, BRAND). */
export const MARCA = "Praná: Nutrición y Bienestar";
export const WHATSAPP = "https://wa.me/527772095094";
export const RESERVA_GENERAL = "¡Hola Praná! Quisiera agendar una valoración. ¿Qué horarios tienen disponibles?";
export const reservaDe = (servicio) =>
  `¡Hola Praná! Quisiera agendar una valoración de ${servicio}. ¿Qué horarios tienen disponibles?`;

/** Espera a que React atienda la página (Root marca <html data-hidratado>) antes de interactuar. */
export async function hidratada(page) {
  await expect(page.locator("html")).toHaveAttribute("data-hidratado", "");
}
