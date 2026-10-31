import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const brandButtonVariants = cva("", {
  variants: {
    variant: {
      /** Acción principal (reservar, conocer tratamientos). */
      cta: "rounded-full bg-gradient-cta font-semibold text-cta-foreground shadow-soft hover:brightness-110",
      /** Acción secundaria con el mismo peso visual que cta. */
      "cta-outline":
        "rounded-full border-2 border-primary bg-card font-semibold text-primary hover:bg-secondary",
      /** Etiqueta pulsable (tratamientos incluidos en una promoción). */
      chip: "rounded-full bg-secondary font-medium text-primary hover:bg-accent",
      /** Elemento de una lista de opciones; aria-pressed marca el seleccionado. */
      list: "w-full justify-start rounded-lg text-left font-medium whitespace-normal text-foreground hover:bg-secondary hover:text-primary aria-pressed:bg-secondary aria-pressed:text-primary",
      /** Fila con foto que ocupa el ancho (categorías en móvil). */
      tile: "w-full justify-start overflow-hidden rounded-2xl border border-card bg-card text-left whitespace-normal shadow-soft hover:bg-secondary [&_svg]:text-primary",
      /** Enlace de la franja de beneficios: icono, texto y flecha. */
      benefit:
        "w-full justify-start rounded-2xl text-left font-medium whitespace-normal text-foreground hover:bg-card/60 [&_svg]:text-primary",
      /** Enlace a una red social. */
      social: "rounded-full bg-card text-primary shadow-soft hover:bg-primary hover:text-primary-foreground",
    },
    size: {
      social: "size-9",
      cta: "h-12 px-10 text-base",
      "cta-sm": "h-11 px-6 text-nav",
      "cta-xs": "h-9 px-4 text-nav",
      chip: "min-h-8 px-2.5 py-1 text-xs",
      list: "gap-3 px-1.5 py-1 text-base",
      "list-sm": "gap-2 rounded-xl px-3 py-2 text-sm",
      tile: "h-auto gap-3 p-0",
      benefit: "h-auto gap-2 p-1.5 text-caption lg:gap-3 lg:p-2 lg:text-base",
    },
  },
  defaultVariants: { variant: "cta", size: "cta" },
});

type BrandButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> &
  VariantProps<typeof brandButtonVariants>;

/** Apariencias de Praná sobre el comportamiento y la composición del botón base. */
export function BrandButton({ variant = "cta", size = "cta", className, ...props }: BrandButtonProps) {
  return (
    <Button
      variant={null}
      size={null}
      data-variant={variant}
      data-size={size}
      className={cn(brandButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
