import { ArrowRight } from "lucide-react";
import { Pillar } from "@/components/patterns/Pillar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { Section } from "@/components/ui/section";
import { Heading, Script, Text } from "@/components/ui/typography";
import { Veil } from "@/components/ui/veil";
import { pillars } from "@/data/site";

const srcSet = "/img/filosofia-960.webp 960w, /img/filosofia-1440.webp 1440w, /img/filosofia-1971.webp 1971w";

export function Philosophy() {
  return (
    <Section id="nosotros" aria-labelledby="nosotros-titulo" tone="soft" layered>
      <Photo
        framing="scene"
        src="/img/filosofia-1440.webp"
        srcSet={srcSet}
        sizes="(min-width: 1280px) 72rem, 100vw"
        alt=""
        width={1971}
        height={798}
        loading="lazy"
        decoding="async"
      />
      <Photo
        framing="texture"
        src="/img/fondo-1280.webp"
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="md:hidden"
      />
      <Veil variant="scene" />

      <Container className="grid items-center gap-8 py-12 md:py-14 xl:grid-cols-content-aside xl:py-12">
        <div className="mx-auto max-w-lg text-center md:mx-0 md:text-left">
          <Heading id="nosotros-titulo" variant="feature">
            Más que estética,
            <Script variant="feature">bienestar integral</Script>
          </Heading>
          <Text variant="body" className="mt-4">
            En Praná creemos en una belleza que nace del equilibrio. Por eso, combinamos tecnología,
            experiencia y un trato humano para ayudarte a sentirte bien por dentro y por fuera.
          </Text>
          <Button asChild variant="cta" size="cta" className="mt-6">
            <a href="#contacto">
              Conoce nuestra filosofía
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {pillars.map((item) => (
            <Pillar key={item.icon} item={item} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
