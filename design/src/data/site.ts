import type { Benefit, Highlight } from "@/types";

export const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#promociones", label: "Promociones" },
  { href: "#contacto", label: "Contacto" },
] as const;

export const heroHighlights: Highlight[] = [
  { icon: "tratamientos-no-invasivos", label: "Tratamientos no invasivos" },
  { icon: "atencion-personalizada", label: "Atención personalizada" },
  { icon: "resultados-que-se-notan", label: "Resultados que se notan" },
];

export const pillars: Highlight[] = [
  { icon: "valoracion-personalizada", label: "Valoración personalizada para definir tu plan" },
  { icon: "tecnologia-de-vanguardia", label: "Tecnología de vanguardia y protocolos seguros" },
  { icon: "acompanamiento", label: "Acompañamiento durante todo tu tratamiento" },
  { icon: "resultados-visibles", label: "Resultados visibles y bienestar real" },
];

/**
 * Franja del mockup: sus textos e iconos, y los tratamientos relacionados con cada objetivo.
 * Los resultados dependen de cada persona y se valoran en consulta.
 */
export const benefits: Benefit[] = [
  {
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
    icon: "mejora-la-circulacion",
    title: "Mejora la circulación",
    treatments: [
      { categoryId: "corporales", slug: "carboxiterapia" },
      { categoryId: "promociones", slug: "paquete-carboxiterapia" },
      { categoryId: "reductivos", slug: "aparatologia-corporal" },
    ],
  },
  {
    icon: "moldea-tu-figura",
    title: "Moldea tu figura",
    treatments: [
      { categoryId: "reductivos", slug: "aparatologia-corporal" },
      { categoryId: "reductivos", slug: "cavitacion" },
      { categoryId: "promociones", slug: "tratamientos-combinados" },
    ],
  },
  {
    icon: "piel-mas-firme",
    title: "Piel más firme y rejuvenecida",
    treatments: [
      { categoryId: "corporales", slug: "mesoterapia" },
      { categoryId: "corporales", slug: "carboxiterapia" },
    ],
  },
  {
    icon: "bienestar-integral",
    title: "Bienestar integral",
    treatments: [
      { categoryId: "promociones", slug: "reset-prana" },
      { categoryId: "promociones", slug: "tratamientos-combinados" },
    ],
  },
];

/** Datos de contacto confirmados en la web publicada. Los horarios aún no están confirmados. */
export const contact = {
  phoneHref: "tel:+527772095094",
  phoneLabel: "(+52) 777 209 5094",
  email: "indira_ms@outlook.com",
  address: "Calle Guadalupe Victoria #668, Colonia Manantiales, Cuautla, Morelos",
  mapsUrl: "https://maps.app.goo.gl/UYqR1ZagqVEr13GM6",
  hours: null as string | null,
};

export const socialLinks = [
  { network: "instagram", label: "Instagram", href: "https://www.instagram.com/prana_cabinaspa" },
  { network: "facebook", label: "Facebook", href: "https://www.facebook.com/clinicaspanutricionybienestar" },
  { network: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@indira_prana" },
] as const;
