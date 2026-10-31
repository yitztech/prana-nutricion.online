import assert from "node:assert/strict";
import { test } from "node:test";
import { categories } from "../data/catalog.ts";
import { resolveSelection } from "./selection.ts";

test("abre el primer tratamiento de una categoría o el tratamiento indicado", () => {
  const first = resolveSelection(categories, { categoryId: "reductivos" });
  assert.equal(first?.treatment.slug, "mini-lipo");
  const selected = resolveSelection(categories, { categoryId: "reductivos", slug: "cavitacion" });
  assert.equal(selected?.category.id, "reductivos");
  assert.equal(selected?.treatment.name, "Cavitación");
});

test("no abre fichas para referencias inválidas o categorías sin tratamientos", () => {
  assert.equal(resolveSelection(categories, null), null);
  assert.equal(resolveSelection(categories, { categoryId: "desconocida" }), null);
  assert.equal(resolveSelection(categories, { categoryId: "reductivos", slug: "mesoterapia" }), null);
  assert.equal(resolveSelection([{ ...categories[0], treatments: [] }], { categoryId: "reductivos" }), null);
});
