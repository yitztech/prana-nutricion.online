import { Check, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BookingButton } from "@/components/BookingButton";
import { PranaIcon } from "@/components/PranaIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { findCategory, treatmentNotes } from "@/data/treatments";
import type { Category, TreatmentRef } from "@/types";
import { cn } from "@/lib/utils";

type TreatmentDialogProps = {
  category: Category | null;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onOpenChange: (open: boolean) => void;
};

/** Ficha de los tratamientos de una categoría: descripción, posibles beneficios e información relevante. */
function TreatmentDialog({ category, selectedSlug, onSelect, onOpenChange }: TreatmentDialogProps) {
  const treatment =
    category?.treatments.find((t) => t.slug === selectedSlug) ?? category?.treatments[0] ?? null;

  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-3xl">
        {category && treatment && (
          <>
            <DialogHeader className="flex-row items-center gap-4 border-b bg-prana-suave p-5 text-left sm:p-6">
              <PranaIcon name={category.icon} size={64} className="size-14" />
              <div>
                <DialogTitle className="font-serif text-2xl">{category.title}</DialogTitle>
                <DialogDescription className="mt-1 text-foreground/75">{category.description}</DialogDescription>
              </div>
            </DialogHeader>

            <div className="grid gap-0 sm:grid-cols-[14rem_1fr]">
              <nav aria-label={`Tratamientos de ${category.title}`} className="border-b p-3 sm:border-r sm:border-b-0">
                <ul className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
                  {category.treatments.map((t) => {
                    const selected = t.slug === treatment.slug;
                    return (
                      <li key={t.slug} className="shrink-0">
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(t.slug)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                            selected && "bg-secondary text-primary",
                          )}
                        >
                          <PranaIcon name={t.icon} size={32} className="size-8" />
                          {t.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <article aria-labelledby="ficha-titulo" className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <PranaIcon name={treatment.icon} size={56} className="size-12" />
                  <h3 id="ficha-titulo" className="text-2xl font-semibold">
                    {treatment.name}
                  </h3>
                </div>
                <p className="mt-4 leading-relaxed text-foreground/85">{treatment.description}</p>

                <h4 className="mt-6 font-serif text-lg font-semibold">Posibles beneficios</h4>
                <ul className="mt-2 space-y-2">
                  {category.benefits.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-foreground/85">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>

                <h4 className="mt-6 font-serif text-lg font-semibold">Información relevante</h4>
                <ul className="mt-2 space-y-2">
                  {treatmentNotes.map((n) => (
                    <li key={n} className="flex gap-2 text-sm text-muted-foreground">
                      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lavanda" />
                      {n}
                    </li>
                  ))}
                </ul>

                <BookingButton
                  origin="ficha"
                  treatment={treatment.name}
                  label="Solicitar valoración"
                  className="mt-7 h-11 w-full px-6 sm:w-auto"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Se abre WhatsApp con tu mensaje listo. La clínica te confirma día y hora.
                </p>
              </article>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type TreatmentDialogContextValue = { openTreatment: (ref: TreatmentRef) => void };

const TreatmentDialogContext = createContext<TreatmentDialogContextValue | null>(null);

/** Una sola ficha para toda la página: la abren el catálogo, los beneficios, las promociones y el pie. */
export function TreatmentDialogProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<TreatmentRef | null>(null);
  const openTreatment = useCallback((ref: TreatmentRef) => setSelection(ref), []);
  const value = useMemo(() => ({ openTreatment }), [openTreatment]);

  return (
    <TreatmentDialogContext value={value}>
      {children}
      <TreatmentDialog
        category={selection ? (findCategory(selection.categoryId) ?? null) : null}
        selectedSlug={selection?.slug ?? null}
        onSelect={(slug) => setSelection((s) => (s ? { ...s, slug } : s))}
        onOpenChange={(open) => !open && setSelection(null)}
      />
    </TreatmentDialogContext>
  );
}

export function useTreatmentDialog() {
  const context = useContext(TreatmentDialogContext);
  if (!context) throw new Error("useTreatmentDialog necesita TreatmentDialogProvider");
  return context;
}
