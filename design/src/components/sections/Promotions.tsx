import { EmptyPromotions, PromotionCard } from "@/components/patterns/PromotionCard";
import { SectionHeader } from "@/components/patterns/SectionHeader";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { activePromotions, promotions, todayInClinic } from "@/data/promotions";

export function Promotions() {
  const current = activePromotions(promotions, todayInClinic());

  return (
    <Section id="promociones" aria-labelledby="promociones-titulo" className="py-14 sm:py-20">
      <Container>
        <SectionHeader
          id="promociones-titulo"
          title="Promociones"
          intro="Opciones especiales por tiempo limitado. Consulta las condiciones en tu valoración."
          variant="title"
          introVariant="muted"
          className="max-w-2xl"
        />
        <div className="mt-10">
          {current.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {current.map((p) => (
                <li key={p.id} className="flex">
                  <PromotionCard promotion={p} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPromotions />
          )}
        </div>
      </Container>
    </Section>
  );
}
