/**
 * Nombres de la escala propia de theme.css y de las utilidades de utilities.css, para que
 * tailwind-merge (cn) sepa a qué grupo pertenece cada clase: sin esto, `text-display` se toma
 * por un color y se pierde al combinarlo con `text-heading`. Una prueba compara estas listas
 * con los archivos CSS.
 */
export const themeScale = {
  text: [
    "micro",
    "caption",
    "lead",
    "nav",
    "card-title",
    "card-title-lg",
    "section",
    "feature",
    "display",
    "display-script",
    "section-lg",
    "display-script-lg",
  ],
  leading: ["script"],
  tracking: ["eyebrow", "eyebrow-wide"],
  radius: ["arch"],
  container: ["site"],
  aspect: ["logo"],
  shadow: ["soft"],
} as const;

/** Utilidades con nombre (utilities.css), agrupadas como las de Tailwind que sustituyen. */
export const namedUtilities = {
  "bg-image": ["bg-gradient-cta", "bg-gradient-soft", "bg-gradient-panel", "bg-gradient-band"],
  "mask-image": ["fade-arch", "fade-right", "fade-x", "fade-none"],
  "object-position": ["object-face-right", "object-face-center", "object-face-top", "object-scene"],
  "min-h": ["min-h-hero"],
  "max-h": ["max-h-dialog"],
  w: ["w-drawer"],
  pb: ["pb-safe"],
  "grid-cols": ["grid-cols-content-aside", "grid-cols-sidebar", "grid-cols-contact", "grid-cols-footer"],
  "logo-mask": ["mask-logo-mark", "mask-logo-ink"],
  "photo-anchor": ["photo-anchor"],
  filter: ["photo-dim"],
} as const;
