import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /** Acción principal (reservar, conocer tratamientos). */
        cta: "rounded-full bg-gradient-cta font-semibold text-cta-foreground shadow-soft hover:brightness-110",
        /** Acción secundaria con el mismo peso visual que cta. */
        "cta-outline":
          "rounded-full border-2 border-primary bg-card font-semibold text-primary hover:bg-secondary",
        /** Etiqueta pulsable (tratamientos incluidos en una promoción). */
        chip: "rounded-full bg-secondary font-medium text-primary hover:bg-accent",
        /** Elemento de una lista de opciones; aria-pressed marca el seleccionado. */
        list: "w-full justify-start rounded-lg text-left font-medium whitespace-normal text-foreground hover:bg-secondary hover:text-primary aria-pressed:bg-secondary aria-pressed:text-primary",
        /** Fila con foto que ocupa el ancho (categorías en móvil). */
        tile: "w-full justify-start overflow-hidden rounded-2xl border border-card bg-card text-left whitespace-normal shadow-soft hover:bg-secondary [&_svg]:text-primary",
        /** Disparador de la franja de beneficios: icono, texto y flecha. */
        benefit:
          "w-full justify-start rounded-2xl text-left font-medium whitespace-normal text-foreground hover:bg-card/60 data-[state=open]:bg-card/70 [&_svg]:text-primary [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180",
        /** Enlace a una red social. */
        social: "rounded-full bg-card text-primary shadow-soft hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        cta: "h-12 px-10 text-base",
        "cta-sm": "h-11 px-6 text-nav",
        "cta-xs": "h-9 px-4 text-nav",
        chip: "min-h-8 px-2.5 py-1 text-xs",
        list: "gap-3 px-1.5 py-1 text-base",
        "list-sm": "gap-2 rounded-xl px-3 py-2 text-sm",
        tile: "h-auto gap-3 p-0",
        benefit: "h-auto gap-2 p-1.5 text-caption lg:gap-3 lg:p-2 lg:text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
