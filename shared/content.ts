/**
 * Contenido del sitio: lo que el admin edita y el generador convierte en HTML estático.
 * Sin dependencias de React ni del servidor.
 */
import type { IconName } from "./icons.ts";

export type { IconName } from "./icons.ts";

export type Highlight = { icon: IconName; label: string };

export type Treatment = {
  slug: string;
  name: string;
  icon: IconName;
  description: string;
};

export type Category = {
  id: string;
  title: string;
  description: string;
  /** Prefijo de public/img/<photo>-640.webp y -1024.webp */
  photo: string;
  photoAlt: string;
  icon: IconName;
  cta: string;
  benefits: string[];
  treatments: Treatment[];
};

/** Un tratamiento concreto, o la categoría entera si no hay `slug`. */
export type TreatmentRef = { categoryId: string; slug?: string };

export type Benefit = {
  id: string;
  icon: IconName;
  title: string;
  treatments: TreatmentRef[];
};

export type PromotionInclude = { quantity?: number; label: string; icon: IconName; free?: boolean };

export type Promotion = {
  id: string;
  name: string;
  description: string;
  campaign?: string;
  tagline?: string;
  includes?: PromotionInclude[];
  treatments: TreatmentRef[];
  /** Precio en centavos de MXN. Sin él, no se muestra precio. */
  priceCents?: number;
  depositCents?: number;
  reservationNote?: string;
  /** Descuento en porcentaje (1–100). */
  discountPercent?: number;
  /** Vigencia como AAAA-MM-DD, en la hora de Cuautla; `endsOn` es el último día incluido. */
  startsOn?: string;
  endsOn: string;
  status: "active" | "inactive";
  /** Ruta pública de la imagen (3:2), p. ej. /img/x-1024.webp o /uploads/promociones/<id>-1024.webp */
  image: string;
  /** Variantes por ancho, si las hay (`srcset`). */
  imageSrcSet?: string;
  imageAlt: string;
  cta: { label: string; treatment?: string };
};

/** Archivo informativo: sin fechas inventadas ni acción para contratar una oferta vencida. */
export type ArchivedPromotion = Omit<Promotion, "startsOn" | "endsOn" | "status" | "cta"> & {
  status: "archived";
  periodLabel?: string;
  offerLabel?: string;
  discounts?: { label: string; percent: number }[];
};

// ── Texto enriquecido de los documentos legales ─────────────────────────────
// Subconjunto del JSON de Tiptap: se guarda como datos, nunca como HTML, y la web lo dibuja con React.

export type RichMark = { type: "bold" } | { type: "italic" } | { type: "link"; attrs: { href: string } };
export type RichInline = { type: "text"; text: string; marks?: RichMark[] } | { type: "hardBreak" };
export type RichParagraph = { type: "paragraph"; content?: RichInline[] };
export type RichHeading = { type: "heading"; attrs: { level: 2 | 3 }; content?: RichInline[] };
export type RichListItem = { type: "listItem"; content: (RichParagraph | RichList)[] };
export type RichList =
  | { type: "bulletList"; content: RichListItem[] }
  | { type: "orderedList"; content: RichListItem[] };
export type RichBlock = RichParagraph | RichHeading | RichList;
export type RichDoc = { type: "doc"; content: RichBlock[] };

export const legalSlugs = ["privacidad", "condiciones"] as const;
export type LegalSlug = (typeof legalSlugs)[number];

export type LegalDocument = {
  slug: LegalSlug;
  title: string;
  /** Fecha de la última publicación, AAAA-MM-DD en la hora de Cuautla. */
  updatedOn: string;
  body: RichDoc;
};

/** Todo lo que necesita el sitio para dibujarse. `generatedOn` es la fecha de Cuautla al generarlo. */
export type SiteContent = {
  categories: Category[];
  promotions: Promotion[];
  archivedPromotions: ArchivedPromotion[];
  legal: Record<LegalSlug, LegalDocument>;
  generatedOn: string;
};
