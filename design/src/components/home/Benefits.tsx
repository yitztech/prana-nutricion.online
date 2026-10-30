import { useTreatmentDialog } from "@/components/home/TreatmentDialog";
import { PranaIcon } from "@/components/PranaIcon";
import { benefits } from "@/data/site";
import { treatmentRefLabel } from "@/data/treatments";

/** Banda del mockup entre el catálogo y la filosofía: objetivos y sus tratamientos relacionados. */
export function Benefits() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="bg-prana-banda">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center lg:text-left">
          <h2 id="beneficios-titulo" className="text-2xl font-semibold sm:text-3xl">
            Objetivos que te acompañamos a cuidar
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            En tu valoración definimos contigo el objetivo y los tratamientos adecuados para ti.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="flex gap-3 rounded-2xl bg-white/70 p-4 lg:flex-col lg:bg-transparent lg:p-0"
            >
              <PranaIcon name={benefit.icon} size={56} className="size-12 lg:size-14" />
              <div className="min-w-0">
                <h3 className="font-sans text-sm leading-snug font-semibold">{benefit.title}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Tratamientos relacionados con ${benefit.title}`}>
                  {benefit.treatments.map((ref) => (
                    <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
                      <button
                        type="button"
                        onClick={() => openTreatment(ref)}
                        className="min-h-8 rounded-full border border-primary/25 bg-white px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        {treatmentRefLabel(ref)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
