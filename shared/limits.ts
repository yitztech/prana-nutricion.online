/**
 * Longitudes máximas (AGENTS.md §6.3), en caracteres Unicode. Un solo sitio: de aquí las toman el
 * formulario público, el admin, el servidor y sus mensajes. tests/db comprueba que coinciden con la base
 * de datos. Los textos del contenido usan límites propios del contrato (más cortos que los genéricos)
 * para que ninguna tarjeta ni ficha se desborde.
 */
export const limits = {
  contact: { name: 50, phone: 20, message: 2000 },
  admin: { email: 254, name: 50, password: 128 },
  legal: { title: 150, text: 50_000, nodes: 2_000, href: 2048 },
  category: { title: 60, description: 300, photoAlt: 255, cta: 40, benefit: 200 },
  treatment: { slug: 80, name: 60, description: 600 },
  promotion: {
    slug: 80,
    name: 80,
    campaign: 60,
    tagline: 80,
    description: 400,
    reservationNote: 200,
    imageAlt: 255,
    ctaLabel: 40,
    ctaTreatment: 200,
    periodLabel: 60,
    offerLabel: 40,
    includeLabel: 80,
    discountLabel: 80,
  },
  /** Motivo de una publicación del sitio: lo compone el servidor (acción e identificador). */
  publication: { reason: 255 },
} as const;

/** Máximo de elementos de cada lista (§6.3). */
export const listLimits = {
  categoryBenefits: 6,
  treatmentsPerCategory: 30,
  promotionIncludes: 8,
  promotionDiscounts: 8,
  promotionTreatments: 10,
  promotions: 50,
} as const;

/** Rangos numéricos. El dinero, en centavos de MXN (§21). */
export const ranges = {
  priceCents: { min: 0, max: 100_000_000 },
  quantity: { min: 1, max: 99 },
  percent: { min: 1, max: 100 },
} as const;

export const passwordPolicy = { minLength: 12, maxLength: limits.admin.password, maxBytes: 128 } as const;

/**
 * Imágenes de las promociones: el mismo formato que las fotos actuales del sitio (3:2 horizontal,
 * declaradas a 1536 × 1024). Se recortan al centro de interés si la proporción no coincide.
 */
export const promotionImage = {
  types: ["image/jpeg", "image/png", "image/webp"],
  extensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 8 * 1024 * 1024,
  minWidth: 1536,
  minHeight: 1024,
  aspect: { width: 3, height: 2 },
  widths: [640, 1024, 1536],
} as const;

/** Cuenta caracteres Unicode, no unidades UTF-16 (§6.3). */
export function charLength(value: string) {
  let count = 0;
  for (const _ of value) count++;
  return count;
}

/** Quita los espacios de los extremos y junta los repetidos (§6.2). */
export function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
