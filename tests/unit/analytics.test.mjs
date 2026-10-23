import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const url = "https://stats.yunitztech.com/script.js";
const id = "6b4b9c22-bb5e-4a17-84b8-8f1ea00b310c";
function entorno(t) {
  const dir = mkdtempSync(join(tmpdir(), "prana-analytics-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { dir, ejecutar: (script = "", uuid = "") => spawnSync("sh", ["gateway/16-analytics.sh"], {
    encoding: "utf8", env: { ...process.env, UMAMI_SCRIPT_URL: script, UMAMI_WEBSITE_ID: uuid, NGINX_ENVSUBST_OUTPUT_DIR: dir },
  }) };
}

test("sin variables no se carga analítica; una reconfiguración limpia el snippet anterior", (t) => {
  const { dir, ejecutar } = entorno(t);
  assert.equal(ejecutar(url, id).status, 0);
  assert.equal(ejecutar().status, 0);
  assert.equal(existsSync(join(dir, "nginx/snippets/analytics.conf")), false);
  assert.equal(readFileSync(join(dir, "nginx/analytics.conf"), "utf8"), 'map $host $analytics_src { default ""; }\n');
});

test("la configuración válida genera solo el origen y el script permitidos", (t) => {
  const { dir, ejecutar } = entorno(t);
  const resultado = ejecutar(url, id);
  assert.equal(resultado.status, 0, resultado.stderr);
  assert.match(readFileSync(join(dir, "nginx/snippets/analytics.conf"), "utf8"), new RegExp(`data-website-id="${id}"`));
  assert.equal(readFileSync(join(dir, "nginx/analytics.conf"), "utf8"), 'map $host $analytics_src { default " https://stats.yunitztech.com"; }\n');
});

test("una configuración parcial falla antes de generar archivos", (t) => {
  const { dir, ejecutar } = entorno(t);
  for (const args of [[url, ""], ["", id]]) {
    const resultado = ejecutar(...args);
    assert.equal(resultado.status, 1);
    assert.match(resultado.stderr, /configurarse juntas/);
    assert.equal(existsSync(join(dir, "nginx")), false);
  }
});

test("se rechazan otros orígenes, rutas, protocolos e intentos de inyección", (t) => {
  const { dir, ejecutar } = entorno(t);
  for (const invalida of ["http://stats.yunitztech.com/script.js", "https://evil.example/script.js",
    "https://stats.yunitztech.com.evil.example/script.js", "https://stats.yunitztech.com/otra.js",
    `${url}?x=1`, 'https://stats.yunitztech.com/script.js"><script>', `${url}\n`]) {
    const resultado = ejecutar(invalida, id);
    assert.equal(resultado.status, 1);
    assert.match(resultado.stderr, /UMAMI_SCRIPT_URL/);
    assert.equal(existsSync(join(dir, "nginx")), false);
  }
});

test("se rechazan identificadores malformados y valores que romperían el HTML", (t) => {
  const { dir, ejecutar } = entorno(t);
  for (const invalido of ["no-es-uuid", id.replaceAll("-", ""), `${id}\n`, `${id}"`, `${id};`, "g" + id.slice(1)]) {
    const resultado = ejecutar(url, invalido);
    assert.equal(resultado.status, 1);
    assert.match(resultado.stderr, /UMAMI_WEBSITE_ID/);
    assert.equal(existsSync(join(dir, "nginx")), false);
  }
});
