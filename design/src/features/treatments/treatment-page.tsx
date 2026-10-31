import type { ReactNode } from "react";
import type { Category } from "@/types";
import { TreatmentCategoryPage } from "./components/TreatmentCategoryPage";
import { treatmentNotes } from "./data/catalog";

export function TreatmentPage({ category, hero, children }: { category: Category; hero?: boolean; children?: ReactNode }) {
  return <TreatmentCategoryPage category={category} notes={treatmentNotes} hero={hero}>{children}</TreatmentCategoryPage>;
}
