import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const photoVariants = cva("object-cover", {
  variants: {
    framing: {
      /** Portada: arco en móvil, fondo completo desde md. */
      hero: "size-full photo-dim object-face-right md:object-face-center lg:object-face-top",
      /** Filosofía: fondo desvanecido, alineado al contenedor en pantallas anchas. */
      scene:
        "absolute inset-y-0 left-0 -z-10 hidden size-full photo-dim object-scene fade-right md:block xl:photo-anchor xl:object-face-top xl:fade-x",
      /** Textura de fondo a sangre. */
      texture: "absolute inset-0 -z-10 size-full photo-dim opacity-70",
      /** Foto de una tarjeta de categoría. */
      card: "aspect-5/2 w-full lg:aspect-16/10",
      /** Miniatura de una fila de categoría. */
      thumb: "h-18 w-20 shrink-0",
      /** Foto de una promoción. */
      promo: "aspect-3/2 w-full",
    },
  },
})

/** Fotografía con un encuadre del sistema. */
function Photo({
  framing,
  className,
  ...props
}: React.ComponentProps<"img"> & VariantProps<typeof photoVariants>) {
  return <img data-slot="photo" className={cn(photoVariants({ framing }), className)} {...props} />
}

const photoFrameVariants = cva("absolute -z-10 overflow-hidden", {
  variants: {
    shape: {
      /** Móvil: arco a la derecha que se desvanece; desde md, fondo completo sin forma. */
      arch: "top-2 right-0 h-64 w-23/50 rounded-tl-arch fade-arch sm:h-96 sm:w-12/25 md:inset-0 md:h-auto md:w-auto md:rounded-none md:fade-none",
    },
  },
})

/** Recorte y posición de una foto de fondo. */
function PhotoFrame({
  shape,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof photoFrameVariants>) {
  return <div data-slot="photo-frame" className={cn(photoFrameVariants({ shape }), className)} {...props} />
}

export { Photo, PhotoFrame }
