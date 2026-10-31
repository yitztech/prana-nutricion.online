import assert from "node:assert/strict";
import { test } from "node:test";
import { categories } from "#shared/seed/catalog.ts";
import { categoryIdFromPath, treatmentCategoryHref } from "./routes.ts";

test("las cuatro categorías tienen una URL propia que se puede resolver", () => {
  assert.equal(categories.length, 4);
  const paths = categories.map((category) => treatmentCategoryHref(category.id));
  assert.equal(new Set(paths).size, 4);
  for (const category of categories) {
    assert.equal(categoryIdFromPath(treatmentCategoryHref(category.id)), category.id);
    assert.equal(categoryIdFromPath(`/tratamientos/${category.id}`), category.id);
    assert.equal(treatmentCategoryHref(category.id, category.treatments[0].slug),
      `/tratamientos/${category.id}/#${category.treatments[0].slug}`);
  }
});

test("no confunde rutas ajenas ni subrutas con categorías", () => {
  for (const path of ["/", "/privacidad", "/tratamientos/", "/tratamientos/reductivos/otra", "/tratamientos/%2F"]) {
    assert.equal(categoryIdFromPath(path), null);
  }
});
