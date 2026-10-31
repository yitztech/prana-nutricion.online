import { useCallback, useState } from "react";
import type { TreatmentRef } from "@/types";
import { categories } from "../data/catalog";
import { resolveSelection } from "./selection";

export function useTreatmentSelection() {
  const [selection, setSelection] = useState<TreatmentRef | null>(null);
  const selected = resolveSelection(categories, selection);

  const openTreatment = useCallback((ref: TreatmentRef) => {
    if (resolveSelection(categories, ref)) setSelection(ref);
  }, []);

  const selectTreatment = useCallback((slug: string) => {
    setSelection((current) => {
      if (!current) return null;
      const next = { ...current, slug };
      return resolveSelection(categories, next) ? next : current;
    });
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) setSelection(null);
  }, []);

  return { selected, openTreatment, selectTreatment, onOpenChange };
}
