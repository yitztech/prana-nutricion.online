import type { Highlight } from "@/types";

/** Las anclas (`#…`) llevan a secciones de la portada; las rutas, a páginas propias. */
export const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "/tratamientos/promociones/", label: "Promociones" },
  { href: "#contacto", label: "Contacto" },
] as const;

/** Fuera de la portada, las anclas apuntan a la sección de la portada. */
export function navItemHref(href: string, home: boolean) {
  return href.startsWith("#") && !home ? `/${href}` : href;
}

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
