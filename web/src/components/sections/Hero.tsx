import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { Highlight } from "@/components/patterns/Highlight";
import { PromotionSlide } from "@/components/patterns/PromotionSlide";
import { CarouselButton, CarouselControls, CarouselDot, CarouselSlide } from "@/components/ui/carousel";
import { Container } from "@/components/ui/container";
import { Photo, PhotoFrame } from "@/components/ui/photo";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Script, Text } from "@/components/ui/typography";
import { Veil } from "@/components/ui/veil";
import { isUpcoming, visiblePromotions } from "@/data/promotions";
import { useContent } from "@/hooks/use-content";
import { heroHighlights } from "@/data/site";
import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/lib/utils";

const heroSrcSet = "/img/hero-960.webp 960w, /img/hero-1440.webp 1440w, /img/hero-1971.webp 1971w";

/** Portada; las promociones vigentes y próximas se alternan con ella en un carrusel. */
export function Hero() {
  const { promotions, today } = useContent();
  const offers = visiblePromotions(promotions, today);
  const count = offers.length + 1;
  const carousel = useCarousel(count);
  const slideLabel = (position: number) => `${position + 1} de ${count}`;

  return (
    <Section
      id="inicio"
      aria-labelledby="hero-titulo"
      aria-roledescription={count > 1 ? "carrusel" : undefined}
      tone="soft"
      layered
      className="grid lg:min-h-hero"
      {...(count > 1 ? carousel.holdProps : {})}
    >
      <div className="grid" aria-live={carousel.playing ? "off" : "polite"}>
        <CarouselSlide
          active={carousel.index === 0}
          aria-label={slideLabel(0)}
          className="md:justify-center"
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

          <Container className={cn("relative pt-6 md:pt-14 md:pb-12 lg:pt-10 lg:pb-10", count > 1 ? "pb-16" : "pb-8")}>
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
        </CarouselSlide>

        {offers.map((promotion, i) => (
          <CarouselSlide
            key={promotion.id}
            active={carousel.index === i + 1}
            aria-label={`${slideLabel(i + 1)}: ${promotion.name}`}
            className="md:justify-center"
            onClick={carousel.stop}
          >
            <PromotionSlide promotion={promotion} upcoming={isUpcoming(promotion, today)} />
          </CarouselSlide>
        ))}
      </div>

      {count > 1 && (
        <CarouselControls className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 md:right-6 md:bottom-4 md:left-auto md:translate-x-0 lg:right-8">
          <CarouselButton aria-label="Anterior" onClick={carousel.previous}>
            <ChevronLeft aria-hidden="true" />
          </CarouselButton>
          {Array.from({ length: count }, (_, i) => (
            <CarouselDot
              key={i}
              aria-label={`Ir a la diapositiva ${slideLabel(i)}`}
              aria-current={carousel.index === i ? "true" : undefined}
              onClick={() => carousel.goTo(i)}
            />
          ))}
          <CarouselButton aria-label="Siguiente" onClick={carousel.next}>
            <ChevronRight aria-hidden="true" />
          </CarouselButton>
          <CarouselButton
            aria-label={carousel.playing ? "Detener el carrusel" : "Reanudar el carrusel"}
            onClick={carousel.toggle}
          >
            {carousel.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </CarouselButton>
        </CarouselControls>
      )}
    </Section>
  );
}
