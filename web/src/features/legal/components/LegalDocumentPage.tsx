import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/typography";
import type { LegalDocument } from "@/types";
import { RichText } from "./RichText";

export function LegalDocumentPage({ document, updatedLabel }: { document: LegalDocument; updatedLabel: string }) {
  return (
    <Section aria-labelledby="legal-titulo" className="py-12 sm:py-16">
      <Container size="narrow">
        <article>
          <Heading as="h1" id="legal-titulo" variant="section">{document.title}</Heading>
          <Text variant="small-muted" className="mt-3">Última actualización: {updatedLabel}</Text>
          <Prose className="mt-8">
            <RichText doc={document.body} />
          </Prose>
        </article>
      </Container>
    </Section>
  );
}
