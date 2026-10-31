import type { Category } from "../content.ts";

/** Catálogo inicial aprobado por la clínica. Después se edita desde el admin. */
export const categories: Category[] = [
  {
    id: "reductivos",
    title: "Reductivos",
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
    title: "Corporales",
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
        description: "Paquete de bienestar con aparatología corporal, carboxiterapia y valoración corporal. Consulta las promociones y su vigencia.",
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
