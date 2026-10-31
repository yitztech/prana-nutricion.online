import { ArrowRight, ChevronRight } from "lucide-react";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Surface } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { treatmentCategoryHref } from "@/features/treatments";
import type { Category } from "@/types";

type CategoryPhotoProps = { category: Category; framing: "card" | "thumb" };

function CategoryPhoto({ category, framing }: CategoryPhotoProps) {
  return (
    <Photo
      framing={framing}
      src={`/img/${category.photo}-640.webp`}
      srcSet={`/img/${category.photo}-640.webp 640w, /img/${category.photo}-1024.webp 1024w`}
      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 96px"
      alt={category.photoAlt}
      width={1536}
      height={1024}
      loading="lazy"
      decoding="async"
    />
  );
}

const treatmentSummary = (category: Category) => category.treatments.map((t) => t.name).join(" · ");

type CategoryCardProps = { category: Category };

/** Tarjeta de categoría (tableta y escritorio): foto, panel montado y tratamientos. */
export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card variant="media">
      <CategoryPhoto category={category} framing="card" />
      <Surface variant="overlap" className="relative -mt-8 flex flex-1 flex-col px-5 pb-5">
        <div className="flex items-center gap-3 lg:block">
          <PranaIcon
            name={category.icon}
            size={80}
            frame="ring"
            className="relative -mt-7 size-16 lg:absolute lg:-top-9 lg:left-4 lg:mt-0 lg:size-18"
          />
          <Heading as="h3" variant="card" className="lg:mt-5 lg:pl-14 lg:text-center">
            {category.title}
          </Heading>
        </div>

        {/* Escritorio: cada tratamiento enlaza a su apartado. Tableta: resumen en una línea, como en el mockup. */}
        <ul className="mt-4 mb-5 hidden space-y-1 lg:block">
          {category.treatments.map((t) => (
            <li key={t.slug}>
              <BrandButton asChild variant="list" size="list">
                <a href={treatmentCategoryHref(category.id, t.slug)}>
                  <PranaIcon name={t.icon} size={32} frame="flat" className="size-8" />
                  {t.name}
                </a>
              </BrandButton>
            </li>
          ))}
        </ul>
        <Text className="mt-3 mb-5 lg:hidden">{treatmentSummary(category)}</Text>

        <BrandButton asChild variant="cta" size="cta" className="mt-auto w-full">
          <a href={treatmentCategoryHref(category.id)}>
            {category.cta}
            <ArrowRight className="size-4" />
            <span className="sr-only">: {category.title}</span>
          </a>
        </BrandButton>
      </Surface>
    </Card>
  );
}

/** Fila de categoría (móvil): miniatura, icono, título y resumen. */
export function CategoryRow({ category }: { category: Category }) {
  return (
    <li>
      <BrandButton asChild variant="tile" size="tile">
        <a href={treatmentCategoryHref(category.id)}>
          <CategoryPhoto category={category} framing="thumb" />
          <PranaIcon name={category.icon} size={40} frame="ring-sm" className="-ml-8 size-10" />
          <span className="min-w-0 flex-1 py-3">
            <Text asChild variant="row-title">
              <span className="block">{category.title}</span>
            </Text>
            <Text asChild variant="row-summary">
              <span className="mt-0.5">{treatmentSummary(category)}</span>
            </Text>
          </span>
          <ChevronRight aria-hidden="true" className="mr-3 size-5 shrink-0" />
        </a>
      </BrandButton>
    </li>
  );
}
