import { CalendarDays, Gift } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { useTreatmentDialog } from "@/components/patterns/TreatmentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { PranaIcon } from "@/components/ui/prana-icon";
import { Surface } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { formatDay, formatPrice } from "@/data/promotions";
import { treatmentRefLabel } from "@/data/treatments";
import type { Promotion } from "@/types";

/** Promoción vigente: foto, descuento, tratamientos incluidos, precio y vigencia. */
export function PromotionCard({ promotion }: { promotion: Promotion }) {
  const { openTreatment } = useTreatmentDialog();

  return (
    <Card variant="media" className="w-full">
      <div className="relative">
        <Photo
          framing="promo"
          src={promotion.image}
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
      <div className="flex flex-1 flex-col p-5">
        <Heading as="h3" variant="block">
          {promotion.name}
        </Heading>
        <Text variant="small" className="mt-2">
          {promotion.description}
        </Text>
        {promotion.treatments.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tratamientos incluidos">
            {promotion.treatments.map((ref) => (
              <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
                <Button type="button" variant="chip" size="chip" onClick={() => openTreatment(ref)}>
                  {treatmentRefLabel(ref)}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Text asChild variant="small">
          <dl className="mt-4 space-y-1">
            {promotion.priceCents !== undefined && (
              <div className="flex gap-2">
                <Text asChild variant="muted">
                  <dt>Precio:</dt>
                </Text>
                <Text asChild variant="label">
                  <dd>{formatPrice(promotion.priceCents)}</dd>
                </Text>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Text asChild variant="muted">
                <dt className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Vigente hasta:
                </dt>
              </Text>
              <dd>{formatDay(promotion.endsOn)}</dd>
            </div>
          </dl>
        </Text>
        <BookingButton
          origin="promocion"
          treatment={promotion.cta.treatment ?? `la promoción ${promotion.name}`}
          label={promotion.cta.label}
          className="mt-5 w-full"
        />
      </div>
    </Card>
  );
}

/** Sin promociones vigentes: se invita a preguntar por WhatsApp o a ver los paquetes. */
export function EmptyPromotions() {
  const { openTreatment } = useTreatmentDialog();

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
        <Button
          type="button"
          variant="cta-outline"
          size="cta"
          onClick={() => openTreatment({ categoryId: "promociones" })}
        >
          <Gift className="size-4" />
          Ver paquetes
        </Button>
      </div>
    </Surface>
  );
}
