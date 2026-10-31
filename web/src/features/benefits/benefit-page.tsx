import { treatmentCategoryHref } from "@/features/treatments";
import { useContent } from "@/hooks/use-content";
import type { Benefit } from "@/types";
import { BenefitDetailPage } from "./components/BenefitDetailPage";
import { benefitPageDescription } from "./data/benefits";
import { resolveBenefitTreatments } from "./model/related-treatments";

export function BenefitPage({ benefit }: { benefit: Benefit }) {
  const { categories } = useContent();
  const related = resolveBenefitTreatments(benefit, categories).map((item) => ({
    ...item,
    href: treatmentCategoryHref(item.ref.categoryId, item.ref.slug),
  }));
  return <BenefitDetailPage benefit={benefit} description={benefitPageDescription} related={related} />;
}
