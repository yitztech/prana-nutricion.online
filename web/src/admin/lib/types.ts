/** Respuestas de la API del editor (app/src/routes/admin.ts y app/src/content/repository.ts). */
import type { IconName, LegalSlug, RichDoc } from "#shared/content.ts";

export type AdminTreatment = { id: string; slug: string; name: string; icon: IconName; description: string };
export type AdminCategory = {
  id: string;
  title: string;
  description: string;
  photo: string;
  photoAlt: string;
  icon: IconName;
  cta: string;
  benefits: string[];
  treatments: AdminTreatment[];
};

export type PromotionStatus = "active" | "inactive" | "archived";
export type AdminPromotion = {
  id: string;
  slug: string;
  status: PromotionStatus;
  position: number;
  name: string;
  campaign: string | null;
  tagline: string | null;
  description: string;
  priceCents: number | null;
  depositCents: number | null;
  reservationNote: string | null;
  discountPercent: number | null;
  startsOn: string | null;
  endsOn: string | null;
  image: { uploadId: string } | { path: string };
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string | null;
  ctaTreatment: string | null;
  periodLabel: string | null;
  offerLabel: string | null;
  includes: { quantity: number | null; label: string; icon: IconName; free: boolean }[];
  discounts: { label: string; percent: number }[];
  treatmentIds: string[];
  updatedAt: string;
};

export type LegalSummary = { slug: LegalSlug; title: string; updatedOn: string };
export type LegalVersion = { id: string; title: string; publishedOn: string; createdAt: string; author: string | null };
export type AdminLegal = { slug: LegalSlug; title: string; updatedOn: string; body: RichDoc; versions: LegalVersion[] };

export type Publication = { id: string; reason: string; requestedAt: string; finishedAt: string | null; status: "published" | "pending" | "error" } | null;

export const legalNames: Record<LegalSlug, string> = { privacidad: "Aviso de privacidad", condiciones: "Condiciones de uso" };
