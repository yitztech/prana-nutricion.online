import assert from "node:assert/strict";
import { test } from "node:test";
import { legalSeed } from "./seed/legal.ts";
import { fieldErrors, isSafeHref, legalInputSchema, promotionInputSchema, richDocSchema, slugify, treatmentCreateSchema } from "./schemas.ts";

const promo = {
  status: "active",
  name: "  Reset   Praná ",
  description: "Paquete",
  endsOn: "2026-11-17",
  startsOn: "2026-11-13",
  image: { path: "/img/tratamientos-reductivos-1024.webp" },
  imageAlt: "Foto",
  ctaLabel: "Consultar",
  priceCents: 249000,
  depositCents: 50000,
};

test("normaliza y acepta una promoción completa", () => {
  const parsed = promotionInputSchema.parse(promo);
  assert.equal(parsed.name, "Reset Praná");
  assert.equal(parsed.campaign, null);
  assert.deepEqual(parsed.includes, []);
});

test("rechaza campos desconocidos, fechas invertidas y apartado mayor que el precio", () => {
  const result = promotionInputSchema.safeParse({ ...promo, extra: 1, startsOn: "2026-12-01", depositCents: 300000 });
  assert.equal(result.success, false);
  const errors = fieldErrors(result.error!);
  assert.ok(errors.some((e) => e.code === "unknown_field" && e.field === "extra"), JSON.stringify(errors));
});

test("una promoción vigente exige fin y botón; una archivada no", () => {
  const errors = fieldErrors(promotionInputSchema.safeParse({ ...promo, endsOn: null, ctaLabel: "" }).error!);
  assert.deepEqual(errors.map((e) => [e.field, e.code]).sort(), [["ctaLabel", "required"], ["endsOn", "required"]]);
  assert.equal(promotionInputSchema.safeParse({ ...promo, status: "archived", endsOn: null, ctaLabel: null }).success, true);
});

test("cuenta la longitud en caracteres y explica el máximo", () => {
  const errors = fieldErrors(promotionInputSchema.safeParse({ ...promo, name: "á".repeat(81) }).error!);
  assert.deepEqual(errors, [{ field: "name", code: "too_long", message: "Máximo 80 caracteres." }]);
  assert.equal(promotionInputSchema.safeParse({ ...promo, name: "á".repeat(80) }).success, true);
});

test("los textos legales iniciales son válidos y los enlaces peligrosos no", () => {
  for (const doc of Object.values(legalSeed)) assert.equal(legalInputSchema.safeParse({ title: doc.title, body: doc.body }).success, true);
  const evil = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] };
  assert.equal(richDocSchema.safeParse(evil).success, false);
  const html = { type: "doc", content: [{ type: "html", content: "<script>" }] };
  assert.equal(richDocSchema.safeParse(html).success, false);
  assert.equal(isSafeHref("//evil.example"), false);
  assert.equal(isSafeHref("/privacidad"), true);
});

test("descarta atributos de presentación del editor", () => {
  const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "https://a.mx", target: "_blank", class: "x" } }] }] }] };
  assert.deepEqual(richDocSchema.parse(doc).content[0], { type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "https://a.mx" } }] }] });
});

test("genera slugs sin tildes", () => {
  assert.equal(slugify("Depilación Láser — Bikini"), "depilacion-laser-bikini");
  assert.equal(treatmentCreateSchema.safeParse({ name: "X", icon: "cavitacion", description: "d", slug: "Mal Slug" }).success, false);
});
