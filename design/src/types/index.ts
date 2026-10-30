export type IconName =
  | "acompanamiento"
  | "aparatologia-corporal"
  | "atencion-personalizada"
  | "bienestar-integral"
  | "bikini-completo"
  | "carboxiterapia"
  | "cavitacion"
  | "cuerpo-completo"
  | "lipo-laser"
  | "mejora-la-circulacion"
  | "mesoterapia"
  | "mini-lipo"
  | "moldea-tu-figura"
  | "paquete-carboxiterapia"
  | "piel-mas-firme"
  | "reduccion-medidas"
  | "reset-prana"
  | "resultados-que-se-notan"
  | "resultados-visibles"
  | "seccion-depilacion-laser"
  | "seccion-paquetes-y-promociones"
  | "seccion-tratamientos-corporales"
  | "seccion-tratamientos-reductivos-2"
  | "tecnologia-de-vanguardia"
  | "tratamiento-intensivo"
  | "tratamientos-combinados"
  | "tratamientos-no-invasivos"
  | "valoracion-personalizada";

export type Highlight = { icon: IconName; label: string };

export type Treatment = {
  slug: string;
  name: string;
  icon: IconName;
  description: string;
};

export type Category = {
  id: string;
  title: string;
  description: string;
  /** Prefijo de public/img/<photo>-640.webp y -1024.webp */
  photo: string;
  photoAlt: string;
  icon: IconName;
  cta: string;
  benefits: string[];
  treatments: Treatment[];
};

/** Un tratamiento concreto, o la categoría entera si no hay `slug`. */
export type TreatmentRef = { categoryId: string; slug?: string };

export type Benefit = {
  icon: IconName;
  title: string;
  treatments: TreatmentRef[];
};

export type Promotion = {
  id: string;
  name: string;
  description: string;
  treatments: TreatmentRef[];
  /** Precio en centavos de MXN. Sin él, no se muestra precio. */
  priceCents?: number;
  /** Descuento en porcentaje (1–100). */
  discountPercent?: number;
  /** Vigencia como AAAA-MM-DD, en la hora de Cuautla; `endsOn` es el último día incluido. */
  startsOn?: string;
  endsOn: string;
  status: "active" | "inactive";
  /** Ruta bajo public/, p. ej. /img/promociones/reset.webp */
  image: string;
  imageAlt: string;
  cta: { label: string; treatment?: string };
};
