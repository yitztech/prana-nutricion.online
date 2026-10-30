/** Nombre de un icono de Praná en public/img/iconos (generado desde recursos/). */
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

export const heroHighlights: Highlight[] = [
  { icon: "tratamientos-no-invasivos", label: "Tratamientos no invasivos" },
  { icon: "atencion-personalizada", label: "Atención personalizada" },
  { icon: "resultados-que-se-notan", label: "Resultados que se notan" },
];

export const wellnessBand: Highlight[] = [
  { icon: "reduccion-medidas", label: "Reducción de medidas" },
  { icon: "mejora-la-circulacion", label: "Mejora la circulación" },
  { icon: "moldea-tu-figura", label: "Moldea tu figura" },
  { icon: "piel-mas-firme", label: "Piel más firme y rejuvenecida" },
  { icon: "bienestar-integral", label: "Bienestar integral" },
];

export const pillars: Highlight[] = [
  { icon: "valoracion-personalizada", label: "Valoración personalizada para definir tu plan" },
  { icon: "tecnologia-de-vanguardia", label: "Tecnología de vanguardia y protocolos seguros" },
  { icon: "acompanamiento", label: "Acompañamiento durante todo tu tratamiento" },
  { icon: "resultados-visibles", label: "Resultados visibles y bienestar real" },
];

/** Lo que vale para todas las fichas. Precios, sesiones y promociones vigentes los confirma la clínica. */
export const treatmentNotes = [
  "En tu valoración el equipo confirma si este tratamiento es adecuado para ti.",
  "Precio, número de sesiones y duración se acuerdan después de la valoración.",
  "Los resultados varían en cada persona; no se garantizan resultados específicos.",
];

export const categories: Category[] = [
  {
    id: "reductivos",
    title: "Tratamientos reductivos",
    description: "Opciones de cuidado corporal para conversar durante tu valoración.",
    photo: "tratamientos-reductivos",
    photoAlt: "Abdomen de una mujer con una cinta métrica rosa",
    icon: "seccion-tratamientos-reductivos-2",
    cta: "Conocer tratamientos",
    benefits: [
      "Puede formar parte de un plan de cuidado corporal personalizado.",
      "Se combina con otras opciones según lo que se defina en tu valoración.",
    ],
    treatments: [
      {
        slug: "mini-lipo",
        name: "Mini Lipo",
        icon: "mini-lipo",
        description:
          "Una opción de tratamiento corporal. En tu valoración puedes conocer cómo se realiza en Praná y resolver tus dudas.",
      },
      {
        slug: "lipolaser",
        name: "Lipoláser",
        icon: "lipo-laser",
        description:
          "Tratamiento estético que utiliza tecnología láser para el cuidado corporal. Consulta con el equipo si es adecuado para tus objetivos.",
      },
      {
        slug: "cavitacion",
        name: "Cavitación",
        icon: "cavitacion",
        description:
          "Tratamiento de aparatología estética que utiliza ultrasonido para el cuidado corporal. El equipo puede explicarte sus características en una valoración.",
      },
      {
        slug: "aparatologia-corporal",
        name: "Aparatología corporal",
        icon: "aparatologia-corporal",
        description:
          "Tecnologías de cuidado estético corporal que pueden formar parte de un plan personalizado, según tu valoración.",
      },
    ],
  },
  {
    id: "corporales",
    title: "Tratamientos corporales",
    description: "Conoce alternativas de cuidado corporal y recibe orientación personalizada.",
    photo: "tratamientos-corporales",
    photoAlt: "Especialista con guantes rosas aplicando aparatología corporal",
    icon: "seccion-tratamientos-corporales",
    cta: "Conocer tratamientos",
    benefits: [
      "Aplicaciones localizadas en las zonas que se definan contigo.",
      "Orientación del equipo sobre frecuencia y cuidados.",
    ],
    treatments: [
      {
        slug: "carboxiterapia",
        name: "Carboxiterapia",
        icon: "carboxiterapia",
        description:
          "Tratamiento que utiliza dióxido de carbono en aplicaciones localizadas. Consulta con el equipo cómo se realiza y si es apropiado para ti.",
      },
      {
        slug: "mesoterapia",
        name: "Mesoterapia",
        icon: "mesoterapia",
        description:
          "Tratamiento que consiste en aplicaciones localizadas. En una valoración podrás conocer sus características y consultar tus dudas.",
      },
    ],
  },
  {
    id: "depilacion-laser",
    title: "Depilación láser",
    description: "Conoce las opciones de depilación láser disponibles para distintas zonas.",
    photo: "depilacion-laser",
    photoAlt: "Sesión de depilación láser en las piernas",
    icon: "seccion-depilacion-laser",
    cta: "Conocer tratamientos",
    benefits: [
      "Opciones para distintas zonas del cuerpo.",
      "El equipo te orienta sobre las zonas incluidas y el número de sesiones.",
    ],
    treatments: [
      {
        slug: "depilacion-cuerpo-completo",
        name: "Cuerpo completo",
        icon: "cuerpo-completo",
        description:
          "Depilación láser para cuerpo completo. Consulta con Praná las zonas incluidas y los detalles del tratamiento.",
      },
      {
        slug: "depilacion-bikini-completo",
        name: "Bikini completo",
        icon: "bikini-completo",
        description:
          "Depilación láser para bikini completo. El equipo puede orientarte sobre el tratamiento durante tu valoración.",
      },
    ],
  },
  {
    id: "promociones",
    title: "Paquetes y promociones",
    description: "Explora opciones de tratamientos y consulta su disponibilidad actual.",
    photo: "paquetes-promociones",
    photoAlt: "Mujer sonriente en la clínica Praná",
    icon: "seccion-paquetes-y-promociones",
    cta: "Conocer paquetes",
    benefits: [
      "Combinan tratamientos de acuerdo con tu valoración.",
      "Consulta por WhatsApp qué paquetes están disponibles.",
    ],
    treatments: [
      {
        slug: "reset-prana",
        name: "Reset Praná",
        icon: "reset-prana",
        description: "Consulta con el equipo qué incluye Reset Praná y su disponibilidad actual.",
      },
      {
        slug: "reductivo-intenso",
        name: "Tratamiento reductivo intenso",
        icon: "tratamiento-intensivo",
        description:
          "Una opción de cuidado corporal. Pregunta al equipo por sus características y disponibilidad.",
      },
      {
        slug: "paquete-carboxiterapia",
        name: "Paquete de carboxiterapia",
        icon: "paquete-carboxiterapia",
        description:
          "Consulta los detalles y la disponibilidad actual de esta opción de carboxiterapia.",
      },
      {
        slug: "tratamientos-combinados",
        name: "Tratamientos combinados",
        icon: "tratamientos-combinados",
        description:
          "Opciones que combinan tratamientos de acuerdo con una valoración. Consulta con Praná las alternativas disponibles.",
      },
    ],
  },
];

export const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#promociones", label: "Promociones" },
  { href: "#contacto", label: "Contacto" },
] as const;
