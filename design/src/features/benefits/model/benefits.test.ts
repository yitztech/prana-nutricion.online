import assert from "node:assert/strict";
import { test } from "node:test";
import { benefits, findBenefit } from "../data/benefits.ts";
import { categories } from "../../treatments/data/catalog.ts";
import { resolveBenefitTreatments } from "./related-treatments.ts";
import { benefitHref, benefitIdFromPath } from "./routes.ts";

test("los cinco objetivos tienen rutas únicas y todos sus tratamientos existen", () => {
  assert.equal(benefits.length, 5);
  assert.equal(new Set(benefits.map((benefit) => benefitHref(benefit.id))).size, 5);
  for (const benefit of benefits) {
    assert.equal(benefitIdFromPath(benefitHref(benefit.id)), benefit.id);
    assert.equal(benefitIdFromPath(`/beneficios/${benefit.id}`), benefit.id);
    assert.equal(findBenefit(benefit.id), benefit);
    const related = resolveBenefitTreatments(benefit, categories);
    assert.equal(related.length, benefit.treatments.length, benefit.title);
    assert.deepEqual(related.map((item) => item.treatment.slug), benefit.treatments.map((ref) => ref.slug));
  }
});

test("un objetivo o una referencia desconocidos no muestran otro tratamiento", () => {
  assert.equal(findBenefit("desconocido"), undefined);
  for (const path of ["/", "/tratamientos/reductivos/", "/beneficios/", "/beneficios/x/otra", "/beneficios/%2F"]) {
    assert.equal(benefitIdFromPath(path), null);
  }
  assert.deepEqual(resolveBenefitTreatments({ ...benefits[0], treatments: [
    { categoryId: "no-existe", slug: "cavitacion" },
    { categoryId: "reductivos", slug: "mesoterapia" },
  ] }, categories), []);
});
