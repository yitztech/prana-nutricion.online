import { cva, type VariantProps } from "class-variance-authority"
import type { IconName } from "@/types"
import { cn } from "@/lib/utils"

const iconBadgeVariants = cva("isolate grid shrink-0 place-items-center rounded-full", {
  variants: {
    /** plain: solo el icono; disc: disco claro con sombra; ring: aro alrededor (iconos de sección). */
    frame: {
      plain: "bg-icon-surface",
      disc: "bg-icon-surface shadow-soft",
      ring: "bg-icon-surface shadow-soft ring-4 ring-card/80",
      "ring-sm": "bg-icon-surface ring-2 ring-card",
      flat: "bg-icon-surface shadow-sm",
    },
  },
  defaultVariants: { frame: "plain" },
})

type PranaIconProps = VariantProps<typeof iconBadgeVariants> & {
  name: IconName
  /** Tamaño intrínseco de la imagen, para reservar el espacio. */
  size?: number
  /** Medida en pantalla con la escala de Tailwind (size-11 md:size-12…). */
  className?: string
}

/**
 * Icono de Praná dentro de su disco. Los originales son ilustraciones opacas sobre blanco:
 * `mix-blend-multiply` funde ese blanco con el disco (bg-icon-surface), así que el icono
 * se ve igual en claro y en oscuro.
 */
function PranaIcon({ name, size = 48, frame, className }: PranaIconProps) {
  return (
    <span data-slot="prana-icon" className={cn(iconBadgeVariants({ frame }), className)}>
      <img
        src={`/img/iconos/${name}.webp`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="size-full rounded-full mix-blend-multiply"
      />
    </span>
  )
}

export { PranaIcon }
