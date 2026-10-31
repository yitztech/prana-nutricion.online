import { EmptyPromotions, PromotionCard } from "@/components/patterns/PromotionCard";
import { SectionHeader } from "@/components/patterns/SectionHeader";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { isUpcoming, promotions, todayInClinic, visiblePromotions } from "@/data/promotions";
import { cn } from "@/lib/utils";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { Gift } from "lucide-react";
import { treatmentCategoryHref } from "@/features/treatments";

export function Promotions({ showCatalogLink = true }: { showCatalogLink?: boolean }) {
  const today = todayInClinic();
  const visible = visiblePromotions(promotions, today);

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
          {visible.length > 0 ? (
            <ul className={cn("grid gap-6", visible.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "mx-auto max-w-4xl")}>
              {visible.map((p) => (
                <li key={p.id} className="flex">
                  <PromotionCard promotion={p} featured={visible.length === 1} upcoming={isUpcoming(p, today)} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPromotions />
          )}
        </div>
        {visible.length > 0 && showCatalogLink && <div className="mt-6">
          <BrandButton asChild variant="cta-outline" size="cta">
            <a href={treatmentCategoryHref("promociones")}><Gift aria-hidden="true" data-icon="inline-start" />Ver paquetes</a>
          </BrandButton>
        </div>}
      </Container>
    </Section>
  );
}
