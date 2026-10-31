import { BenefitItem } from "@/components/patterns/BenefitItem";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { benefits } from "@/features/benefits";

/** Franja del mockup entre el catálogo y la filosofía. Cada objetivo enlaza a su página de tratamientos relacionados. */
export function Benefits() {
  return (
    <Section id="beneficios" aria-labelledby="beneficios-titulo" tone="band">
      <h2 id="beneficios-titulo" className="sr-only">
        Objetivos que te acompañamos a cuidar
      </h2>
      <Container size="wide" className="px-3">
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1 py-4 sm:grid-cols-3 md:grid-cols-5 md:py-5">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              className="last:col-span-2 last:justify-self-center sm:last:col-span-1 sm:last:justify-self-stretch"
            >
              <BenefitItem benefit={benefit} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
