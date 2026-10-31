import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Diapositiva apilada sobre las demás: todas comparten celda y la más alta fija la altura. */
function CarouselSlide({
  active,
  className,
  ...props
}: React.ComponentProps<"div"> & { active: boolean }) {
  return (
    <div
      data-slot="carousel-slide"
      role="group"
      aria-roledescription="diapositiva"
      inert={!active}
      className={cn(
        "relative isolate col-start-1 row-start-1 flex flex-col overflow-hidden transition-[opacity,visibility] duration-700 motion-reduce:transition-none",
        active ? "visible opacity-100" : "invisible opacity-0",
        className
      )}
      {...props}
    />
  )
}

/** Barra translúcida con los controles del carrusel. */
function CarouselControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-controls"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-card/80 bg-card/85 p-1 shadow-soft backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

/** Botón redondo de la barra (anterior, siguiente, pausa). */
function CarouselButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      data-slot="carousel-button"
      className={cn("rounded-full text-primary hover:bg-secondary hover:text-primary", className)}
      {...props}
    />
  )
}

/** Punto de una diapositiva: área táctil de 32 px; aria-current marca la visible. */
function CarouselDot({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="carousel-dot"
      className={cn(
        "flex size-8 items-center justify-center rounded-full outline-none before:size-2 before:rounded-full before:bg-primary/30 before:transition-all hover:before:bg-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-current:before:w-5 aria-current:before:bg-primary motion-reduce:before:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { CarouselSlide, CarouselControls, CarouselButton, CarouselDot }
