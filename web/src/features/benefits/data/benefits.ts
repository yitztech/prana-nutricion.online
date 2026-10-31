import type { Benefit } from "@/types";

/**
 * Franja del mockup: sus textos e iconos, y los tratamientos relacionados con cada objetivo.
 * Los resultados dependen de cada persona y se valoran en consulta.
 */
export const benefits: Benefit[] = [
  {
    id: "reduccion-medidas",
    icon: "reduccion-medidas",
    title: "Reducción de medidas",
    treatments: [
      { categoryId: "reductivos", slug: "mini-lipo" },
      { categoryId: "reductivos", slug: "lipolaser" },
      { categoryId: "reductivos", slug: "cavitacion" },
      { categoryId: "promociones", slug: "reductivo-intenso" },
    ],
  },
  {
    id: "mejora-la-circulacion",
    icon: "mejora-la-circulacion",
    title: "Mejora la circulación",
    treatments: [
      { categoryId: "corporales", slug: "carboxiterapia" },
      { categoryId: "promociones", slug: "paquete-carboxiterapia" },
      { categoryId: "reductivos", slug: "aparatologia-corporal" },
    ],
  },
  {
    id: "moldea-tu-figura",
    icon: "moldea-tu-figura",
    title: "Moldea tu figura",
    treatments: [
      { categoryId: "reductivos", slug: "aparatologia-corporal" },
      { categoryId: "reductivos", slug: "cavitacion" },
      { categoryId: "promociones", slug: "tratamientos-combinados" },
    ],
  },
  {
    id: "piel-mas-firme",
    icon: "piel-mas-firme",
    title: "Piel más firme y rejuvenecida",
    treatments: [
      { categoryId: "corporales", slug: "mesoterapia" },
      { categoryId: "corporales", slug: "carboxiterapia" },
    ],
  },
  {
    id: "bienestar-integral",
    icon: "bienestar-integral",
    title: "Bienestar integral",
    treatments: [
      { categoryId: "promociones", slug: "reset-prana" },
      { categoryId: "promociones", slug: "tratamientos-combinados" },
    ],
  },
];

export const benefitPageDescription = "Explora los tratamientos relacionados con este objetivo. En tu valoración, el equipo te orienta sobre las opciones adecuadas para ti.";

export function findBenefit(id: string) {
  return benefits.find((benefit) => benefit.id === id);
}
