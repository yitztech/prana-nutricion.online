import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

// gateway/17-admin.sh: el server_name del editor sale de ADMIN_URL, validada antes de interpolarla.
function entorno(t) {
  const dir = mkdtempSync(join(tmpdir(), "prana-admin-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const snippet = join(dir, "nginx/snippets/admin-host.conf");
  return {
    snippet,
    ejecutar: (url) => spawnSync("sh", ["gateway/17-admin.sh"], {
      encoding: "utf8", env: { ...process.env, ADMIN_URL: url, NGINX_ENVSUBST_OUTPUT_DIR: dir },
    }),
  };
}

test("el dominio del editor de producción y el local de pruebas", (t) => {
  const { snippet, ejecutar } = entorno(t);
  for (const [url, host] of [["https://admin.prana-nutricion.online", "admin.prana-nutricion.online"],
    ["https://admin.prana-nutricion.online/", "admin.prana-nutricion.online"], ["http://localhost:8091", "localhost"]]) {
    const resultado = ejecutar(url);
    assert.equal(resultado.status, 0, resultado.stderr);
    assert.match(readFileSync(snippet, "utf8"), new RegExp(`^server_name ${host.replaceAll(".", "\\.")};$`, "m"));
  }
});

test("sin ADMIN_URL el gateway no arranca", (t) => {
  const { snippet, ejecutar } = entorno(t);
  const resultado = ejecutar("");
  assert.equal(resultado.status, 1);
  assert.match(resultado.stderr, /falta ADMIN_URL/);
  assert.equal(existsSync(snippet), false);
});

test("se rechazan rutas, otros esquemas, mayúsculas e intentos de inyección", (t) => {
  const { snippet, ejecutar } = entorno(t);
  for (const invalida of ["admin.prana-nutricion.online", "ftp://admin.prana-nutricion.online",
    "https://admin.prana-nutricion.online/panel", "https://Admin.prana-nutricion.online",
    "https://admin.prana-nutricion.online; return 200", "https://admin.prana-nutricion.online\nserver_name _",
    "https://_ ;", "https://*.prana-nutricion.online", "https://user@admin.prana-nutricion.online"]) {
    const resultado = ejecutar(invalida);
    assert.equal(resultado.status, 1, invalida);
    assert.match(resultado.stderr, /ADMIN_URL debe ser un origen/);
    assert.equal(existsSync(snippet), false, invalida);
  }
});
