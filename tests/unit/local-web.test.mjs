import assert from "node:assert/strict";
import { test } from "node:test";
import { prepararWeb } from "../../scripts/local-web.mjs";

const env = { IMAGE_PREFIX: "local/prana-prueba", IMAGE_TAG: "actual", E2E_PUERTO: "8091" };

test("cada ejecución reconstruye y recrea aunque ya exista una web saludable", async () => {
  const comandos = [];
  const opciones = { env, salud: () => { throw new Error("No debe reutilizar por salud"); }, ejecutar: (cmd, vars) => {
    assert.equal(vars, env);
    comandos.push(cmd);
    return 0;
  } };
  await prepararWeb(opciones);
  await prepararWeb(opciones);
  assert.equal(comandos.length, 6);
  assert.equal(comandos[0].at(-2), "local/prana-prueba-gateway:actual");
  assert.equal(comandos[1].at(-2), "local/prana-prueba-web:actual");
  assert.ok(comandos[2].includes("--force-recreate"));
  assert.deepEqual(comandos.slice(0, 3), comandos.slice(3));
});

test("--reuse evita Docker solo cuando la web está saludable", async () => {
  const ejecutar = () => { throw new Error("No debe ejecutar Docker"); };
  await prepararWeb({ env, reutilizar: true, salud: async () => true, ejecutar });
  await assert.rejects(prepararWeb({ env, reutilizar: true, salud: async () => false, ejecutar }), /saludable/);
});

test("un destino externo explícito no construye ni modifica servicios locales", async () => {
  await prepararWeb({ env: { ...env, E2E_BASE_URL: "https://prueba.example" }, ejecutar: () => { throw new Error("Docker"); } });
});

test("un fallo de build o compose detiene la preparación y se propaga", async () => {
  for (const fallarEn of [1, 2, 3]) {
    let ejecuciones = 0;
    await assert.rejects(prepararWeb({ env, ejecutar: () => ++ejecuciones === fallarEn ? 1 : 0 }), /Falló:/);
    assert.equal(ejecuciones, fallarEn);
  }
});
