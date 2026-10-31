import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const veilVariants = cva("absolute inset-0 -z-10 hidden bg-gradient-to-r to-transparent md:block", {
  variants: {
    variant: {
      /** Portada: aclara la foto bajo el texto. */
      hero: "from-background/95 via-background/70 lg:from-background/85 lg:via-background/35 lg:via-25% lg:to-55%",
      /** Filosofía: más suave, y casi nada en pantallas anchas. */
      scene: "from-background/90 via-background/50 xl:from-background/70 xl:via-transparent",
    },
  },
})

/** Velo de degradado entre una foto de fondo y el texto. */
function Veil({ variant, className }: VariantProps<typeof veilVariants> & { className?: string }) {
  return <div aria-hidden="true" data-slot="veil" className={cn(veilVariants({ variant }), className)} />
}

export { Veil }
