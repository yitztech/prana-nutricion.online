/**
 * Validación del contenido que edita el admin: la misma en el navegador y en el servidor (§23).
 * Lista blanca: en el nivel superior se rechazan los campos desconocidos. Los textos se normalizan
 * (espacios) antes de medirlos, y la longitud se cuenta en caracteres Unicode (§6.3).
 */
import { z } from "zod";
import { iconNames } from "./icons.ts";
import { charLength, limits, listLimits, normalizeSpaces, passwordPolicy, ranges } from "./limits.ts";
import type { RichBlock, RichDoc, RichInline, RichListItem } from "./content.ts";

/** Códigos estables de `errors[].code` (§22). */
export const fieldCodes = {
  required: "required",
  tooLong: "too_long",
  invalidFormat: "invalid_format",
  invalidCharacters: "invalid_characters",
  outOfRange: "out_of_range",
  tooMany: "too_many",
} as const;

const issue = (code: string, message: string) => ({ error: message, params: { code } });

/** Texto de una línea: obligatorio, sin espacios de sobra y con máximo. */
export function requiredText(max: number) {
  return z
    .string(issue(fieldCodes.required, "Este campo es obligatorio."))
    .transform(normalizeSpaces)
    .refine((value) => value.length > 0, issue(fieldCodes.required, "Este campo es obligatorio."))
    .refine((value) => charLength(value) <= max, issue(fieldCodes.tooLong, `Máximo ${max} caracteres.`));
}

/** Texto opcional: vacío equivale a no tenerlo (`null`). */
export function optionalText(max: number) {
  return z
    .string()
    .nullish()
    .transform((value) => (value == null ? null : normalizeSpaces(value) || null))
    .refine((value) => value === null || charLength(value) <= max, issue(fieldCodes.tooLong, `Máximo ${max} caracteres.`));
}

const icon = z.enum(iconNames, issue(fieldCodes.invalidFormat, "Elige uno de los iconos de Praná."));
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, issue(fieldCodes.invalidFormat, "Usa una fecha válida."))
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value), issue(fieldCodes.invalidFormat, "Usa una fecha válida."));
const cents = z
  .number(issue(fieldCodes.invalidFormat, "Escribe un importe."))
  .int(issue(fieldCodes.invalidFormat, "Escribe el importe en centavos."))
  .min(ranges.priceCents.min, issue(fieldCodes.outOfRange, "El importe no puede ser negativo."))
  .max(ranges.priceCents.max, issue(fieldCodes.outOfRange, "El importe es demasiado alto."));
const list = <T extends z.ZodType>(item: T, max: number) =>
  z.array(item).max(max, issue(fieldCodes.tooMany, `Máximo ${max} elementos.`));
const uuid = z.uuid(issue(fieldCodes.invalidFormat, "Identificador no válido."));

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** «Tratamiento Reductivo Intenso» → «tratamiento-reductivo-intenso». */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, limits.treatment.slug)
    .replace(/-+$/g, "");
}

// ── Texto enriquecido ─────────────────────────────────────────────────────────

/** Enlaces permitidos: https, http, correo, teléfono o una ruta del propio sitio. Nunca javascript:. */
export function isSafeHref(href: string) {
  if (charLength(href) > limits.legal.href) return false;
  if (/^\/(?!\/)/.test(href) || href.startsWith("#")) return true;
  return /^(https?:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+|tel:\+?[0-9 ()-]+)$/i.test(href);
}

// El JSON de Tiptap trae atributos de presentación (target, rel, class): se descartan.
const mark = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({ href: z.string().refine(isSafeHref, issue(fieldCodes.invalidFormat, "Enlace no permitido: usa https://, mailto: o una ruta del sitio.")) }),
  }),
]);
const inline: z.ZodType<RichInline> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string().min(1), marks: z.array(mark).max(3).optional() }),
  z.object({ type: z.literal("hardBreak") }),
]);
const inlines = z.array(inline).max(500).optional();
const paragraph = z.object({ type: z.literal("paragraph"), content: inlines });
const heading = z.object({
  type: z.literal("heading"),
  attrs: z.object({ level: z.union([z.literal(2), z.literal(3)], issue(fieldCodes.invalidFormat, "Solo títulos de nivel 2 o 3.")) }),
  content: inlines,
});
const listItem: z.ZodType<RichListItem> = z.lazy(() =>
  z.object({ type: z.literal("listItem"), content: z.array(z.union([paragraph, bulletList, orderedList])).min(1).max(20) }),
);
const bulletList = z.object({ type: z.literal("bulletList"), content: z.array(listItem).min(1).max(100) });
const orderedList = z.object({ type: z.literal("orderedList"), content: z.array(listItem).min(1).max(100) });
const block: z.ZodType<RichBlock> = z.union([paragraph, heading, bulletList, orderedList]);

/** Texto visible del documento, para medirlo y para las pruebas. */
export function richText(doc: RichDoc) {
  const parts: string[] = [];
  const visit = (node: { type: string; text?: string; content?: unknown[] }) => {
    if (node.type === "text" && node.text) parts.push(node.text);
    for (const child of (node.content ?? []) as { type: string }[]) visit(child);
  };
  visit(doc as never);
  return parts.join(" ");
}

function countNodes(node: { content?: unknown[] }): number {
  return 1 + ((node.content ?? []) as { content?: unknown[] }[]).reduce((sum, child) => sum + countNodes(child), 0);
}

export const richDocSchema: z.ZodType<RichDoc> = z
  .object({ type: z.literal("doc"), content: z.array(block).min(1, issue(fieldCodes.required, "El documento no puede quedar vacío.")) })
  .refine((doc) => richText(doc).trim().length > 0, issue(fieldCodes.required, "El documento no puede quedar vacío."))
  .refine((doc) => charLength(richText(doc)) <= limits.legal.text, issue(fieldCodes.tooLong, `Máximo ${limits.legal.text} caracteres.`))
  .refine((doc) => countNodes(doc) <= limits.legal.nodes, issue(fieldCodes.tooMany, "El documento tiene demasiados elementos."));

// ── Entradas del admin ────────────────────────────────────────────────────────

export const legalInputSchema = z.strictObject({
  title: requiredText(limits.legal.title),
  body: richDocSchema,
});

export const categoryInputSchema = z.strictObject({
  title: requiredText(limits.category.title),
  description: requiredText(limits.category.description),
  photoAlt: requiredText(limits.category.photoAlt),
  cta: requiredText(limits.category.cta),
  icon,
  benefits: list(requiredText(limits.category.benefit), listLimits.categoryBenefits),
});

export const treatmentInputSchema = z.strictObject({
  name: requiredText(limits.treatment.name),
  icon,
  description: requiredText(limits.treatment.description),
});

export const treatmentCreateSchema = treatmentInputSchema.extend({
  slug: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === "" || (slugPattern.test(value) && value.length <= limits.treatment.slug), issue(fieldCodes.invalidFormat, "Solo minúsculas, números y guiones.")),
});

export const treatmentOrderSchema = z.strictObject({
  ids: list(uuid, listLimits.treatmentsPerCategory).min(1),
});

const include = z.strictObject({
  quantity: z.number().int().min(ranges.quantity.min, issue(fieldCodes.outOfRange, "Entre 1 y 99.")).max(ranges.quantity.max, issue(fieldCodes.outOfRange, "Entre 1 y 99.")).nullish(),
  label: requiredText(limits.promotion.includeLabel),
  icon,
  free: z.boolean().default(false),
});

const discount = z.strictObject({
  label: requiredText(limits.promotion.discountLabel),
  percent: z.number().int().min(ranges.percent.min, issue(fieldCodes.outOfRange, "Entre 1 y 100.")).max(ranges.percent.max, issue(fieldCodes.outOfRange, "Entre 1 y 100.")),
});

/** La imagen: una subida al admin, o una de las fotos del sitio (`/img/<nombre>.webp`). */
const promotionImage = z.union([
  z.strictObject({ uploadId: uuid }),
  z.strictObject({ path: z.string().regex(/^\/img\/[a-z0-9-]+\.webp$/, issue(fieldCodes.invalidFormat, "Imagen no válida.")) }),
]);

export const promotionStatuses = ["active", "inactive", "archived"] as const;

export const promotionInputSchema = z
  .strictObject({
    status: z.enum(promotionStatuses, issue(fieldCodes.invalidFormat, "Estado no válido.")),
    name: requiredText(limits.promotion.name),
    campaign: optionalText(limits.promotion.campaign),
    tagline: optionalText(limits.promotion.tagline),
    description: requiredText(limits.promotion.description),
    priceCents: cents.nullish(),
    depositCents: cents.nullish(),
    reservationNote: optionalText(limits.promotion.reservationNote),
    discountPercent: z.number().int().min(ranges.percent.min, issue(fieldCodes.outOfRange, "Entre 1 y 100.")).max(ranges.percent.max, issue(fieldCodes.outOfRange, "Entre 1 y 100.")).nullish(),
    startsOn: day.nullish(),
    endsOn: day.nullish(),
    image: promotionImage,
    imageAlt: requiredText(limits.promotion.imageAlt),
    ctaLabel: optionalText(limits.promotion.ctaLabel),
    ctaTreatment: optionalText(limits.promotion.ctaTreatment),
    periodLabel: optionalText(limits.promotion.periodLabel),
    offerLabel: optionalText(limits.promotion.offerLabel),
    includes: list(include, listLimits.promotionIncludes).default([]),
    discounts: list(discount, listLimits.promotionDiscounts).default([]),
    treatmentIds: list(uuid, listLimits.promotionTreatments).default([]),
  })
  .superRefine((value, ctx) => {
    const add = (path: string, code: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message, params: { code } });
    if (value.status !== "archived") {
      if (!value.endsOn) add("endsOn", fieldCodes.required, "Indica el último día de la promoción.");
      if (!value.ctaLabel) add("ctaLabel", fieldCodes.required, "Escribe el texto del botón.");
    }
    if (value.startsOn && value.endsOn && value.startsOn > value.endsOn) add("endsOn", fieldCodes.outOfRange, "La fecha de fin es anterior a la de inicio.");
    if (value.priceCents != null && value.depositCents != null && value.depositCents > value.priceCents) add("depositCents", fieldCodes.outOfRange, "El apartado no puede superar el precio.");
    if (new Set(value.treatmentIds).size !== value.treatmentIds.length) add("treatmentIds", fieldCodes.invalidFormat, "Hay tratamientos repetidos.");
  });

export type LegalInput = z.output<typeof legalInputSchema>;
export type CategoryInput = z.output<typeof categoryInputSchema>;
export type TreatmentInput = z.output<typeof treatmentInputSchema>;
export type TreatmentCreate = z.output<typeof treatmentCreateSchema>;
export type PromotionInput = z.output<typeof promotionInputSchema>;
export type PromotionInputDraft = z.input<typeof promotionInputSchema>;

// ── Cuentas ───────────────────────────────────────────────────────────────────

const email = z
  .string(issue(fieldCodes.required, "Escribe tu correo."))
  .trim()
  .toLowerCase()
  .refine((value) => value.length > 0, issue(fieldCodes.required, "Escribe tu correo."))
  .refine((value) => charLength(value) <= limits.admin.email, issue(fieldCodes.tooLong, `Máximo ${limits.admin.email} caracteres.`))
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), issue(fieldCodes.invalidFormat, "El correo no es válido."));

/** Al iniciar sesión no se revela la política: solo se exige algo dentro del límite. */
const anyPassword = z
  .string(issue(fieldCodes.required, "Escribe tu contraseña."))
  .min(1, issue(fieldCodes.required, "Escribe tu contraseña."))
  .refine((value) => charLength(value) <= passwordPolicy.maxLength, issue(fieldCodes.tooLong, `Máximo ${passwordPolicy.maxLength} caracteres.`));

export const newPassword = z
  .string(issue(fieldCodes.required, "Escribe una contraseña."))
  .refine((value) => charLength(value) >= passwordPolicy.minLength, issue(fieldCodes.outOfRange, `Al menos ${passwordPolicy.minLength} caracteres.`))
  .refine((value) => charLength(value) <= passwordPolicy.maxLength, issue(fieldCodes.tooLong, `Máximo ${passwordPolicy.maxLength} caracteres.`));

export const loginSchema = z.strictObject({ email, password: anyPassword });
export const passwordResetRequestSchema = z.strictObject({ email });
export const passwordResetSchema = z.strictObject({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, issue(fieldCodes.invalidFormat, "El enlace no es válido o ha caducado.")),
  password: newPassword,
});
export const passwordChangeSchema = z.strictObject({ currentPassword: anyPassword, newPassword });

export const adminNameSchema = z
  .string()
  .transform(normalizeSpaces)
  .refine((value) => /^[\p{L}\p{M}](?:[\p{L}\p{M} '’.-]*[\p{L}\p{M}.])?$/u.test(value), issue(fieldCodes.invalidCharacters, "El nombre solo admite letras, espacios, apóstrofo, guion y punto."))
  .refine((value) => charLength(value) <= limits.admin.name, issue(fieldCodes.tooLong, `Máximo ${limits.admin.name} caracteres.`));

export const emailSchema = email;

/**
 * `errors[]` de Problem Details (§22) a partir de un error de zod. zod 4 solo conserva `params` en los
 * fallos `custom`: un campo ausente o `null` llega como `invalid_type` sin `input` y es `required`.
 * Para distinguirlo de un tipo equivocado, se valida con `reportInput: true`.
 */
export function fieldErrors(error: z.ZodError) {
  return error.issues.map((item) => {
    const params = (item as { params?: { code?: string } }).params;
    const missing = item.code === "invalid_type" && (item as { input?: unknown }).input == null;
    const code = params?.code ?? (missing ? fieldCodes.required : item.code === "unrecognized_keys" ? "unknown_field" : item.code === "too_big" ? fieldCodes.tooLong : fieldCodes.invalidFormat);
    const field = item.path.length ? item.path.join(".") : item.code === "unrecognized_keys" ? (item as { keys?: string[] }).keys?.join(",") ?? "" : "";
    const message = item.code === "unrecognized_keys" ? "Campo no permitido." : item.message;
    return { field, code, message };
  });
}
