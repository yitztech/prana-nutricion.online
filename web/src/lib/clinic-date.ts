export const CLINIC_TIME_ZONE = "America/Mexico_City";

/** Fecha de hoy (AAAA-MM-DD) en la zona de la clínica. */
export function todayInClinic(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** «30 de noviembre de 2026» a partir de AAAA-MM-DD, sin desplazamientos de zona horaria. */
export function formatDay(day: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}
