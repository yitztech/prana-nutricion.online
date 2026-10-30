import type { Promotion } from "../types";

/**
 * Promociones administrables. Solo se publican las que están `active` y dentro de su vigencia.
 * Hoy no hay ninguna confirmada por la clínica: la sección muestra su estado alternativo.
 *
 * Ejemplo de entrada:
 * {
 *   id: "reset-noviembre",
 *   name: "Reset Praná",
 *   description: "…",
 *   treatments: [{ categoryId: "promociones", slug: "reset-prana" }],
 *   priceCents: 150000,
 *   discountPercent: 15,
 *   startsOn: "2026-11-01",
 *   endsOn: "2026-11-30",
 *   status: "active",
 *   image: "/img/paquetes-promociones-640.webp",
 *   imageAlt: "…",
 *   cta: { label: "Quiero esta promoción", treatment: "la promoción Reset Praná" },
 * }
 */
export const promotions: Promotion[] = [];

export const PROMOTIONS_TIME_ZONE = "America/Mexico_City";

/** Fecha de hoy (AAAA-MM-DD) en la zona de la clínica. */
export function todayInClinic(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PROMOTIONS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Promociones activas y vigentes en `today`, las que terminan antes primero. */
export function activePromotions(list: readonly Promotion[], today: string) {
  return list
    .filter((p) => p.status === "active" && (!p.startsOn || p.startsOn <= today) && today <= p.endsOn)
    .sort((a, b) => a.endsOn.localeCompare(b.endsOn));
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
}

/** «30 de noviembre de 2026» a partir de AAAA-MM-DD, sin desplazamientos de zona horaria. */
export function formatDay(day: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}
