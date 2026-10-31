import { useMemo, type ReactNode } from "react";
import { TreatmentDialog } from "./components/TreatmentDialog";
import { treatmentNotes } from "./data/catalog";
import { TreatmentDialogContext } from "./model/treatment-dialog-context";
import { useTreatmentSelection } from "./model/use-treatment-selection";

/** Ficha de consulta rápida para los tratamientos incluidos en las promociones. */
export function TreatmentDialogProvider({ children }: { children: ReactNode }) {
  const { selected, openTreatment, selectTreatment, onOpenChange } = useTreatmentSelection();
  const value = useMemo(() => ({ openTreatment }), [openTreatment]);

  return (
    <TreatmentDialogContext value={value}>
      {children}
      <TreatmentDialog
        category={selected?.category ?? null}
        treatment={selected?.treatment ?? null}
        notes={treatmentNotes}
        onSelect={selectTreatment}
        onOpenChange={onOpenChange}
      />
    </TreatmentDialogContext>
  );
}
