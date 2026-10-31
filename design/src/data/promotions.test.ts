import assert from "node:assert/strict";
import { test } from "node:test";
import type { Promotion } from "../types";
import { activePromotions, upcomingPromotions, archivedPromotions, promotions, formatDay, formatPrice, todayInClinic, visiblePromotions, isUpcoming, promotionPeriod } from "./promotions.ts";

const base: Promotion = {
  id: "a",
  name: "A",
  description: "",
  treatments: [],
  endsOn: "2026-11-30",
  status: "active",
  image: "/img/x.webp",
  imageAlt: "",
  cta: { label: "Quiero" },
};

test("solo publica promociones activas y vigentes", () => {
  const list: Promotion[] = [
    base,
    { ...base, id: "inactiva", status: "inactive" },
    { ...base, id: "vencida", endsOn: "2026-10-29" },
    { ...base, id: "futura", startsOn: "2026-11-15" },
    { ...base, id: "ultimo-dia", endsOn: "2026-10-30" },
  ];
  assert.deepEqual(
    activePromotions(list, "2026-10-30").map((p) => p.id),
    ["ultimo-dia", "a"],
  );
});

test("sin promociones activas devuelve una lista vacía", () => {
  assert.deepEqual(activePromotions([{ ...base, status: "inactive" }], "2026-10-30"), []);
});

test("el día se calcula en la hora de Cuautla", () => {
  // 03:00 UTC del 31 de octubre son las 21:00 del 30 en Ciudad de México.
  assert.equal(todayInClinic(new Date("2026-10-31T03:00:00Z")), "2026-10-30");
});

test("formatea precio en MXN y fecha en español", () => {
  assert.match(formatPrice(150000), /1,500\.00/);
  assert.equal(formatDay("2026-11-30"), "30 de noviembre de 2026");
});

test("Reset Praná conserva el precio, apartado e inclusiones confirmados", () => {
  const reset = promotions.find((p) => p.id === "reset-prana-buen-fin-2026")!;
  assert.equal(reset.priceCents, 249000);
  assert.equal(reset.depositCents, 50000);
  assert.deepEqual(reset.includes?.map((item) => [item.quantity, item.free]), [[5, undefined], [3, undefined], [undefined, true]]);
  assert.equal(reset.startsOn, "2026-11-13");
  assert.equal(reset.endsOn, "2026-11-17");
});

test("Buen Fin se anuncia como próximo, solo está vigente del 13 al 17 y desaparece al vencer", () => {
  const reset = promotions.filter((p) => p.id === "reset-prana-buen-fin-2026");
  assert.equal(activePromotions(reset, "2026-10-31").length, 0);
  assert.equal(upcomingPromotions(reset, "2026-10-31").length, 1);
  assert.equal(activePromotions(reset, "2026-11-13").length, 1);
  assert.equal(activePromotions(reset, "2026-11-17").length, 1);
  assert.equal(upcomingPromotions(reset, "2026-11-13").length, 0);
  assert.equal(activePromotions(reset, "2026-11-18").length, 0);
  assert.equal(upcomingPromotions(reset, "2026-11-18").length, 0);
  assert.equal(upcomingPromotions(promotions.map((p) => ({ ...p, status: "inactive" })), "2026-10-31").length, 0);
});

test("los paquetes de carboxiterapia están vigentes hasta el 30 de noviembre con sus precios", () => {
  const ids = ["paquete-carboxiterapia-6-sesiones", "carboxiterapia-pagas-1-llevas-3"];
  const [carbox, football] = ids.map((id) => promotions.find((p) => p.id === id)!);
  assert.equal(carbox.priceCents, 458900);
  assert.equal(carbox.includes?.[0].quantity, 6);
  assert.equal(football.priceCents, 623900);
  assert.equal(football.includes, undefined, "no se inventa la unidad de la oferta");
  assert.deepEqual(activePromotions(promotions, "2026-10-31").map((p) => p.id), ids);
  assert.deepEqual(activePromotions(promotions, "2026-12-01"), []);
});

test("el archivo conserva las condiciones comerciales de las campañas pasadas", () => {
  assert.equal(archivedPromotions.length, 2);
  const [august, july] = archivedPromotions;
  assert.deepEqual(august.discounts?.map((item) => item.percent), [30, 20, 40]);
  assert.equal(august.discounts?.[2].label, "Depilación láser · cuerpo completo");
  assert.equal(july.offerLabel, "3×2");
  assert.match(july.description, /en el mismo servicio/);
  assert.equal(july.priceCents, undefined);
});

test("el archivo no inventa fechas ni permite contratar las ofertas históricas", () => {
  for (const item of archivedPromotions) {
    assert.equal(item.status, "archived");
    assert.equal("startsOn" in item, false);
    assert.equal("endsOn" in item, false);
    assert.equal("cta" in item, false);
    assert.equal(promotions.some((p) => p.id === item.id), false);
  }
});

test("anuncia primero las vigentes y después las próximas, con su periodo", () => {
  const list: Promotion[] = [
    { ...base, id: "proxima", startsOn: "2026-11-13", endsOn: "2026-11-17" },
    { ...base, id: "vigente" },
  ];
  assert.deepEqual(visiblePromotions(list, "2026-10-31").map((p) => p.id), ["vigente", "proxima"]);
  assert.equal(isUpcoming(list[0], "2026-10-31"), true);
  assert.equal(isUpcoming(list[0], "2026-11-13"), false);
  assert.equal(promotionPeriod(list[0]), "Del 13 de noviembre de 2026 al 17 de noviembre de 2026");
  assert.equal(promotionPeriod(base), "Hasta el 30 de noviembre de 2026");
});
