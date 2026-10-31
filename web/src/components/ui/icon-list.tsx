import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconListItemVariants = cva("flex gap-2 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    tone: {
      /** Beneficios: icono en el color principal. */
      primary: "text-foreground/85 [&>svg]:text-primary",
      /** Avisos: icono informativo y texto secundario. */
      info: "text-muted-foreground [&>svg]:text-info",
    },
  },
  defaultVariants: { tone: "primary" },
})

/** Elemento de lista con un icono de lucide delante. */
function IconListItem({
  tone,
  className,
  ...props
}: React.ComponentProps<"li"> & VariantProps<typeof iconListItemVariants>) {
  return <li data-slot="icon-list-item" className={cn(iconListItemVariants({ tone }), className)} {...props} />
}

export { IconListItem }
