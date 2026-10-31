import type { Promotion } from "../types/index.ts";

import { formatDay } from "../lib/clinic-date.ts";

export { CLINIC_TIME_ZONE as PROMOTIONS_TIME_ZONE, formatDay, todayInClinic } from "../lib/clinic-date.ts";

/** Promociones activas y vigentes en `today`, las que terminan antes primero. */
export function activePromotions(list: readonly Promotion[], today: string) {
  return list
    .filter((p) => p.status === "active" && (!p.startsOn || p.startsOn <= today) && today <= p.endsOn)
    .sort((a, b) => a.endsOn.localeCompare(b.endsOn));
}

/** Se anuncian con fecha explícita, sin presentarlas como disponibles antes del inicio. */
export function upcomingPromotions(list: readonly Promotion[], today: string) {
  return list
    .filter((p) => p.status === "active" && p.startsOn !== undefined && today < p.startsOn && p.startsOn <= p.endsOn)
    .sort((a, b) => a.startsOn!.localeCompare(b.startsOn!));
}

/** Lo que se anuncia: primero las vigentes y después las próximas. */
export function visiblePromotions(list: readonly Promotion[], today: string) {
  return [...activePromotions(list, today), ...upcomingPromotions(list, today)];
}

export function isUpcoming(promotion: Promotion, today: string) {
  return promotion.startsOn !== undefined && today < promotion.startsOn;
}

/** «Del 13 de noviembre de 2026 al 17 de noviembre de 2026» o «Hasta el …». */
export function promotionPeriod(promotion: Promotion) {
  return promotion.startsOn
    ? `Del ${formatDay(promotion.startsOn)} al ${formatDay(promotion.endsOn)}`
    : `Hasta el ${formatDay(promotion.endsOn)}`;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
}
