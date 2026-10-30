import { BookingButton } from "@/components/brand/BookingButton";
import { Highlight } from "@/components/patterns/Highlight";
import { Container } from "@/components/ui/container";
import { Photo, PhotoFrame } from "@/components/ui/photo";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Script, Text } from "@/components/ui/typography";
import { Veil } from "@/components/ui/veil";
import { heroHighlights } from "@/data/site";

const heroSrcSet = "/img/hero-960.webp 960w, /img/hero-1440.webp 1440w, /img/hero-1971.webp 1971w";

export function Hero() {
  return (
    <Section
      id="inicio"
      aria-labelledby="hero-titulo"
      tone="soft"
      layered
      className="md:flex md:flex-col md:justify-center lg:min-h-hero"
    >
      {/* Móvil: la mujer en un arco a la derecha. Desde md: la fotografía es el fondo completo. */}
      <PhotoFrame shape="arch">
        <Photo
          framing="hero"
          src="/img/hero-1440.webp"
          srcSet={heroSrcSet}
          sizes="(min-width: 768px) 100vw, 60vw"
          alt="Mujer sonriente con los ojos cerrados, rodeada de flores rosas"
          width={1971}
          height={798}
          fetchPriority="high"
        />
      </PhotoFrame>
      <Veil variant="hero" />

      <Script
        aria-hidden="true"
        variant="tagline"
        className="pointer-events-none absolute top-1/7 right-1/32 hidden xl:block"
      >
        Empieza
        <br />
        cuando tú
        <br />
        decides ♡
      </Script>

      <Container className="relative pt-6 pb-8 md:pt-14 md:pb-12 lg:pt-10 lg:pb-10">
        <div className="md:max-w-xl lg:max-w-2xl">
          <Eyebrow variant="hero">Praná · Nutrición y bienestar</Eyebrow>
          <Heading as="h1" id="hero-titulo" variant="display" className="mt-2 md:mt-3">
            Tu bienestar
            <Script variant="display">también se nota</Script>
          </Heading>
          <Text variant="lead" className="mt-2 max-w-5/8 sm:max-w-11/20 md:mt-4 md:max-w-lg">
            Tratamientos personalizados para realzar tu belleza, mejorar tu bienestar y sentirte
            increíble contigo.
          </Text>
        </div>
        <BookingButton origin="hero" className="mt-5 md:mt-7" />

        <ul className="mt-7 grid max-w-2xl grid-cols-3 gap-1.5 sm:gap-6 md:mt-10">
          {heroHighlights.map((item) => (
            <Highlight key={item.icon} item={item} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
