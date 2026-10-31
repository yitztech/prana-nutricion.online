import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { Heading, Text } from "@/components/ui/typography";
import type { Benefit, Category, Treatment } from "@/types";

type BenefitDetailPageProps = {
  benefit: Benefit;
  description: string;
  related: readonly { category: Category; treatment: Treatment; href: string }[];
};

/** Vista de lectura: recibe sus tratamientos resueltos y compone las primitivas existentes. */
export function BenefitDetailPage({ benefit, description, related }: BenefitDetailPageProps) {
  return (
    <>
      <Section tone="soft" className="pt-6 pb-10 sm:pt-8 sm:pb-14">
        <Container size="narrow">
          <TextLink href="/#beneficios" className="inline-flex items-center gap-2">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver a todos los objetivos
          </TextLink>
          <div className="mt-8 max-w-3xl">
            <PranaIcon name={benefit.icon} frame="disc" size={96} className="mb-5 size-20" />
            <Heading as="h1" variant="section">{benefit.title}</Heading>
            <Text variant="body" className="mt-4">{description}</Text>
            <BookingButton origin="pagina-objetivo" treatment={benefit.title} className="mt-6 w-full sm:w-auto" />
          </div>
        </Container>
      </Section>
      <Section aria-labelledby="relacionados-titulo" className="py-10 sm:py-14">
        <Container size="narrow">
          <Heading id="relacionados-titulo" variant="title">Tratamientos relacionados</Heading>
          <div className="mt-8 flex flex-col gap-8">
            {related.map(({ category, treatment, href }) => (
              <article key={`${category.id}-${treatment.slug}`} aria-labelledby={`${category.id}-${treatment.slug}-titulo`} className="grid gap-4 border-b pb-8 md:grid-cols-2 md:gap-8">
                <div className="flex items-start gap-3">
                  <PranaIcon name={treatment.icon} size={56} className="size-12" />
                  <div>
                    <Heading id={`${category.id}-${treatment.slug}-titulo`} variant="subtitle">{treatment.name}</Heading>
                    <Text variant="small-muted" className="mt-2">{category.title}</Text>
                  </div>
                </div>
                <div>
                  <Text variant="paragraph">{treatment.description}</Text>
                  <BrandButton asChild variant="cta-outline" size="cta-sm" className="mt-5 w-full sm:w-auto">
                    <a href={href}>
                      Conocer tratamiento
                      <ArrowRight aria-hidden="true" data-icon="inline-end" />
                      <span className="sr-only">: {treatment.name}</span>
                    </a>
                  </BrandButton>
                </div>
              </article>
            ))}
          </div>
          <Text variant="note" className="mt-8 max-w-2xl">
            Lo definimos contigo en tu valoración. Los resultados varían en cada persona; no se garantizan resultados específicos.
          </Text>
        </Container>
      </Section>
    </>
  );
}
