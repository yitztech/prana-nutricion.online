import type { IconName } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Icono de Praná. Los originales son PNG opacos sobre blanco: `mix-blend-multiply`
 * vuelve transparente ese blanco sobre los fondos rosas.
 */
export function PranaIcon({
  name,
  className,
  size = 48,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={`/img/iconos/${name}.webp`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("shrink-0 rounded-full mix-blend-multiply", className)}
    />
  );
}
