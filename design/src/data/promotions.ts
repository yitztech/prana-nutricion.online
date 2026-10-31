import type { ArchivedPromotion, Promotion } from "../types";

/** Contenido confirmado por la clínica. Buen Fin 2026: del 13 al 17 de noviembre; los paquetes de carboxiterapia, hasta el 30. */
export const promotions: Promotion[] = [{
  id: "reset-prana-buen-fin-2026",
  name: "Reset Praná",
  campaign: "Buen Fin 2026",
  tagline: "Vuelve a ti",
  description: "Paquete de bienestar con aparatología corporal y carboxiterapia, más valoración corporal gratis.",
  includes: [
    { quantity: 5, label: "sesiones de aparatología corporal", icon: "aparatologia-corporal" },
    { quantity: 3, label: "sesiones de carboxiterapia", icon: "carboxiterapia" },
    { label: "Valoración corporal", icon: "valoracion-personalizada", free: true },
  ],
  treatments: [
    { categoryId: "reductivos", slug: "aparatologia-corporal" },
    { categoryId: "corporales", slug: "carboxiterapia" },
  ],
  priceCents: 249000,
  depositCents: 50000,
  reservationNote: "Aparta con $500 y congela tu promoción.",
  startsOn: "2026-11-13",
  endsOn: "2026-11-17",
  status: "active",
  image: "/img/tratamientos-reductivos-1024.webp",
  imageAlt: "Abdomen de una mujer con una cinta métrica rosa",
  cta: { label: "Consultar Reset Praná", treatment: "Reset Praná del Buen Fin: paquete de $2,490 con apartado de $500" },
}, {
  id: "paquete-carboxiterapia-6-sesiones",
  name: "Paquete de carboxiterapia",
  description: "Paquete de 6 sesiones de carboxiterapia.",
  includes: [{ quantity: 6, label: "sesiones de carboxiterapia", icon: "carboxiterapia" }],
  treatments: [{ categoryId: "corporales", slug: "carboxiterapia" }],
  priceCents: 458900,
  endsOn: "2026-11-30",
  status: "active",
  image: "/img/tratamientos-reductivos-1024.webp",
  imageAlt: "Abdomen de una mujer con una cinta métrica rosa",
  cta: { label: "Consultar paquete", treatment: "Paquete de carboxiterapia: 6 sesiones por $4,589" },
}, {
  id: "carboxiterapia-pagas-1-llevas-3",
  name: "Carboxiterapia · Pagas 1 y te llevas 3",
  description: "Promoción de carboxiterapia: pagas 1 y te llevas 3.",
  treatments: [{ categoryId: "corporales", slug: "carboxiterapia" }],
  priceCents: 623900,
  endsOn: "2026-11-30",
  status: "active",
  image: "/img/tratamientos-corporales-1024.webp",
  imageAlt: "Especialista con guantes rosas aplicando aparatología corporal",
  cta: { label: "Consultar promoción", treatment: "Carboxiterapia · Pagas 1 y te llevas 3 por $6,239" },
}];

export const PROMOTIONS_TIME_ZONE = "America/Mexico_City";

/** Ofertas pasadas aportadas por la clínica. Las imágenes no indican años ni fechas completas. */
export const archivedPromotions: ArchivedPromotion[] = [
  {
    id: "archivo-agosto-transformacion",
    status: "archived",
    name: "Agosto de transformación",
    periodLabel: "Agosto",
    description: "Descuentos históricos en Mini Lipo, carboxiterapia y depilación láser de cuerpo completo.",
    discounts: [
      { label: "Mini Lipo", percent: 30 },
      { label: "Carboxiterapia", percent: 20 },
      { label: "Depilación láser · cuerpo completo", percent: 40 },
    ],
    treatments: [
      { categoryId: "reductivos", slug: "mini-lipo" },
      { categoryId: "corporales", slug: "carboxiterapia" },
      { categoryId: "depilacion-laser", slug: "depilacion-cuerpo-completo" },
    ],
    image: "/img/depilacion-laser-1024.webp",
    imageAlt: "Sesión de depilación láser en las piernas",
  },
  {
    id: "archivo-julio-regalado",
    status: "archived",
    name: "Julio regalado",
    periodLabel: "Julio",
    offerLabel: "3×2",
    tagline: "Regálate bienestar",
    description: "Paquete bienestar: pagabas 2 y te llevabas 3 en el mismo servicio. El tercer servicio se incluía de regalo.",
    treatments: [],
    image: "/img/paquetes-promociones-1024.webp",
    imageAlt: "Mujer sonriente en la clínica Praná",
  },
];

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

/** Se anuncian con fecha explícita, sin presentarlas como disponibles antes del inicio. */
export function upcomingPromotions(list: readonly Promotion[], today: string) {
  return list
    .filter((p) => p.status === "active" && p.startsOn !== undefined && today < p.startsOn && p.startsOn <= p.endsOn)
    .sort((a, b) => a.startsOn!.localeCompare(b.startsOn!));
}

/** Lo que se anuncia: primero las vigentes y después las próximas. */
export function visiblePromotions(list: readonly Promotion[], today: string) {
  return [...activePromotions(list, today), ...upcomingPromotions(list, today)];
}

export function isUpcoming(promotion: Promotion, today: string) {
  return promotion.startsOn !== undefined && today < promotion.startsOn;
}

/** «Del 13 de noviembre de 2026 al 17 de noviembre de 2026» o «Hasta el …». */
export function promotionPeriod(promotion: Promotion) {
  return promotion.startsOn
    ? `Del ${formatDay(promotion.startsOn)} al ${formatDay(promotion.endsOn)}`
    : `Hasta el ${formatDay(promotion.endsOn)}`;
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
