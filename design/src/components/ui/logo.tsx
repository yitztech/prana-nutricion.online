import { cn } from "@/lib/utils"

/**
 * Logo de Praná con los colores del tema (--logo-mark y --logo-ink).
 * Son dos máscaras (public/img/logo-mandala.webp y logo-texto.webp) que genera `npm run images`.
 */
function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Praná · Nutrición y Bienestar"
      data-slot="logo"
      className={cn("relative inline-block aspect-logo", className)}
    >
      <span aria-hidden="true" className="absolute inset-0 bg-logo-mark mask-logo-mark" />
      <span aria-hidden="true" className="absolute inset-0 bg-logo-ink mask-logo-ink" />
    </span>
  )
}

export { Logo }
