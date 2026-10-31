import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const containerVariants = cva("mx-auto w-full px-4 sm:px-6", {
  variants: {
    size: {
      default: "max-w-7xl lg:px-8",
      /** El catálogo y la franja de beneficios, más anchos. */
      wide: "max-w-site",
      narrow: "max-w-6xl lg:px-8",
    },
  },
  defaultVariants: { size: "default" },
})

/** Ancho máximo y márgenes laterales de la página. */
function Container({
  size,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof containerVariants>) {
  return <div data-slot="container" className={cn(containerVariants({ size }), className)} {...props} />
}

export { Container }
