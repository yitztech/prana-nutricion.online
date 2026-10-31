import type { Category, TreatmentRef } from "../../../types/index.ts";

/** Una referencia desconocida no abre una ficha vacía ni muestra otro tratamiento. */
export function resolveSelection(categories: readonly Category[], selection: TreatmentRef | null) {
  if (!selection) return null;
  const category = categories.find((item) => item.id === selection.categoryId);
  if (!category) return null;
  const treatment = selection.slug
    ? category.treatments.find((item) => item.slug === selection.slug)
    : category.treatments[0];
  return treatment ? { category, treatment } : null;
}
