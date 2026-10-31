import { PromotionCard } from "@/components/patterns/PromotionCard";
import { SectionHeader } from "@/components/patterns/SectionHeader";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useContent } from "@/hooks/use-content";

/** Archivo informativo de campañas anteriores, independiente de las ofertas vigentes. */
export function PastPromotions() {
  const { archivedPromotions } = useContent();
  return (
    <Section id="promociones-pasadas" aria-labelledby="promociones-pasadas-titulo" tone="soft" className="py-14 sm:py-20">
      <Container>
        <SectionHeader
          id="promociones-pasadas-titulo"
          title="Promociones pasadas"
          intro="Conoce nuestras campañas anteriores. Estas ofertas han finalizado y sus precios y condiciones ya no están vigentes."
          variant="title"
          introVariant="muted"
          className="max-w-2xl"
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {archivedPromotions.map((promotion) => (
            <li key={promotion.id} className="flex"><PromotionCard promotion={promotion} /></li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
