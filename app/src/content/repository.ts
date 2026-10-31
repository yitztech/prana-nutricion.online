/**
 * Acceso al contenido: consultas parametrizadas, sin SQL concatenado con datos (§26).
 * El mismo contenido que dibuja la web (SiteContent) y las vistas del admin.
 */
import type pg from "pg";
import type { ArchivedPromotion, Category, IconName, LegalDocument, LegalSlug, Promotion, RichDoc, SiteContent, TreatmentRef } from "#shared/content.ts";
import { promotionImage } from "#shared/limits.ts";
import type { CategoryInput, LegalInput, PromotionInput, TreatmentCreate, TreatmentInput } from "#shared/schemas.ts";
import { slugify } from "#shared/schemas.ts";
import type { Db } from "../db.ts";

export const UPLOADS_PUBLIC_PATH = "/uploads/promociones";

export function uploadSources(id: string, widths: readonly number[]) {
  const sorted = [...widths].sort((a, b) => a - b);
  const main = sorted.find((w) => w >= 1024) ?? sorted[sorted.length - 1];
  return {
    src: `${UPLOADS_PUBLIC_PATH}/${id}-${main}.webp`,
    srcSet: sorted.map((w) => `${UPLOADS_PUBLIC_PATH}/${id}-${w}.webp ${w}w`).join(", "),
  };
}

const day = (value: Date | string | null) => {
  if (value === null) return undefined;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};
const opt = <T>(value: T | null) => (value === null ? undefined : value);

// ── Sitio ─────────────────────────────────────────────────────────────────────

type CategoryRow = { id: string; title: string; description: string; photo: string; photo_alt: string; icon: string; cta: string };
type TreatmentRow = { id: string; category_id: string; slug: string; name: string; icon: string; description: string };

export type AdminCategory = Omit<Category, "treatments"> & { treatments: (Category["treatments"][number] & { id: string })[] };

export async function loadCategories(db: Db): Promise<AdminCategory[]> {
  const [categories, benefits, treatments] = await Promise.all([
    db.query<CategoryRow>("SELECT id, title, description, photo, photo_alt, icon, cta FROM categories ORDER BY position, id"),
    db.query<{ category_id: string; text: string }>("SELECT category_id, text FROM category_benefits ORDER BY category_id, position"),
    db.query<TreatmentRow>("SELECT id, category_id, slug, name, icon, description FROM treatments ORDER BY category_id, position, created_at"),
  ]);
  return categories.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    photo: row.photo,
    photoAlt: row.photo_alt,
    icon: row.icon as IconName,
    cta: row.cta,
    benefits: benefits.rows.filter((b) => b.category_id === row.id).map((b) => b.text),
    treatments: treatments.rows
      .filter((t) => t.category_id === row.id)
      .map((t) => ({ id: t.id, slug: t.slug, name: t.name, icon: t.icon as IconName, description: t.description })),
  }));
}

type PromotionRow = {
  id: string; slug: string; status: "active" | "inactive" | "archived"; position: number; name: string; campaign: string | null;
  tagline: string | null; description: string; price_cents: number | null; deposit_cents: number | null;
  reservation_note: string | null; discount_percent: number | null; starts_on: Date | null; ends_on: Date | null;
  image_upload_id: string | null; image_path: string | null; image_alt: string; upload_widths: number[] | null;
  cta_label: string | null; cta_treatment: string | null; period_label: string | null; offer_label: string | null;
  updated_at: Date;
};

const PROMOTION_COLUMNS = `p.id, p.slug, p.status, p.position, p.name, p.campaign, p.tagline, p.description, p.price_cents,
  p.deposit_cents, p.reservation_note, p.discount_percent, p.starts_on::text AS starts_on, p.ends_on::text AS ends_on,
  p.image_upload_id, p.image_path, p.image_alt, u.widths AS upload_widths, p.cta_label, p.cta_treatment,
  p.period_label, p.offer_label, p.updated_at`;

async function promotionDetails(db: Db, ids: string[]) {
  if (!ids.length) return { includes: [], discounts: [], treatments: [] };
  const [includes, discounts, treatments] = await Promise.all([
    db.query<{ promotion_id: string; quantity: number | null; label: string; icon: string; free: boolean }>(
      "SELECT promotion_id, quantity, label, icon, free FROM promotion_includes WHERE promotion_id = ANY($1) ORDER BY promotion_id, position", [ids]),
    db.query<{ promotion_id: string; label: string; percent: number }>(
      "SELECT promotion_id, label, percent FROM promotion_discounts WHERE promotion_id = ANY($1) ORDER BY promotion_id, position", [ids]),
    db.query<{ promotion_id: string; treatment_id: string; category_id: string; slug: string; name: string }>(
      `SELECT pt.promotion_id, t.id AS treatment_id, t.category_id, t.slug, t.name
         FROM promotion_treatments pt JOIN treatments t ON t.id = pt.treatment_id
        WHERE pt.promotion_id = ANY($1) ORDER BY pt.promotion_id, pt.position`, [ids]),
  ]);
  return { includes: includes.rows, discounts: discounts.rows, treatments: treatments.rows };
}

function imageOf(row: PromotionRow) {
  if (row.image_upload_id && row.upload_widths) {
    const { src, srcSet } = uploadSources(row.image_upload_id, row.upload_widths);
    return { image: src, imageSrcSet: srcSet };
  }
  return { image: row.image_path!, imageSrcSet: undefined };
}

export async function loadPromotions(db: Db) {
  const { rows } = await db.query<PromotionRow>(
    `SELECT ${PROMOTION_COLUMNS} FROM promotions p LEFT JOIN uploads u ON u.id = p.image_upload_id ORDER BY p.position, p.created_at`,
  );
  const details = await promotionDetails(db, rows.map((r) => r.id));
  const promotions: Promotion[] = [];
  const archivedPromotions: ArchivedPromotion[] = [];
  for (const row of rows) {
    const includes = details.includes.filter((i) => i.promotion_id === row.id)
      .map((i) => ({ label: i.label, icon: i.icon as IconName, ...(i.quantity ? { quantity: i.quantity } : {}), ...(i.free ? { free: true } : {}) }));
    const treatments: TreatmentRef[] = details.treatments.filter((t) => t.promotion_id === row.id).map((t) => ({ categoryId: t.category_id, slug: t.slug }));
    const common = {
      id: row.slug,
      name: row.name,
      description: row.description,
      campaign: opt(row.campaign),
      tagline: opt(row.tagline),
      includes: includes.length ? includes : undefined,
      treatments,
      priceCents: opt(row.price_cents),
      depositCents: opt(row.deposit_cents),
      reservationNote: opt(row.reservation_note),
      discountPercent: opt(row.discount_percent),
      ...imageOf(row),
      imageAlt: row.image_alt,
    };
    if (row.status === "archived") {
      const discounts = details.discounts.filter((d) => d.promotion_id === row.id).map((d) => ({ label: d.label, percent: d.percent }));
      archivedPromotions.push(clean({ ...common, status: "archived", periodLabel: opt(row.period_label), offerLabel: opt(row.offer_label), discounts: discounts.length ? discounts : undefined }));
    } else {
      promotions.push(clean({
        ...common,
        status: row.status,
        startsOn: day(row.starts_on),
        endsOn: day(row.ends_on)!,
        cta: clean({ label: row.cta_label!, treatment: opt(row.cta_treatment) }),
      }));
    }
  }
  return { promotions, archivedPromotions };
}

/** Sin claves `undefined`: el JSON incrustado en la página queda igual que el del servidor. */
function clean<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

export async function loadLegal(db: Db): Promise<Record<LegalSlug, LegalDocument>> {
  const { rows } = await db.query<{ slug: LegalSlug; title: string; body: RichDoc; published_on: string }>(
    "SELECT slug, title, body, published_on::text AS published_on FROM legal_documents",
  );
  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, { slug: r.slug, title: r.title, body: r.body, updatedOn: r.published_on }]));
  if (!bySlug.privacidad || !bySlug.condiciones) throw new Error("Faltan los documentos legales en la base de datos");
  return bySlug as Record<LegalSlug, LegalDocument>;
}

export async function loadSiteContent(db: Db, today: string): Promise<SiteContent> {
  const [categories, promotions, legal] = await Promise.all([loadCategories(db), loadPromotions(db), loadLegal(db)]);
  return {
    categories: categories.map((c) => ({ ...c, treatments: c.treatments.map(({ id: _id, ...t }) => t) })),
    ...promotions,
    legal,
    generatedOn: today,
  };
}

// ── Escrituras del admin ──────────────────────────────────────────────────────

export async function audit(db: Db, userId: string | null, action: string, entity: string, entityId: string | null) {
  await db.query("INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1, $2, $3, $4)", [userId, action, entity, entityId]);
}

export async function updateLegal(client: pg.PoolClient, slug: LegalSlug, input: LegalInput, today: string, userId: string | null) {
  const { rowCount } = await client.query(
    "UPDATE legal_documents SET title = $2, body = $3, published_on = $4, updated_by = $5, updated_at = now() WHERE slug = $1",
    [slug, input.title, JSON.stringify(input.body), today, userId],
  );
  if (!rowCount) return false;
  await client.query(
    "INSERT INTO legal_document_versions (slug, title, body, published_on, created_by) VALUES ($1, $2, $3, $4, $5)",
    [slug, input.title, JSON.stringify(input.body), today, userId],
  );
  return true;
}

export async function legalVersions(db: Db, slug: LegalSlug, limit: number) {
  const { rows } = await db.query<{ id: string; title: string; published_on: string; created_at: Date; author: string | null }>(
    `SELECT v.id, v.title, v.published_on::text AS published_on, v.created_at, a.name AS author
       FROM legal_document_versions v LEFT JOIN admin_users a ON a.id = v.created_by
      WHERE v.slug = $1 ORDER BY v.created_at DESC LIMIT $2`, [slug, limit]);
  return rows.map((r) => ({ id: r.id, title: r.title, publishedOn: r.published_on, createdAt: r.created_at.toISOString(), author: r.author }));
}

export async function updateCategory(client: pg.PoolClient, id: string, input: CategoryInput) {
  const { rowCount } = await client.query(
    "UPDATE categories SET title = $2, description = $3, photo_alt = $4, cta = $5, icon = $6, updated_at = now() WHERE id = $1",
    [id, input.title, input.description, input.photoAlt, input.cta, input.icon],
  );
  if (!rowCount) return false;
  await client.query("DELETE FROM category_benefits WHERE category_id = $1", [id]);
  for (const [position, text] of input.benefits.entries()) {
    await client.query("INSERT INTO category_benefits (category_id, position, text) VALUES ($1, $2, $3)", [id, position, text]);
  }
  return true;
}

export class ConflictError extends Error {
  code: string;
  field?: string;

  constructor(code: string, message: string, field?: string) {
    super(message);
    this.code = code;
    this.field = field;
  }
}

export async function createTreatment(client: pg.PoolClient, categoryId: string, input: TreatmentCreate, maxPerCategory: number) {
  // Bloquea la categoría: dos altas a la vez no rebasan el máximo ni repiten la posición.
  const category = await client.query("SELECT id FROM categories WHERE id = $1 FOR UPDATE", [categoryId]);
  if (!category.rowCount) return null;
  const { rows: [{ count }] } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM treatments WHERE category_id = $1", [categoryId]);
  if (count >= maxPerCategory) throw new ConflictError("too_many_treatments", `Una categoría admite ${maxPerCategory} tratamientos como máximo.`);
  const slug = input.slug || slugify(input.name);
  if (!slug) throw new ConflictError("invalid_slug", "El nombre necesita al menos una letra o un número.", "name");
  const exists = await client.query("SELECT 1 FROM treatments WHERE category_id = $1 AND slug = $2", [categoryId, slug]);
  if (exists.rowCount) throw new ConflictError("slug_taken", "Ya hay un tratamiento con ese nombre en la categoría.", "name");
  const { rows: [row] } = await client.query<{ id: string }>(
    "INSERT INTO treatments (category_id, slug, name, icon, description, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [categoryId, slug, input.name, input.icon, input.description, count],
  );
  return { id: row.id, slug };
}

export async function updateTreatment(db: Db, id: string, input: TreatmentInput) {
  const { rows } = await db.query<{ category_id: string }>(
    "UPDATE treatments SET name = $2, icon = $3, description = $4, updated_at = now() WHERE id = $1 RETURNING category_id",
    [id, input.name, input.icon, input.description],
  );
  return rows[0]?.category_id ?? null;
}

export async function deleteTreatment(client: pg.PoolClient, id: string) {
  const { rows } = await client.query<{ category_id: string }>("DELETE FROM treatments WHERE id = $1 RETURNING category_id", [id]);
  if (!rows[0]) return false;
  // Posiciones seguidas tras borrar: el orden que ve el admin es el del sitio.
  await client.query(
    `UPDATE treatments t SET position = o.n - 1
       FROM (SELECT id, row_number() OVER (ORDER BY position, created_at) AS n FROM treatments WHERE category_id = $1) o
      WHERE t.id = o.id`, [rows[0].category_id]);
  return true;
}

export async function reorderTreatments(client: pg.PoolClient, categoryId: string, ids: string[]) {
  const { rows } = await client.query<{ id: string }>("SELECT id FROM treatments WHERE category_id = $1 FOR UPDATE", [categoryId]);
  const current = new Set(rows.map((r) => r.id));
  if (current.size !== ids.length || !ids.every((id) => current.has(id))) {
    throw new ConflictError("order_mismatch", "El orden debe incluir todos los tratamientos de la categoría, una vez cada uno.", "ids");
  }
  for (const [position, id] of ids.entries()) await client.query("UPDATE treatments SET position = $2, updated_at = now() WHERE id = $1", [id, position]);
}

export type AdminPromotion = ReturnType<typeof adminPromotion>;

function adminPromotion(row: PromotionRow, details: Awaited<ReturnType<typeof promotionDetails>>) {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    position: row.position,
    name: row.name,
    campaign: row.campaign,
    tagline: row.tagline,
    description: row.description,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    reservationNote: row.reservation_note,
    discountPercent: row.discount_percent,
    startsOn: day(row.starts_on) ?? null,
    endsOn: day(row.ends_on) ?? null,
    image: row.image_upload_id ? { uploadId: row.image_upload_id } : { path: row.image_path! },
    imageUrl: imageOf(row).image,
    imageAlt: row.image_alt,
    ctaLabel: row.cta_label,
    ctaTreatment: row.cta_treatment,
    periodLabel: row.period_label,
    offerLabel: row.offer_label,
    includes: details.includes.filter((i) => i.promotion_id === row.id).map((i) => ({ quantity: i.quantity, label: i.label, icon: i.icon, free: i.free })),
    discounts: details.discounts.filter((d) => d.promotion_id === row.id).map((d) => ({ label: d.label, percent: d.percent })),
    treatmentIds: details.treatments.filter((t) => t.promotion_id === row.id).map((t) => t.treatment_id),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Lista paginada por cursor opaco (posición + id), con `limit` acotado (§21). */
export async function listPromotions(db: Db, { limit, after }: { limit: number; after?: { position: number; id: string } }) {
  const { rows } = await db.query<PromotionRow>(
    `SELECT ${PROMOTION_COLUMNS} FROM promotions p LEFT JOIN uploads u ON u.id = p.image_upload_id
      WHERE ($1::smallint IS NULL OR (p.position, p.id) > ($1::smallint, $2::uuid))
      ORDER BY p.position, p.id LIMIT $3`,
    [after?.position ?? null, after?.id ?? null, limit + 1],
  );
  const page = rows.slice(0, limit);
  const details = await promotionDetails(db, page.map((r) => r.id));
  const last = page[page.length - 1];
  return { items: page.map((row) => adminPromotion(row, details)), next: rows.length > limit && last ? { position: last.position, id: last.id } : null };
}

export async function getPromotion(db: Db, id: string) {
  const { rows } = await db.query<PromotionRow>(
    `SELECT ${PROMOTION_COLUMNS} FROM promotions p LEFT JOIN uploads u ON u.id = p.image_upload_id WHERE p.id = $1`, [id]);
  if (!rows[0]) return null;
  return adminPromotion(rows[0], await promotionDetails(db, [id]));
}

async function writePromotionChildren(client: pg.PoolClient, id: string, input: PromotionInput) {
  for (const table of ["promotion_includes", "promotion_discounts", "promotion_treatments"]) {
    await client.query(`DELETE FROM ${table} WHERE promotion_id = $1`, [id]);
  }
  for (const [position, item] of input.includes.entries()) {
    await client.query("INSERT INTO promotion_includes (promotion_id, position, quantity, label, icon, free) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, position, item.quantity ?? null, item.label, item.icon, item.free]);
  }
  for (const [position, item] of input.discounts.entries()) {
    await client.query("INSERT INTO promotion_discounts (promotion_id, position, label, percent) VALUES ($1, $2, $3, $4)", [id, position, item.label, item.percent]);
  }
  if (input.treatmentIds.length) {
    const { rows } = await client.query<{ id: string }>("SELECT id FROM treatments WHERE id = ANY($1)", [input.treatmentIds]);
    if (rows.length !== input.treatmentIds.length) throw new ConflictError("unknown_treatment", "Algún tratamiento ya no existe.", "treatmentIds");
  }
  for (const [position, treatmentId] of input.treatmentIds.entries()) {
    await client.query("INSERT INTO promotion_treatments (promotion_id, treatment_id, position) VALUES ($1, $2, $3)", [id, treatmentId, position]);
  }
}

async function checkUpload(client: pg.PoolClient, input: PromotionInput) {
  if (!("uploadId" in input.image)) return;
  const { rowCount } = await client.query("SELECT 1 FROM uploads WHERE id = $1 AND purpose = 'promocion'", [input.image.uploadId]);
  if (!rowCount) throw new ConflictError("unknown_upload", "La imagen ya no está disponible: súbela de nuevo.", "image");
}

const promotionValues = (input: PromotionInput) => [
  input.status, input.name, input.campaign, input.tagline, input.description, input.priceCents ?? null, input.depositCents ?? null,
  input.reservationNote, input.discountPercent ?? null, input.startsOn ?? null, input.endsOn ?? null,
  "uploadId" in input.image ? input.image.uploadId : null, "path" in input.image ? input.image.path : null, input.imageAlt,
  input.ctaLabel, input.ctaTreatment, input.periodLabel, input.offerLabel,
];

export async function createPromotion(client: pg.PoolClient, input: PromotionInput, maxPromotions: number) {
  await client.query("LOCK TABLE promotions IN SHARE ROW EXCLUSIVE MODE");
  const { rows: [{ count, next }] } = await client.query<{ count: number; next: number }>(
    "SELECT count(*)::int AS count, coalesce(max(position) + 1, 0)::int AS next FROM promotions");
  if (count >= maxPromotions) throw new ConflictError("too_many_promotions", `Se admiten ${maxPromotions} promociones como máximo: archiva o borra alguna.`);
  await checkUpload(client, input);
  const base = slugify(input.name) || "promocion";
  const { rows: taken } = await client.query<{ slug: string }>("SELECT slug FROM promotions WHERE slug = $1 OR slug LIKE $2", [base, `${base}-%`]);
  const used = new Set(taken.map((r) => r.slug));
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base.slice(0, 75)}-${n}`;
  const { rows: [row] } = await client.query<{ id: string }>(
    `INSERT INTO promotions (slug, position, status, name, campaign, tagline, description, price_cents, deposit_cents,
       reservation_note, discount_percent, starts_on, ends_on, image_upload_id, image_path, image_alt, cta_label,
       cta_treatment, period_label, offer_label)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id`,
    [slug, next, ...promotionValues(input)],
  );
  await writePromotionChildren(client, row.id, input);
  return row.id;
}

export async function updatePromotion(client: pg.PoolClient, id: string, input: PromotionInput) {
  await checkUpload(client, input);
  const { rowCount } = await client.query(
    `UPDATE promotions SET status = $2, name = $3, campaign = $4, tagline = $5, description = $6, price_cents = $7,
       deposit_cents = $8, reservation_note = $9, discount_percent = $10, starts_on = $11, ends_on = $12,
       image_upload_id = $13, image_path = $14, image_alt = $15, cta_label = $16, cta_treatment = $17,
       period_label = $18, offer_label = $19, updated_at = now()
     WHERE id = $1`,
    [id, ...promotionValues(input)],
  );
  if (!rowCount) return false;
  await writePromotionChildren(client, id, input);
  return true;
}

export async function deletePromotion(db: Db, id: string) {
  const { rowCount } = await db.query("DELETE FROM promotions WHERE id = $1", [id]);
  return Boolean(rowCount);
}

export async function insertUpload(db: Db, data: { width: number; height: number; widths: number[]; bytes: number; userId: string }) {
  const { rows: [row] } = await db.query<{ id: string }>(
    "INSERT INTO uploads (purpose, width, height, widths, bytes, created_by) VALUES ('promocion', $1, $2, $3, $4, $5) RETURNING id",
    [data.width, data.height, data.widths, data.bytes, data.userId],
  );
  return row.id;
}

export { promotionImage };
