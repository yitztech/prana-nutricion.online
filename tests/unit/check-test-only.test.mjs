import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { revisar } from "../../scripts/check-test-only.mjs";

test("ningún servicio solo de pruebas llega a producción", () => {
  const result = spawnSync(process.execPath, ["scripts/check-test-only.mjs"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("detecta Mailpit o la etiqueta en un archivo de producción", () => {
  const dir = mkdtempSync(join(tmpdir(), "solo-pruebas-"));
  const compose = join(dir, "compose.prod.yml");
  writeFileSync(compose, "services:\n  mailpit:\n    labels:\n      prana.solo-pruebas: \"true\"\n");
  assert.equal(revisar([compose]).length, 2);
});
