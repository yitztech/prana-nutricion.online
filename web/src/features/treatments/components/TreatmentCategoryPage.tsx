import { ArrowLeft, Check, Info } from "lucide-react";
import type { ReactNode } from "react";
import { BookingButton } from "@/components/brand/BookingButton";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { IconListItem } from "@/components/ui/icon-list";
import { Photo } from "@/components/ui/photo";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { Heading, Text } from "@/components/ui/typography";
import type { Category } from "@/types";

/** Vista de lectura: recibe contenido y utiliza las primitivas del sistema de diseño. Sin `hero`, el título queda solo para lectores de pantalla. */
export function TreatmentCategoryPage({ category, notes, hero = true, children }: { category: Category; notes: readonly string[]; hero?: boolean; children?: ReactNode }) {
  return (
    <>
      <Section className={hero ? "pt-6 pb-10 sm:pt-8 sm:pb-14" : "pt-6 sm:pt-8"}>
        <Container size="narrow">
          <TextLink href="/#tratamientos" className="inline-flex items-center gap-2">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver a todos los tratamientos
          </TextLink>
          {!hero && <Heading as="h1" className="sr-only">{category.title}</Heading>}
          {hero && <div className="mt-6 grid items-center gap-8 md:grid-cols-2 lg:gap-12">
            <div>
              <PranaIcon name={category.icon} frame="disc" size={80} className="mb-5 size-16" />
              <Heading as="h1" variant="section">{category.title}</Heading>
              <Text variant="body" className="mt-4 max-w-xl">{category.description}</Text>
              <BookingButton origin="pagina-categoria" treatment={category.title} className="mt-6 w-full sm:w-auto" />
            </div>
            <Card variant="media">
              <Photo
                framing="promo"
                src={`/img/${category.photo}-1024.webp`}
                srcSet={`/img/${category.photo}-640.webp 640w, /img/${category.photo}-1024.webp 1024w`}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={category.photoAlt}
                width={1536}
                height={1024}
                fetchPriority="high"
              />
            </Card>
          </div>}
        </Container>
      </Section>

      {children}
      <Section tone="soft" aria-labelledby="opciones-titulo" className="py-10 sm:py-14">
        <Container size="narrow">
          <Heading id="opciones-titulo" variant="title">Tratamientos disponibles</Heading>
          <div className="mt-6 grid items-start gap-8 md:grid-cols-sidebar lg:gap-12">
            <nav aria-label="Tratamientos de esta categoría" className="md:sticky md:top-28">
              <ul className="flex flex-col gap-2">
                {category.treatments.map((treatment) => (
                  <li key={treatment.slug}>
                    <TextLink href={`#${treatment.slug}`}>{treatment.name}</TextLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
              {category.treatments.map((treatment) => (
                <article key={treatment.slug} id={treatment.slug} aria-labelledby={`${treatment.slug}-titulo`} tabIndex={-1}>
                  <div className="flex items-center gap-3">
                    <PranaIcon name={treatment.icon} size={56} className="size-12" />
                    <Heading id={`${treatment.slug}-titulo`} variant="subtitle">{treatment.name}</Heading>
                  </div>
                  <Text variant="paragraph" className="mt-4 max-w-2xl">{treatment.description}</Text>
                  <BookingButton origin="pagina-tratamiento" treatment={treatment.name} label="Solicitar valoración" size="cta-sm" className="mt-5 w-full sm:w-auto" />
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-10 sm:py-14">
        <Container size="narrow" className="grid gap-10 md:grid-cols-2">
          <div>
            <Heading variant="subtitle">Posibles beneficios</Heading>
            <ul className="mt-4 flex flex-col gap-3">
              {category.benefits.map((benefit) => <IconListItem key={benefit}><Check aria-hidden="true" />{benefit}</IconListItem>)}
            </ul>
          </div>
          <div>
            <Heading variant="subtitle">Información relevante</Heading>
            <ul className="mt-4 flex flex-col gap-3">
              {notes.map((note) => <IconListItem key={note} tone="info"><Info aria-hidden="true" />{note}</IconListItem>)}
            </ul>
            <Text variant="note" className="mt-5">Se abre WhatsApp con tu mensaje listo. La clínica te confirma día y hora.</Text>
          </div>
        </Container>
      </Section>
    </>
  );
}
