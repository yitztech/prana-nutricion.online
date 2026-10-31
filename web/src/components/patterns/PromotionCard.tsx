import { CalendarDays, Gift } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { treatmentCategoryHref } from "@/features/treatments";
import { Badge } from "@/components/ui/badge";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Surface } from "@/components/ui/surface";
import { Heading, Script, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatPrice, promotionPeriod } from "@/data/promotions";
import { treatmentRefLabel } from "@/features/treatments";
import { useContent } from "@/hooks/use-content";
import type { ArchivedPromotion, Promotion } from "@/types";

/** Promoción vigente: foto, descuento, tratamientos incluidos, precio y vigencia. */
export function PromotionCard({ promotion, featured = false, upcoming = false }: { promotion: Promotion | ArchivedPromotion; featured?: boolean; upcoming?: boolean }) {
  const archived = promotion.status === "archived";
  const { categories } = useContent();
  return (
    <Card variant="media" role="article" aria-label={promotion.name} className={cn("w-full", featured && "md:grid md:grid-cols-2")}>
      <div className="relative">
        <Photo
          framing={featured ? "offer" : "promo"}
          src={promotion.image}
          srcSet={promotion.imageSrcSet}
          sizes={promotion.imageSrcSet ? featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : undefined}
          alt={promotion.imageAlt}
          width={1536}
          height={1024}
          loading="lazy"
          decoding="async"
        />
        {promotion.discountPercent !== undefined && (
          <Badge variant="cta" className="absolute top-3 left-3">
            {promotion.discountPercent}% de descuento
          </Badge>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col p-5", featured && "sm:p-8")}>
        {archived && <Badge variant="secondary" className="mb-4">Promoción pasada · No vigente</Badge>}
        {archived && promotion.periodLabel && <Text variant="small-muted" className="mb-2">{promotion.periodLabel}</Text>}
        {promotion.campaign && <Badge variant="secondary" className="mb-4">{upcoming ? `Próximamente · ${promotion.campaign}` : promotion.campaign}</Badge>}
        <Heading as="h3" variant={featured ? "section" : "block"}>
          {promotion.name}
        </Heading>
        {promotion.tagline && <Script variant="inline" className="mt-2">{promotion.tagline}</Script>}
        <Text variant="small" className="mt-2">
          {promotion.description}
        </Text>
        {archived && promotion.offerLabel && <Text variant="emphasis" className="mt-4">{promotion.offerLabel}</Text>}
        {archived && promotion.discounts && (
          <Text asChild variant="small">
            <dl aria-label="Descuentos anunciados" className="mt-5 flex flex-col gap-3">
              {promotion.discounts.map((discount) => (
                <div key={discount.label} className="flex flex-wrap items-center justify-between gap-2">
                  <dt>{discount.label}</dt>
                  <Text asChild variant="label"><dd>{discount.percent}% de descuento</dd></Text>
                </div>
              ))}
            </dl>
          </Text>
        )}
        {promotion.includes && (
          <ul aria-label="El paquete incluye" className="mt-6 flex flex-col gap-4">
            {promotion.includes.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <PranaIcon name={item.icon} frame="disc" size={48} className="size-12" />
                <Text asChild variant="emphasis">
                  <span>{item.quantity ? `${item.quantity} ` : ""}{item.label}</span>
                </Text>
                {item.free && <Badge variant="secondary">Gratis</Badge>}
              </li>
            ))}
          </ul>
        )}
        {promotion.treatments.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={archived ? "Información de los tratamientos" : "Tratamientos incluidos"}>
            {promotion.treatments.map((ref) => (
              <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
                <BrandButton asChild variant="chip" size="chip">
                  <a href={treatmentCategoryHref(ref.categoryId, ref.slug)}>{treatmentRefLabel(categories, ref)}</a>
                </BrandButton>
              </li>
            ))}
          </ul>
        )}
        {(!archived || promotion.priceCents !== undefined || promotion.depositCents !== undefined) && <Text asChild variant="small">
          <dl className="mt-6 flex flex-col gap-3">
            {promotion.priceCents !== undefined && (
              <div className="flex flex-col gap-2">
                <Text asChild variant="muted">
                  <dt>{archived ? "Precio anunciado · MXN" : "Inversión total · MXN"}</dt>
                </Text>
                <Text asChild variant="price">
                  <dd>{formatPrice(promotion.priceCents)}</dd>
                </Text>
              </div>
            )}
            {promotion.depositCents !== undefined && (
              <div className="flex flex-wrap gap-2">
                <dt>Apartado:</dt>
                <Text asChild variant="label"><dd>{formatPrice(promotion.depositCents)} MXN</dd></Text>
              </div>
            )}
            {!archived && <div className="flex items-center gap-2">
              <Text asChild variant="muted">
                <dt className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {upcoming ? "Disponible:" : "Vigencia:"}
                </dt>
              </Text>
              <dd>{promotionPeriod(promotion)}</dd>
            </div>}
          </dl>
        </Text>}
        {promotion.reservationNote && <Text variant="small" className="mt-3">{promotion.reservationNote}</Text>}
        {!archived && <BookingButton
          origin="promocion"
          treatment={promotion.cta.treatment ?? `la promoción ${promotion.name}`}
          label={promotion.cta.label}
          className="mt-5 w-full"
        />}
        <Text variant="note" className="mt-3">{archived
          ? "Oferta finalizada. Los precios y condiciones mostrados son históricos."
          : "La clínica confirma disponibilidad y condiciones por WhatsApp. Los resultados varían en cada persona."}</Text>
      </div>
    </Card>
  );
}

/** Sin promociones vigentes: se invita a preguntar por WhatsApp o a ver los paquetes. */
export function EmptyPromotions() {
  return (
    <Surface variant="panel" className="relative isolate overflow-hidden p-8 text-center sm:p-12">
      <Photo framing="texture" src="/img/fondo-1280.webp" alt="" width={1280} height={720} loading="lazy" decoding="async" />
      <PranaIcon name="seccion-paquetes-y-promociones" size={72} className="mx-auto size-16" />
      <Heading as="h3" variant="empty" className="mt-4">
        Muy pronto, nuevas promociones
      </Heading>
      <Text className="mx-auto mt-3 max-w-lg">
        En este momento no tenemos promociones vigentes publicadas. Escríbenos y te contamos qué paquetes
        están disponibles para ti.
      </Text>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BookingButton
          origin="promociones-vacias"
          treatment="paquetes y promociones disponibles"
          label="Preguntar por promociones"
        />
        <BrandButton
          asChild
          variant="cta-outline"
          size="cta"
        >
          <a href={treatmentCategoryHref("promociones")}>
            <Gift className="size-4" />
            Ver paquetes
          </a>
        </BrandButton>
      </div>
    </Surface>
  );
}
