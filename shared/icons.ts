/** Iconos de Praná: web/public/img/iconos/<nombre>.webp. El admin solo ofrece estos. */
export const iconNames = [
  "acompanamiento",
  "aparatologia-corporal",
  "atencion-personalizada",
  "bienestar-integral",
  "bikini-completo",
  "carboxiterapia",
  "cavitacion",
  "cuerpo-completo",
  "lipo-laser",
  "mejora-la-circulacion",
  "mesoterapia",
  "mini-lipo",
  "moldea-tu-figura",
  "paquete-carboxiterapia",
  "piel-mas-firme",
  "reduccion-medidas",
  "reset-prana",
  "resultados-que-se-notan",
  "resultados-visibles",
  "seccion-depilacion-laser",
  "seccion-paquetes-y-promociones",
  "seccion-tratamientos-corporales",
  "seccion-tratamientos-reductivos-2",
  "tecnologia-de-vanguardia",
  "tratamiento-intensivo",
  "tratamientos-combinados",
  "tratamientos-no-invasivos",
  "valoracion-personalizada",
] as const;

export type IconName = (typeof iconNames)[number];

export function isIconName(value: string): value is IconName {
  return (iconNames as readonly string[]).includes(value);
}
