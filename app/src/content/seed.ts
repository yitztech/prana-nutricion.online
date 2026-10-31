/** Carga el contenido inicial (shared/seed) si la base de datos aún no tiene catálogo. */
import type pg from "pg";
import type { ArchivedPromotion, Promotion, TreatmentRef } from "#shared/content.ts";
import { categories } from "#shared/seed/catalog.ts";
import { legalSeed } from "#shared/seed/legal.ts";
import { archivedPromotions, promotions } from "#shared/seed/promotions.ts";
import { SEED_LEGAL_DATE } from "#shared/seed/index.ts";
import { transaction } from "../db.ts";

export async function seedIfEmpty(pool: pg.Pool) {
  return transaction(pool, async (client) => {
    // Un solo proceso carga la semilla aunque arranquen dos a la vez.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('prana-seed'))");
    const { rowCount } = await client.query("SELECT 1 FROM categories LIMIT 1");
    if (rowCount) return false;

    const treatmentIds = new Map<string, string>();
    for (const [position, category] of categories.entries()) {
      await client.query(
        "INSERT INTO categories (id, position, title, description, photo, photo_alt, icon, cta) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [category.id, position, category.title, category.description, category.photo, category.photoAlt, category.icon, category.cta],
      );
      for (const [i, text] of category.benefits.entries()) {
        await client.query("INSERT INTO category_benefits (category_id, position, text) VALUES ($1, $2, $3)", [category.id, i, text]);
      }
      for (const [i, treatment] of category.treatments.entries()) {
        const { rows: [row] } = await client.query<{ id: string }>(
          "INSERT INTO treatments (category_id, slug, name, icon, description, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [category.id, treatment.slug, treatment.name, treatment.icon, treatment.description, i],
        );
        treatmentIds.set(`${category.id}/${treatment.slug}`, row.id);
      }
    }

    const refIds = (refs: TreatmentRef[]) => refs.flatMap((ref) => {
      const id = ref.slug ? treatmentIds.get(`${ref.categoryId}/${ref.slug}`) : undefined;
      return id ? [id] : [];
    });

    const all: (Promotion | ArchivedPromotion)[] = [...promotions, ...archivedPromotions];
    for (const [position, promotion] of all.entries()) {
      const archived = promotion.status === "archived";
      const offer = archived ? null : (promotion as Promotion);
      const old = archived ? (promotion as ArchivedPromotion) : null;
      const { rows: [row] } = await client.query<{ id: string }>(
        `INSERT INTO promotions (slug, position, status, name, campaign, tagline, description, price_cents, deposit_cents,
           reservation_note, discount_percent, starts_on, ends_on, image_path, image_alt, cta_label, cta_treatment,
           period_label, offer_label)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING id`,
        [promotion.id, position, promotion.status, promotion.name, promotion.campaign ?? null, promotion.tagline ?? null,
          promotion.description, promotion.priceCents ?? null, promotion.depositCents ?? null, promotion.reservationNote ?? null,
          promotion.discountPercent ?? null, offer?.startsOn ?? null, offer?.endsOn ?? null, promotion.image, promotion.imageAlt,
          offer?.cta.label ?? null, offer?.cta.treatment ?? null, old?.periodLabel ?? null, old?.offerLabel ?? null],
      );
      for (const [i, item] of (promotion.includes ?? []).entries()) {
        await client.query("INSERT INTO promotion_includes (promotion_id, position, quantity, label, icon, free) VALUES ($1, $2, $3, $4, $5, $6)",
          [row.id, i, item.quantity ?? null, item.label, item.icon, item.free ?? false]);
      }
      for (const [i, item] of (old?.discounts ?? []).entries()) {
        await client.query("INSERT INTO promotion_discounts (promotion_id, position, label, percent) VALUES ($1, $2, $3, $4)", [row.id, i, item.label, item.percent]);
      }
      for (const [i, id] of refIds(promotion.treatments).entries()) {
        await client.query("INSERT INTO promotion_treatments (promotion_id, treatment_id, position) VALUES ($1, $2, $3)", [row.id, id, i]);
      }
    }

    for (const document of Object.values(legalSeed)) {
      await client.query(
        "INSERT INTO legal_documents (slug, title, body, published_on) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING",
        [document.slug, document.title, JSON.stringify(document.body), SEED_LEGAL_DATE],
      );
      await client.query(
        "INSERT INTO legal_document_versions (slug, title, body, published_on) VALUES ($1, $2, $3, $4)",
        [document.slug, document.title, JSON.stringify(document.body), SEED_LEGAL_DATE],
      );
    }
    return true;
  });
}
