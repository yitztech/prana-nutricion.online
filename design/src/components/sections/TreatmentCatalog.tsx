import { CategoryCard, CategoryRow } from "@/components/patterns/CategoryCard";
import { SectionHeader } from "@/components/patterns/SectionHeader";
import { useTreatmentDialog } from "@/components/patterns/TreatmentDialog";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { categories } from "@/data/treatments";

export function TreatmentCatalog() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <Section id="tratamientos" aria-labelledby="tratamientos-titulo" className="pt-10 pb-12 sm:pt-12 sm:pb-16">
      <Container size="wide">
        <SectionHeader
          id="tratamientos-titulo"
          title="Encuentra tu tratamiento"
          intro="Explora nuestros tratamientos y descubre opciones de bienestar adaptadas a tus necesidades."
        />

        <div className="mt-8 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
      </Container>
    </Section>
  );
}
