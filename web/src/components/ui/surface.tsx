import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const surfaceVariants = cva("", {
  variants: {
    variant: {
      /** Barras fijas (cabecera, barra móvil): translúcidas y con desenfoque. */
      bar: "border-card/60 bg-card/80 backdrop-blur-md",
      /** Panel destacado con degradado suave. */
      panel: "rounded-3xl bg-gradient-soft shadow-soft",
      /** Tarjeta translúcida sobre fotos o degradados. */
      glass: "rounded-2xl border border-card/80 bg-card/85 shadow-soft backdrop-blur-sm",
      /** Dato de contacto con su icono delante; si es enlace, se ilumina al pasar. */
      item: "rounded-2xl bg-card/80 transition-colors [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-primary hover:[a&]:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
      /** Panel que se monta sobre la foto de una tarjeta. */
      overlap: "rounded-t-3xl bg-gradient-panel",
      /** Fondo del pie. */
      page: "bg-card",
    },
  },
})

type SurfaceProps = React.ComponentProps<"div"> & VariantProps<typeof surfaceVariants> & { asChild?: boolean }

/** Superficie decorativa. Con asChild aplica el estilo a su hijo (header, aside, a…). */
function Surface({ variant, asChild = false, className, ...props }: SurfaceProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="surface" className={cn(surfaceVariants({ variant }), className)} {...props} />
}

export { Surface }
