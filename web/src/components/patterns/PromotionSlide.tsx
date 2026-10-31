import { CalendarDays, Gift } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { Eyebrow, Heading, Script, Text } from "@/components/ui/typography";
import { formatPrice, promotionPeriod } from "@/data/promotions";
import { treatmentCategoryHref } from "@/features/treatments";
import type { Promotion } from "@/types";

/** Promoción a lo ancho de la portada: lo esencial de la oferta y su foto. */
export function PromotionSlide({ promotion, upcoming }: { promotion: Promotion; upcoming: boolean }) {
  const label = [upcoming ? "Próximamente" : "Promoción", promotion.campaign].filter(Boolean).join(" · ");
  return (
    <>
      <Photo framing="texture" src="/img/fondo-1280.webp" alt="" width={1280} height={720} loading="lazy" decoding="async" />
      <Container className="grid items-center gap-8 pt-6 pb-16 md:grid-cols-2 md:py-12 lg:gap-12">
        <div>
          <Eyebrow variant="hero">{label}</Eyebrow>
          <Heading variant="display" className="mt-2 md:mt-3">
            {promotion.name}
            {promotion.tagline && <Script variant="feature" className="mt-1">{promotion.tagline}</Script>}
          </Heading>
          <Text variant="lead" className="mt-3 md:mt-4 md:max-w-lg">{promotion.description}</Text>
          <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
            {promotion.priceCents !== undefined && <Text variant="price">{formatPrice(promotion.priceCents)}</Text>}
            {promotion.reservationNote && <Text variant="small" className="hidden sm:block">{promotion.reservationNote}</Text>}
          </div>
          <Text variant="small-muted" className="mt-2 flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4" />
            {promotionPeriod(promotion)}
          </Text>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-7">
            <BookingButton
              origin="hero-promocion"
              treatment={promotion.cta.treatment ?? `la promoción ${promotion.name}`}
              label={promotion.cta.label}
            />
            <BrandButton asChild variant="cta-outline" size="cta" className="hidden sm:inline-flex">
              <a href={treatmentCategoryHref("promociones")}><Gift aria-hidden="true" />Ver detalles</a>
            </BrandButton>
          </div>
        </div>
        <Card variant="media" className="relative hidden md:flex">
          <Photo
            framing="promo"
            src={promotion.image}
            srcSet={promotion.imageSrcSet}
            sizes={promotion.imageSrcSet ? "(min-width: 768px) 50vw, 100vw" : undefined}
            alt={promotion.imageAlt}
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
          />
          {promotion.discountPercent !== undefined && (
            <Badge variant="cta" className="absolute top-3 left-3">{promotion.discountPercent}% de descuento</Badge>
          )}
        </Card>
      </Container>
    </>
  );
}
