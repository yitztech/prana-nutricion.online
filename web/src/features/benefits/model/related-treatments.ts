import type { Benefit, Category } from "../../../types/index.ts";

export function resolveBenefitTreatments(benefit: Benefit, categories: readonly Category[]) {
  return benefit.treatments.flatMap((ref) => {
    const category = categories.find((item) => item.id === ref.categoryId);
    const treatment = ref.slug
      ? category?.treatments.find((item) => item.slug === ref.slug)
      : category?.treatments[0];
    return category && treatment ? [{ category, treatment, ref }] : [];
  });
}
