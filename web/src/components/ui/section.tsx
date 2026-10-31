import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva("", {
  variants: {
    tone: {
      plain: "bg-background",
      soft: "bg-gradient-soft",
      band: "bg-gradient-band",
    },
    /** Para fondos con foto: crea su propio contexto de apilado y recorta. */
    layered: { true: "relative isolate overflow-hidden" },
  },
  defaultVariants: { tone: "plain" },
})

/** Sección de página con su fondo. El espaciado vertical lo decide cada sección. */
function Section({
  tone,
  layered,
  className,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return <section data-slot="section" className={cn(sectionVariants({ tone, layered }), className)} {...props} />
}

export { Section }
