import type { Category, TreatmentRef } from "@/types";

/** Lo que vale para todas las fichas. Precios, sesiones y promociones vigentes los confirma la clínica. */
export const treatmentNotes = [
  "En tu valoración el equipo confirma si este tratamiento es adecuado para ti.",
  "Consulta las condiciones de cada promoción; fuera de ellas, precio, sesiones y duración se acuerdan en la valoración.",
  "Los resultados varían en cada persona; no se garantizan resultados específicos.",
];

export function findCategory(categories: readonly Category[], id: string) {
  return categories.find((c) => c.id === id);
}

/** Nombre visible de una referencia: el tratamiento, o la categoría si no indica uno. */
export function treatmentRefLabel(categories: readonly Category[], ref: TreatmentRef) {
  const category = findCategory(categories, ref.categoryId);
  if (!category) return "";
  if (!ref.slug) return category.title;
  return category.treatments.find((t) => t.slug === ref.slug)?.name ?? category.title;
}
