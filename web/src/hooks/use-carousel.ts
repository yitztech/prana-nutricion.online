import { useEffect, useState, type FocusEvent } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

/**
 * Carrusel con avance automático. Se detiene del todo cuando la persona lo pide (pausa o clic) y
 * se retiene mientras el puntero o el foco están dentro. Con movimiento reducido no avanza solo.
 */
export function useCarousel(count: number, interval = 7000) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Se conoce al montar: el HTML generado y la hidratación empiezan sin avance automático.
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  useEffect(() => setReducedMotion(window.matchMedia(reducedMotionQuery).matches), []);
  const playing = count > 1 && (chosen ?? reducedMotion === false);

  useEffect(() => {
    if (!playing || hovered || focused) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearTimeout(timer);
  }, [playing, hovered, focused, index, count, interval]);

  const goTo = (next: number) => setIndex((next + count) % count);

  return {
    index: index % Math.max(count, 1),
    playing,
    goTo,
    next: () => goTo(index + 1),
    previous: () => goTo(index - 1),
    stop: () => setChosen(false),
    toggle: () => setChosen(!playing),
    holdProps: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      },
    },
  };
}
