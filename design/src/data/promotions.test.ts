import assert from "node:assert/strict";
import { test } from "node:test";
import type { Promotion } from "../types";
import { activePromotions, formatDay, formatPrice, todayInClinic } from "./promotions.ts";

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
