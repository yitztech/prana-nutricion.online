import { Check, Info } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { BrandButton } from "@/components/brand/ui/brand-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconListItem } from "@/components/ui/icon-list";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Heading, Text } from "@/components/ui/typography";
import type { Category, Treatment } from "@/types";

type TreatmentDialogProps = {
  category: Category | null;
  notes: readonly string[];
  treatment: Treatment | null;
  onSelect: (slug: string) => void;
  onOpenChange: (open: boolean) => void;
};

/** Ficha de los tratamientos de una categoría: descripción, posibles beneficios e información relevante. */
export function TreatmentDialog({ category, treatment, notes, onSelect, onOpenChange }: TreatmentDialogProps) {
  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="detail">
        {category && treatment && (
          <>
            <DialogHeader variant="banner">
              <PranaIcon name={category.icon} size={64} className="size-14" />
              <div>
                <DialogTitle>{category.title}</DialogTitle>
                <Text asChild>
                  <DialogDescription className="mt-1">{category.description}</DialogDescription>
                </Text>
              </div>
            </DialogHeader>

            <div className="grid sm:grid-cols-sidebar">
              <nav aria-label={`Tratamientos de ${category.title}`} className="border-b p-3 sm:border-r sm:border-b-0">
                <ul className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
                  {category.treatments.map((t) => (
                    <li key={t.slug} className="shrink-0">
                      <BrandButton
                        type="button"
                        variant="list"
                        size="list-sm"
                        aria-pressed={t.slug === treatment.slug}
                        onClick={() => onSelect(t.slug)}
                      >
                        <PranaIcon name={t.icon} size={32} className="size-8" />
                        {t.name}
                      </BrandButton>
                    </li>
                  ))}
                </ul>
              </nav>

              <article aria-labelledby="ficha-titulo" className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <PranaIcon name={treatment.icon} size={56} className="size-12" />
                  <Heading as="h3" id="ficha-titulo" variant="subtitle">
                    {treatment.name}
                  </Heading>
                </div>
                <Text variant="paragraph" className="mt-4">
                  {treatment.description}
                </Text>

                <Heading as="h4" variant="minor" className="mt-6">
                  Posibles beneficios
                </Heading>
                <ul className="mt-2 space-y-2">
                  {category.benefits.map((b) => (
                    <IconListItem key={b}>
                      <Check aria-hidden="true" />
                      {b}
                    </IconListItem>
                  ))}
                </ul>

                <Heading as="h4" variant="minor" className="mt-6">
                  Información relevante
                </Heading>
                <ul className="mt-2 space-y-2">
                  {notes.map((n) => (
                    <IconListItem key={n} tone="info">
                      <Info aria-hidden="true" />
                      {n}
                    </IconListItem>
                  ))}
                </ul>

                <BookingButton
                  origin="ficha"
                  treatment={treatment.name}
                  label="Solicitar valoración"
                  className="mt-7 w-full sm:w-auto"
                />
                <Text variant="note" className="mt-3">
                  Se abre WhatsApp con tu mensaje listo. La clínica te confirma día y hora.
                </Text>
              </article>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

