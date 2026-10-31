import { createContext, useContext } from "react";
import type { TreatmentRef } from "@/types";

type TreatmentDialogContextValue = { openTreatment: (ref: TreatmentRef) => void };
export const TreatmentDialogContext = createContext<TreatmentDialogContextValue | null>(null);

export function useTreatmentDialog() {
  const context = useContext(TreatmentDialogContext);
  if (!context) throw new Error("useTreatmentDialog necesita TreatmentDialogProvider");
  return context;
}
