import assert from "node:assert/strict";
import { test } from "node:test";
import { isStrongPassword } from "./strength.ts";

const cuenta = { email: "ana.lopez@ejemplo.mx", name: "Ana López" };

test("acepta frases largas y contraseñas de gestor", async () => {
  for (const buena of ["girasol remo tejado brújula", "Kq7#mV2$pL9@xR4!wZ", "tortuga-violin-mango-nube"]) {
    assert.equal(await isStrongPassword(buena, cuenta), true, buena);
  }
});

test("rechaza contraseñas comunes, secuencias, teclados y repeticiones", async () => {
  for (const debil of ["passwordpassword", "1234567890123456", "qwertyuiopasdfgh", "aaaaaaaaaaaaaaaa", "contraseña123456"]) {
    assert.equal(await isStrongPassword(debil, cuenta), false, debil);
  }
});

test("rechaza lo que se deduce de la clínica o de la cuenta", async () => {
  for (const debil of ["cuautla-morelos-prana", "Prana Nutrición 2026!", "ana.lopez@ejemplo.mx", "AnaLópez-2026-Ana!"]) {
    assert.equal(await isStrongPassword(debil, cuenta), false, debil);
  }
});
