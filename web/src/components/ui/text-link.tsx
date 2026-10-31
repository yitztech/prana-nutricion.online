import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const textLinkVariants = cva(
  "transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        /** Enlace de texto (pie): 24 px de alto como mínimo. */
        default: "inline-block rounded-sm py-1 text-left hover:text-primary",
        /** Enlace dentro de un texto: subrayado. */
        inline: "rounded-sm font-medium underline underline-offset-4 hover:text-primary",
        /** Navegación principal con subrayado en la sección actual (aria-current). */
        nav: "relative rounded-md px-3 py-2 text-nav font-medium text-foreground/85 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity hover:text-primary aria-[current]:text-primary aria-[current]:after:opacity-100",
        /** Navegación del menú móvil. */
        menu: "block rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary aria-[current]:bg-secondary aria-[current]:text-primary",
        /** Enlace para saltar al contenido: visible solo con el foco. */
        skip: "sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

type TextLinkProps = React.ComponentProps<"a"> & VariantProps<typeof textLinkVariants> & { asChild?: boolean }

/** Enlace de texto. Con asChild aplica el estilo a un botón (p. ej. abrir una ficha). */
function TextLink({ variant, asChild = false, className, ...props }: TextLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="text-link" className={cn(textLinkVariants({ variant }), className)} {...props} />
}

export { TextLink, textLinkVariants }
