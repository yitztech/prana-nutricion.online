import { CalendarDays, Gift } from "lucide-react";
import { BookingButton } from "@/components/BookingButton";
import { useTreatmentDialog } from "@/components/home/TreatmentDialog";
import { PranaIcon } from "@/components/PranaIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activePromotions, formatDay, formatPrice, promotions, todayInClinic } from "@/data/promotions";
import { treatmentRefLabel } from "@/data/treatments";
import type { Promotion } from "@/types";

function PromotionCard({ promotion }: { promotion: Promotion }) {
  const { openTreatment } = useTreatmentDialog();

  return (
    <Card className="w-full gap-0 overflow-hidden rounded-2xl border-white/80 py-0 shadow-soft">
      <div className="relative">
        <img
          src={promotion.image}
          alt={promotion.imageAlt}
          width={1536}
          height={1024}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full object-cover"
        />
        {promotion.discountPercent !== undefined && (
          <Badge className="bg-prana-boton absolute top-3 left-3 rounded-full px-3 py-1 text-sm text-white">
            {promotion.discountPercent}% de descuento
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold">{promotion.name}</h3>
        <p className="mt-2 text-sm text-foreground/85">{promotion.description}</p>
        {promotion.treatments.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tratamientos incluidos">
            {promotion.treatments.map((ref) => (
              <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
                <button
                  type="button"
                  onClick={() => openTreatment(ref)}
                  className="min-h-8 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {treatmentRefLabel(ref)}
                </button>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-4 space-y-1 text-sm">
          {promotion.priceCents !== undefined && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Precio:</dt>
              <dd className="font-semibold">{formatPrice(promotion.priceCents)}</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-4" />
              Vigente hasta:
            </dt>
            <dd>{formatDay(promotion.endsOn)}</dd>
          </div>
        </dl>
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

function EmptyPromotions() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-white/80 bg-prana-suave p-8 text-center shadow-soft sm:p-12">
      <img
        src="/img/fondo-1280.webp"
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover opacity-60"
      />
      <PranaIcon name="seccion-paquetes-y-promociones" size={72} className="mx-auto size-16 mix-blend-normal" />
      <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">Muy pronto, nuevas promociones</h3>
      <p className="mx-auto mt-3 max-w-lg text-foreground/85">
        En este momento no tenemos promociones vigentes publicadas. Escríbenos y te contamos qué paquetes
        están disponibles para ti.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BookingButton
          origin="promociones-vacias"
          treatment="paquetes y promociones disponibles"
          label="Preguntar por promociones"
         
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => openTreatment({ categoryId: "promociones" })}
          className="h-11 rounded-full border-primary/40 bg-white/80 px-6 font-semibold text-primary hover:bg-white hover:text-primary"
        >
          <Gift className="size-4" />
          Ver paquetes
        </Button>
      </div>
    </div>
  );
}

export function Promotions() {
  const current = activePromotions(promotions, todayInClinic());

  return (
    <section id="promociones" aria-labelledby="promociones-titulo" className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="promociones-titulo" className="text-3xl font-semibold sm:text-4xl">
            Promociones
          </h2>
          <p className="mt-3 text-muted-foreground">
            Opciones especiales por tiempo limitado. Consulta las condiciones en tu valoración.
          </p>
        </header>
        <div className="mt-10">
          {current.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {current.map((p) => (
                <li key={p.id} className="flex">
                  <PromotionCard promotion={p} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPromotions />
          )}
        </div>
      </div>
    </section>
  );
}
