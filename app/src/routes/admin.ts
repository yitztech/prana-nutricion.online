/**
 * API interna del editor (/api/admin/…): solo con sesión (§25). Cada escritura se valida con el
 * esquema compartido, se registra en la auditoría y pide publicar el sitio.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import { legalSlugs, type LegalSlug } from "#shared/content.ts";
import { listLimits, promotionImage } from "#shared/limits.ts";
import {
  categoryInputSchema,
  legalInputSchema,
  promotionInputSchema,
  treatmentCreateSchema,
  treatmentInputSchema,
  treatmentOrderSchema,
} from "#shared/schemas.ts";
import { formatHelp, inspectImage, writeVariants } from "../content/images.ts";
import {
  audit,
  ConflictError,
  createPromotion,
  createTreatment,
  deletePromotion,
  deleteTreatment,
  getPromotion,
  insertUpload,
  legalVersions,
  loadCategories,
  loadLegal,
  listPromotions,
  reorderTreatments,
  updateCategory,
  updateLegal,
  updatePromotion,
  updateTreatment,
  uploadSources,
} from "../content/repository.ts";
import { transaction } from "../db.ts";
import { HttpProblem, notFound } from "../http/problem.ts";
import { isUuid, parse } from "../http/validate.ts";
import { clinicToday, lastPublication } from "../site/publisher.ts";
import { requireUser, type Deps } from "../server.ts";
import { sessionLoader } from "./auth.ts";

const asConflict = (error: unknown): never => {
  if (error instanceof ConflictError) {
    if (error.field) throw new HttpProblem(422, "validation_failed", error.message, [{ field: error.field, code: error.code, message: error.message }]);
    throw new HttpProblem(409, error.code, error.message);
  }
  throw error;
};

/** Cursor opaco: base64url de la última posición vista. Uno mal formado es un 400, nunca un 500. */
function readCursor(value: unknown) {
  if (value === undefined) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(String(value), "base64url").toString("utf8"));
    if (Number.isInteger(parsed.p) && typeof parsed.i === "string" && isUuid(parsed.i)) return { position: parsed.p as number, id: parsed.i as string };
  } catch { /* cursor inválido */ }
  throw new HttpProblem(400, "invalid_cursor", "El cursor de la lista no es válido.");
}

const writeCursor = (next: { position: number; id: string } | null) =>
  next ? Buffer.from(JSON.stringify({ p: next.position, i: next.id })).toString("base64url") : null;

function readLimit(value: unknown) {
  if (value === undefined) return 20;
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new HttpProblem(400, "invalid_limit", "`limit` va de 1 a 100.");
  return limit;
}

const legalSlug = (value: string) => {
  if (!(legalSlugs as readonly string[]).includes(value)) throw notFound();
  return value as LegalSlug;
};
const uuidParam = (value: string) => {
  if (!isUuid(value)) throw notFound();
  return value;
};

export const adminRoutes = (deps: Deps) => async (app: FastifyInstance) => {
  const { pool, publisher, config } = deps;
  app.addHook("preHandler", sessionLoader(deps));
  // Se deniega por defecto: todo lo que cuelga de /api/admin exige sesión (§25).
  app.addHook("preHandler", async (request, reply) => {
    if (requireUser(request, reply)) return reply;
  });

  const publish = (request: FastifyRequest, reason: string) => publisher.request(reason, request.user!.id);
  type Params = { slug: string; id: string };

  // ── Documentos legales ──────────────────────────────────────────────────────
  app.get("/legal", async () => {
    const legal = await loadLegal(pool);
    return { items: legalSlugs.map((slug) => ({ slug, title: legal[slug].title, updatedOn: legal[slug].updatedOn })) };
  });

  app.get<{ Params: Params }>("/legal/:slug", async (request) => {
    const slug = legalSlug(request.params.slug);
    const legal = await loadLegal(pool);
    return { ...legal[slug], versions: await legalVersions(pool, slug, 10) };
  });

  app.put<{ Params: Params }>("/legal/:slug", async (request) => {
    const slug = legalSlug(request.params.slug);
    const input = parse(legalInputSchema, request.body);
    await transaction(pool, async (client) => {
      if (!(await updateLegal(client, slug, input, clinicToday(), request.user!.id))) throw notFound();
      await audit(client, request.user!.id, "legal.update", "legal_document", slug);
    });
    await publish(request, `legal:${slug}`);
    const legal = await loadLegal(pool);
    return { ...legal[slug], versions: await legalVersions(pool, slug, 10) };
  });

  // ── Catálogo ────────────────────────────────────────────────────────────────
  app.get("/categories", async () => ({ items: await loadCategories(pool) }));

  app.put<{ Params: Params }>("/categories/:id", async (request) => {
    const id = request.params.id;
    if (!/^[a-z0-9-]{1,50}$/.test(id)) throw notFound();
    const input = parse(categoryInputSchema, request.body);
    await transaction(pool, async (client) => {
      if (!(await updateCategory(client, id, input))) throw notFound();
      await audit(client, request.user!.id, "category.update", "category", id);
    });
    await publish(request, `categoria:${id}`);
    return (await loadCategories(pool)).find((c) => c.id === id);
  });

  app.post<{ Params: Params }>("/categories/:id/treatments", async (request, reply) => {
    const id = request.params.id;
    if (!/^[a-z0-9-]{1,50}$/.test(id)) throw notFound();
    const input = parse(treatmentCreateSchema, request.body);
    const created = await transaction(pool, async (client) => {
      const result = await createTreatment(client, id, input, listLimits.treatmentsPerCategory).catch(asConflict);
      if (!result) throw notFound();
      await audit(client, request.user!.id, "treatment.create", "treatment", result.id);
      return result;
    });
    await publish(request, `tratamiento:${created.slug}`);
    const treatment = (await loadCategories(pool)).flatMap((c) => c.treatments).find((t) => t.id === created.id);
    return reply.code(201).header("Location", `/api/admin/treatments/${created.id}`).send(treatment);
  });

  app.put<{ Params: Params }>("/categories/:id/treatments/order", async (request) => {
    const id = request.params.id;
    if (!/^[a-z0-9-]{1,50}$/.test(id)) throw notFound();
    const input = parse(treatmentOrderSchema, request.body);
    await transaction(pool, async (client) => {
      const exists = await client.query("SELECT 1 FROM categories WHERE id = $1", [id]);
      if (!exists.rowCount) throw notFound();
      await reorderTreatments(client, id, input.ids).catch(asConflict);
      await audit(client, request.user!.id, "treatment.reorder", "category", id);
    });
    await publish(request, `orden:${id}`);
    return (await loadCategories(pool)).find((c) => c.id === id);
  });

  app.put<{ Params: Params }>("/treatments/:id", async (request) => {
    const id = uuidParam(request.params.id);
    const input = parse(treatmentInputSchema, request.body);
    const categoryId = await updateTreatment(pool, id, input);
    if (!categoryId) throw notFound();
    await audit(pool, request.user!.id, "treatment.update", "treatment", id);
    await publish(request, `tratamiento:${id}`);
    return (await loadCategories(pool)).flatMap((c) => c.treatments).find((t) => t.id === id);
  });

  app.delete<{ Params: Params }>("/treatments/:id", async (request, reply) => {
    const id = uuidParam(request.params.id);
    await transaction(pool, async (client) => {
      if (!(await deleteTreatment(client, id))) throw notFound();
      await audit(client, request.user!.id, "treatment.delete", "treatment", id);
    });
    await publish(request, `tratamiento-borrado:${id}`);
    return reply.code(204).send();
  });

  // ── Promociones ─────────────────────────────────────────────────────────────
  app.get<{ Querystring: { limit?: string; cursor?: string } }>("/promotions", async (request) => {
    const page = await listPromotions(pool, { limit: readLimit(request.query.limit), after: readCursor(request.query.cursor) });
    return { items: page.items, nextCursor: writeCursor(page.next) };
  });

  app.get<{ Params: Params }>("/promotions/:id", async (request) => {
    const promotion = await getPromotion(pool, uuidParam(request.params.id));
    if (!promotion) throw notFound();
    return promotion;
  });

  app.post("/promotions", async (request, reply) => {
    const input = parse(promotionInputSchema, request.body);
    const id = await transaction(pool, async (client) => {
      const created = await createPromotion(client, input, listLimits.promotions).catch(asConflict);
      await audit(client, request.user!.id, "promotion.create", "promotion", created);
      return created;
    });
    await publish(request, `promocion:${id}`);
    return reply.code(201).header("Location", `/api/admin/promotions/${id}`).send(await getPromotion(pool, id));
  });

  app.put<{ Params: Params }>("/promotions/:id", async (request) => {
    const id = uuidParam(request.params.id);
    const input = parse(promotionInputSchema, request.body);
    await transaction(pool, async (client) => {
      if (!(await updatePromotion(client, id, input).catch(asConflict))) throw notFound();
      await audit(client, request.user!.id, "promotion.update", "promotion", id);
    });
    await publish(request, `promocion:${id}`);
    return getPromotion(pool, id);
  });

  app.delete<{ Params: Params }>("/promotions/:id", async (request, reply) => {
    const id = uuidParam(request.params.id);
    if (!(await deletePromotion(pool, id))) throw notFound();
    await audit(pool, request.user!.id, "promotion.delete", "promotion", id);
    await publish(request, `promocion-borrada:${id}`);
    return reply.code(204).send();
  });

  // ── Imágenes ────────────────────────────────────────────────────────────────
  app.get("/uploads/format", async () => ({ help: formatHelp }));

  app.post("/uploads", async (request, reply) => {
    if (!request.isMultipart()) throw new HttpProblem(415, "unsupported_media_type", "Envía la imagen como multipart/form-data.");
    const file = await request.file();
    if (!file || file.fieldname !== "file") {
      throw new HttpProblem(422, "validation_failed", "Revisa la imagen.", [{ field: "file", code: "required", message: "Elige una imagen." }]);
    }
    const buffer = await file.toBuffer();
    const { width, height } = await inspectImage(buffer);
    const widths = [...promotionImage.widths];
    const id = await transaction(pool, async (client) => {
      const uploadId = await insertUpload(client, { width, height, widths, bytes: buffer.length, userId: request.user!.id });
      // Si falla al escribir, writeVariants borra lo escrito y la transacción deshace la fila.
      await writeVariants(buffer, config.UPLOADS_DIR, uploadId);
      await audit(client, request.user!.id, "upload.create", "upload", uploadId);
      return uploadId;
    });
    return reply.code(201).send({ id, ...uploadSources(id, widths), width, height });
  });

  // ── Publicación ─────────────────────────────────────────────────────────────
  app.get("/site", async () => ({ publication: await lastPublication(pool) }));

  app.post("/site/publish", async (request, reply) => {
    await publish(request, "manual");
    return reply.code(202).send({ publication: await lastPublication(pool) });
  });
};
