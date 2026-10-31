import type { ArchivedPromotion, Promotion } from "../content.ts";

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
  name: "Carboxiterapia",
  tagline: "Pagas 1 y te llevas 3",
  description: "Promoción de carboxiterapia con la mecánica de pagar 1 y llevarte 3.",
  treatments: [{ categoryId: "corporales", slug: "carboxiterapia" }],
  priceCents: 623900,
  endsOn: "2026-11-30",
  status: "active",
  image: "/img/tratamientos-corporales-1024.webp",
  imageAlt: "Especialista con guantes rosas aplicando aparatología corporal",
  cta: { label: "Consultar promoción", treatment: "Carboxiterapia · Pagas 1 y te llevas 3 por $6,239" },
}];

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
