import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const headingVariants = cva("text-balance", {
  variants: {
    variant: {
      /** Título de la portada. */
      display:
        "text-display leading-none font-bold tracking-tight text-heading sm:text-5xl md:text-6xl lg:text-7xl",
      /** Título de sección centrado (catálogo). */
      section: "text-section font-bold text-heading sm:text-4xl lg:text-section-lg",
      /** Título de sección con frase manuscrita (filosofía). */
      feature: "text-feature leading-tight font-bold text-heading sm:text-4xl xl:text-section-lg",
      /** Título de sección secundaria (promociones, contacto). */
      title: "text-3xl font-semibold sm:text-4xl",
      /** Título de una tarjeta de categoría. */
      card: "text-2xl leading-tight font-bold md:text-card-title lg:text-card-title-lg",
      /** Título destacado dentro de un bloque. */
      subtitle: "text-2xl font-semibold",
      /** Título de una tarjeta. */
      block: "text-xl font-semibold",
      /** Título de un estado vacío. */
      empty: "text-2xl font-semibold sm:text-3xl",
      /** Subapartado con tipografía serif. */
      minor: "font-serif text-lg font-semibold",
      /** Encabezado de columna en sans (pie). */
      label: "font-sans text-sm font-semibold",
    },
  },
  defaultVariants: { variant: "title" },
})

type HeadingProps = React.ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & { as?: "h1" | "h2" | "h3" | "h4" }

function Heading({ as: Tag = "h2", variant, className, ...props }: HeadingProps) {
  return <Tag data-slot="heading" className={cn(headingVariants({ variant }), className)} {...props} />
}

const scriptVariants = cva("font-script font-normal tracking-normal text-script", {
  variants: {
    variant: {
      /** Segunda línea del título de portada. */
      display:
        "-ml-1 block text-display-script leading-script whitespace-nowrap sm:text-6xl md:text-7xl lg:-ml-3 lg:text-display-script-lg",
      /** Segunda línea de un título de sección. */
      feature: "block text-5xl leading-script sm:text-6xl",
      /** Dentro de la misma línea del título. */
      inline: "text-5xl",
      /** Frase decorativa girada sobre la foto de portada. */
      tagline: "-rotate-6 text-center text-4xl leading-snug text-script-muted 2xl:text-5xl",
    },
  },
  defaultVariants: { variant: "feature" },
})

function Script({
  variant,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof scriptVariants>) {
  return <span data-slot="script" className={cn(scriptVariants({ variant }), className)} {...props} />
}

const eyebrowVariants = cva("font-semibold text-foreground/80 uppercase", {
  variants: {
    variant: {
      default: "text-xs tracking-eyebrow-wide",
      /** En la portada: más pequeño en móvil para que quepa en una línea. */
      hero: "text-micro tracking-eyebrow whitespace-nowrap sm:text-xs sm:tracking-eyebrow-wide",
    },
  },
  defaultVariants: { variant: "default" },
})

function Eyebrow({
  variant,
  className,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof eyebrowVariants>) {
  return <p data-slot="eyebrow" className={cn(eyebrowVariants({ variant }), className)} {...props} />
}

const textVariants = cva("", {
  variants: {
    variant: {
      /** Entradilla de portada. */
      lead: "text-lead leading-snug text-foreground/90 sm:text-base md:text-lg md:leading-relaxed lg:text-xl",
      /** Párrafo de sección. */
      body: "leading-relaxed text-foreground/90 lg:text-lg",
      /** Párrafo normal. */
      default: "text-foreground/85",
      /** Párrafo largo dentro de una ficha. */
      paragraph: "leading-relaxed text-foreground/85",
      /** Subtítulo bajo un título de sección. */
      intro: "text-sm text-foreground/80 sm:text-base",
      /** Texto secundario. */
      muted: "text-muted-foreground",
      /** Texto pequeño. */
      small: "text-sm text-foreground/85",
      /** Texto pequeño secundario. */
      "small-muted": "text-sm text-muted-foreground",
      /** Nota o aclaración. */
      note: "text-xs text-muted-foreground",
      /** Rótulo corto con peso («Síguenos», títulos de contacto). */
      label: "text-sm font-semibold",
      /** Texto junto a un icono en una tarjeta (pilares). */
      emphasis: "text-nav leading-snug font-medium",
      /** Rótulo de un grupo de opciones. */
      overline: "text-xs font-semibold text-muted-foreground",
      /** Junto a un icono de la portada. */
      highlight: "text-xs leading-tight font-medium text-foreground/85 sm:text-sm md:text-base md:leading-snug",
      /** Título en serif dentro de una fila. */
      "row-title": "font-serif text-base font-bold",
      /** Resumen bajo el título de una fila. */
      "row-summary": "line-clamp-2 text-xs text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

type TextProps = React.ComponentProps<"p"> & VariantProps<typeof textVariants> & { asChild?: boolean }

/** Párrafo con una variante del sistema. Con asChild aplica el estilo a su hijo (span, dd, li…). */
function Text({ variant, asChild = false, className, ...props }: TextProps) {
  const Comp = asChild ? Slot.Root : "p"
  return <Comp data-slot="text" className={cn(textVariants({ variant }), className)} {...props} />
}

export { Heading, Script, Eyebrow, Text, headingVariants, textVariants }
