import { ArrowRight, ChevronRight } from "lucide-react";
import { PranaIcon } from "@/components/PranaIcon";
import { useTreatmentDialog } from "@/components/home/TreatmentDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categories } from "@/data/treatments";
import type { Category } from "@/types";

function CategoryPhoto({ category, className }: { category: Category; className?: string }) {
  return (
    <img
      src={`/img/${category.photo}-640.webp`}
      srcSet={`/img/${category.photo}-640.webp 640w, /img/${category.photo}-1024.webp 1024w`}
      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 96px"
      alt={category.photoAlt}
      width={1536}
      height={1024}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

function CategoryCard({ category, onOpen }: { category: Category; onOpen: (slug?: string) => void }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl border-[#f6dbe7] bg-white py-0 shadow-soft">
      <CategoryPhoto category={category} className="aspect-[5/2] w-full object-cover lg:aspect-[16/10]" />
      {/* Panel que se monta sobre la foto, como en el mockup. */}
      <div className="relative -mt-8 flex flex-1 flex-col rounded-t-3xl bg-prana-tarjeta px-5 pb-5">
        <div className="flex items-center gap-3 lg:block">
          <span className="relative -mt-7 grid shrink-0 place-items-center rounded-full shadow-soft ring-4 ring-white/80 lg:absolute lg:-top-9 lg:left-4 lg:mt-0">
            <PranaIcon name={category.icon} size={80} className="size-16 mix-blend-normal lg:size-[4.5rem]" />
          </span>
          <h3 className="text-2xl leading-tight font-bold text-balance md:text-[1.3rem] lg:mt-5 lg:pl-14 lg:text-center lg:text-[1.65rem]">
            {category.title}
          </h3>
        </div>

        {/* Escritorio: cada tratamiento abre su ficha. Tableta: resumen en una línea, como en el mockup. */}
        <ul className="mt-4 mb-5 hidden space-y-1 lg:block">
          {category.treatments.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => onOpen(t.slug)}
                className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1 text-left text-base text-foreground/90 transition-colors hover:bg-white hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="grid shrink-0 place-items-center rounded-full bg-white shadow-sm">
                  <PranaIcon name={t.icon} size={32} className="size-8" />
                </span>
                {t.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-5 text-base text-foreground/85 lg:hidden">
          {category.treatments.map((t) => t.name).join(" · ")}
        </p>

        <Button
          type="button"
          onClick={() => onOpen()}
          variant="prana"
          size="prana"
          className="mt-auto w-full"
        >
          {category.cta}
          <ArrowRight className="size-4" />
          <span className="sr-only">: {category.title}</span>
        </Button>
      </div>
    </Card>
  );
}

function CategoryRow({ category, onOpen }: { category: Category; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white bg-white text-left shadow-soft transition-colors hover:bg-secondary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <CategoryPhoto category={category} className="h-[4.5rem] w-20 shrink-0 object-cover" />
        <PranaIcon name={category.icon} size={40} className="-ml-8 size-10 ring-2 ring-white mix-blend-normal" />
        <span className="min-w-0 flex-1 py-3">
          <span className="block font-serif text-base font-bold">{category.title}</span>
          <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {category.treatments.map((t) => t.name).join(" · ")}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="mr-3 size-5 shrink-0 text-primary" />
      </button>
    </li>
  );
}

export function TreatmentCatalog() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <section id="tratamientos" aria-labelledby="tratamientos-titulo" className="bg-background pt-10 pb-12 sm:pt-12 sm:pb-16">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <h2 id="tratamientos-titulo" className="text-[1.75rem] font-bold text-[#24202f] sm:text-4xl lg:text-[2.6rem]">
            Encuentra tu tratamiento
          </h2>
          <p className="mt-2 text-sm text-foreground/80 sm:text-base">
            Explora nuestros tratamientos y descubre opciones de bienestar adaptadas a tus necesidades.
          </p>
        </header>

        <div className="mt-8 hidden gap-5 md:grid lg:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(slug) => openTreatment({ categoryId: category.id, slug })}
            />
          ))}
        </div>

        <ul className="mt-8 space-y-3 md:hidden">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onOpen={() => openTreatment({ categoryId: category.id })}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
