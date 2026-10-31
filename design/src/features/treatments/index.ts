/** Entrada pública: los consumidores no dependen de componentes ni estado internos. */
export { TreatmentDialogProvider } from "./treatment-dialog-provider";
export { useTreatmentDialog } from "./model/treatment-dialog-context";
export { categories, findCategory, treatmentRefLabel } from "./data/catalog";
export { categoryIdFromPath, treatmentCategoryHref } from "./model/routes";
export { TreatmentPage } from "./treatment-page";
