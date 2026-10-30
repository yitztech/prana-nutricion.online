import { ChevronDown } from "lucide-react";
import { useTreatmentDialog } from "@/components/home/TreatmentDialog";
import { PranaIcon } from "@/components/PranaIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { benefits } from "@/data/site";
import { treatmentRefLabel } from "@/data/treatments";

/** Franja del mockup entre el catálogo y la filosofía. Cada objetivo despliega sus tratamientos relacionados. */
export function Benefits() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="bg-prana-banda">
      <h2 id="beneficios-titulo" className="sr-only">
        Objetivos que te acompañamos a cuidar
      </h2>
      <ul className="mx-auto grid max-w-[88rem] grid-cols-2 gap-x-2 gap-y-1 px-3 py-4 sm:grid-cols-3 sm:px-6 md:grid-cols-5 md:py-5">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="last:col-span-2 last:justify-self-center sm:last:col-span-1 sm:last:justify-self-stretch">
            <Popover>
              <PopoverTrigger className="group flex w-full items-center gap-2 rounded-2xl p-1.5 text-left lg:gap-3 lg:p-2 transition-colors hover:bg-white/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-white/70">
                <span className="grid shrink-0 place-items-center rounded-full bg-white shadow-soft">
                  <PranaIcon name={benefit.icon} size={64} className="size-11 md:size-12 lg:size-16" />
                </span>
                <span className="min-w-0 text-[0.8rem] leading-snug font-medium text-foreground/90 lg:text-base">
                  {benefit.title}
                  <ChevronDown
                    aria-hidden="true"
                    className="ml-1 hidden size-3.5 text-primary transition-transform group-data-[state=open]:rotate-180 xl:inline"
                  />
                </span>
              </PopoverTrigger>
              <PopoverContent aria-label={`Tratamientos relacionados con ${benefit.title}`} className="w-64 rounded-2xl p-3">
                <p className="px-1 text-xs font-semibold text-muted-foreground">Tratamientos relacionados</p>
                <ul className="mt-2 space-y-1">
                  {benefit.treatments.map((ref) => (
                    <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
                      <button
                        type="button"
                        onClick={() => openTreatment(ref)}
                        className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        {treatmentRefLabel(ref)}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 px-1 text-xs text-muted-foreground">Lo definimos contigo en tu valoración.</p>
              </PopoverContent>
            </Popover>
          </li>
        ))}
      </ul>
    </section>
  );
}
