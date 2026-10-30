import { cn } from "@/lib/utils";

export function Icon({ name, className, ...props }) {
  return (
    <svg className={cn("icono", className)} aria-hidden="true" {...props}>
      <use href={`/assets/iconos.svg#${name}`} />
    </svg>
  );
}
