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
      /** Editor: bloque de una pantalla (formulario, estado). */
      card: "rounded-2xl border bg-card shadow-sm",
      /** Editor: acceso a una sección o a un elemento de una lista; se ilumina al pasar. */
      tile: "rounded-2xl border bg-card shadow-sm transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
      /** Editor: fila de una lista dentro de un bloque. */
      row: "rounded-xl border",
      /** Editor: fila que se está editando. */
      "row-active": "rounded-xl border border-primary/40",
      /** Editor: tarjeta de las pantallas de acceso. */
      auth: "rounded-3xl border bg-card shadow-soft",
      /** Editor: fondo de las pantallas de acceso. */
      backdrop: "bg-gradient-soft",
      /** Editor: cabecera con la navegación. */
      header: "border-b bg-card",
      /** Editor: barra de formato sobre el texto enriquecido. */
      toolbar: "rounded-t-lg border border-input bg-muted",
      /** Editor: área de escritura del texto enriquecido, bajo su barra. */
      editor: "rounded-b-lg border border-t-0 border-input bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
      /** Editor: marco de una vista previa de imagen. */
      media: "overflow-hidden rounded-xl border bg-muted",
      /** Icono de Praná sobre su círculo. */
      icon: "rounded-full bg-icon-surface object-contain",
      /** Editor: historial con una línea a la izquierda. */
      timeline: "border-l-2",
    },
  },
})

type SurfaceProps = React.ComponentProps<"div"> & VariantProps<typeof surfaceVariants> & { asChild?: boolean }

/** Superficie decorativa. Con asChild aplica el estilo a su hijo (header, aside, a…). */
function Surface({ variant, asChild = false, className, ...props }: SurfaceProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="surface" className={cn(surfaceVariants({ variant }), className)} {...props} />
}

export { Surface, surfaceVariants }
