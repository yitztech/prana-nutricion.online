import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PranaIcon } from "@/components/prana-icon";
import { TreatmentDialog } from "@/components/treatment-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categories, type Category } from "@/data/content";

type Selection = { categoryId: string; slug: string | null } | null;

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

function CategoryCard({ category, onOpen }: { category: Category; onOpen: (slug: string | null) => void }) {
  return (
    <Card
      className="gap-0 overflow-hidden rounded-2xl border-white/80 py-0 shadow-soft"
    >
      <div className="relative">
        <CategoryPhoto category={category} className="aspect-[3/2] w-full object-cover" />
        <PranaIcon
          name={category.icon}
          size={64}
          className="absolute -bottom-7 left-4 size-14 ring-4 ring-white mix-blend-normal"
        />
      </div>
      <div className="flex flex-1 flex-col px-5 pt-9 pb-5">
        <h3 className="text-center text-xl leading-tight font-semibold lg:text-[1.35rem]">{category.title}</h3>

        {/* Escritorio: cada tratamiento abre su ficha. Tableta: resumen en una línea. */}
        <ul className="mt-4 mb-5 hidden space-y-1 lg:block">
          {category.treatments.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => onOpen(t.slug)}
                className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left text-sm text-foreground/85 transition-colors hover:bg-secondary hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <PranaIcon name={t.icon} size={28} className="size-7" />
                {t.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-5 text-center text-sm text-muted-foreground lg:hidden">
          {category.treatments.map((t) => t.name).join(" · ")}
        </p>

        <Button
          type="button"
          onClick={() => onOpen(null)}
          className="bg-prana-boton mt-auto h-11 w-full rounded-full font-semibold text-white shadow-soft hover:brightness-110"
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
        <CategoryPhoto category={category} className="h-20 w-20 shrink-0 object-cover" />
        <PranaIcon name={category.icon} size={40} className="-ml-8 size-10 ring-2 ring-white mix-blend-normal" />
        <span className="min-w-0 flex-1 py-3">
          <span className="block font-serif text-base font-semibold">{category.title}</span>
          <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {category.treatments.map((t) => t.name).join(" · ")}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="mr-3 size-5 shrink-0 text-primary" />
      </button>
    </li>
  );
}

export function Catalog() {
  const [selection, setSelection] = useState<Selection>(null);
  const selectedCategory = categories.find((c) => c.id === selection?.categoryId) ?? null;

  return (
    <section id="tratamientos" aria-labelledby="tratamientos-titulo" className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="tratamientos-titulo" className="text-3xl font-semibold sm:text-4xl">
            Encuentra tu tratamiento
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explora nuestros tratamientos y descubre opciones de bienestar adaptadas a tus necesidades.
          </p>
        </header>

        {/* Destino de «Promociones»: los paquetes están en este catálogo, en móvil y en escritorio. */}
        <span id="promociones" aria-hidden="true" />
        <div className="mt-10 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(slug) => setSelection({ categoryId: category.id, slug })}
            />
          ))}
        </div>

        <ul className="mt-8 space-y-3 md:hidden">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onOpen={() => setSelection({ categoryId: category.id, slug: null })}
            />
          ))}
        </ul>
      </div>

      <TreatmentDialog
        category={selectedCategory}
        selectedSlug={selection?.slug ?? null}
        onSelect={(slug) => setSelection((s) => (s ? { ...s, slug } : s))}
        onOpenChange={(open) => !open && setSelection(null)}
      />
    </section>
  );
}
