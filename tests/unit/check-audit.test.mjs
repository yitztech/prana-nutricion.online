import assert from "node:assert/strict";
import { test } from "node:test";
import { comprobarAuditoria, evaluarAuditoria } from "../../scripts/check-audit.mjs";

const conocido = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const nuevo = "https://github.com/advisories/GHSA-nuevo";
const aviso = (url = conocido, severity = "high") => ({ url, severity });
const vulnerabilidad = (via, severity = "high") => ({ severity, via });
function informe(vulnerabilities = {}) {
  const resumen = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
  for (const v of Object.values(vulnerabilities)) { resumen[v.severity]++; resumen.total++; }
  return { auditReportVersion: 2, vulnerabilities, metadata: { vulnerabilities: resumen } };
}
const evaluar = (vulnerabilidades, fecha = "2026-10-23") => evaluarAuditoria(JSON.stringify(informe(vulnerabilidades)), fecha);

test("un informe limpio completo pasa", () => {
  assert.deepEqual(evaluar({}), { aceptados: [], fallos: [] });
});

test("las excepciones se resuelven a través de todas las dependencias transitivas", () => {
  const resultado = evaluar({
    braces: vulnerabilidad([aviso()]),
    micromatch: vulnerabilidad(["braces"]),
    watcher: vulnerabilidad(["micromatch"]),
    cli: vulnerabilidad(["watcher"]),
  });
  assert.equal(resultado.aceptados.length, 1);
  assert.deepEqual(resultado.fallos, []);
});

test("aceptar un aviso nunca acepta otro del mismo paquete ni de sus dependientes", () => {
  const resultado = evaluar({ braces: vulnerabilidad([aviso(), aviso(nuevo)]), cli: vulnerabilidad(["braces"]) });
  assert.equal(resultado.aceptados.length, 1);
  assert.equal(resultado.fallos.length, 2);
  assert.ok(resultado.fallos.every((fallo) => fallo.includes(nuevo)));
});

test("la excepción es válida hasta su fecha de revisión y falla después", () => {
  assert.equal(evaluar({ braces: vulnerabilidad([aviso()]) }, "2026-11-20").fallos.length, 0);
  const resultado = evaluar({ braces: vulnerabilidad([aviso()]) }, "2026-11-21");
  assert.equal(resultado.aceptados.length, 0);
  assert.match(resultado.fallos[0], /caducada el 2026-11-20/);
});

test("una vulnerabilidad crítica desconocida falla; una moderada no supera el umbral", () => {
  assert.equal(evaluar({ pkg: vulnerabilidad([aviso(nuevo, "critical")], "critical") }).fallos.length, 1);
  assert.deepEqual(evaluar({ pkg: vulnerabilidad([aviso(nuevo, "moderate")], "moderate") }), { aceptados: [], fallos: [] });
  assert.equal(evaluar({ pkg: vulnerabilidad([aviso(nuevo, "high")], "low") }).fallos.length, 1);
});

test("un resumen que rebaja la gravedad de los paquetes no pasa", () => {
  const datos = informe({ pkg: vulnerabilidad([aviso(nuevo)]) });
  datos.metadata.vulnerabilities.high = 0;
  datos.metadata.vulnerabilities.low = 1;
  assert.throws(() => evaluarAuditoria(JSON.stringify(datos)), /incoherente/);
});

test("un fallo del registro, JSON inválido o un informe parcial nunca se interpreta como limpio", () => {
  const casos = ["", "no es JSON", "null", "[]", "{}", JSON.stringify({ error: { code: "EAI_AGAIN" } }),
    JSON.stringify({ ...informe(), error: { code: "EAUDITNOLOCK" } }),
    JSON.stringify({ ...informe(), auditReportVersion: 1 }),
    JSON.stringify({ ...informe(), metadata: {} }),
    JSON.stringify({ ...informe(), vulnerabilities: [] }),
    JSON.stringify({ ...informe(), metadata: { vulnerabilities: { total: 0 } } }),
    JSON.stringify({ ...informe(), metadata: { vulnerabilities: { ...informe().metadata.vulnerabilities, high: 1 } } }),
  ];
  for (const salida of casos) assert.throws(() => evaluarAuditoria(salida), /auditoría/);
});

test("las dependencias sin resolver, ciclos y avisos incompletos fallan", () => {
  const casos = [
    { pkg: vulnerabilidad(["no-existe"]) },
    { pkg: vulnerabilidad(["otro"]), otro: vulnerabilidad(["pkg"]) },
    { pkg: vulnerabilidad([]) },
    { pkg: vulnerabilidad([null]) },
    { pkg: vulnerabilidad([{ severity: "high" }]) },
    { pkg: vulnerabilidad([{ url: nuevo, severity: "desconocida" }]) },
    { pkg: vulnerabilidad([aviso(nuevo, "moderate")]) },
  ];
  for (const caso of casos) assert.throws(() => evaluar(caso));
});

test("solo el código 1 con informe completo puede representar vulnerabilidades", () => {
  const salida = JSON.stringify(informe({ pkg: vulnerabilidad([aviso(nuevo)]) }));
  const resultado = comprobarAuditoria(() => { throw Object.assign(new Error(), { status: 1, stdout: salida }); });
  assert.equal(resultado.fallos.length, 1);
  for (const detalles of [
    { status: 2, stdout: JSON.stringify(informe()) },
    { status: 1, stdout: "" },
    { status: 1, stdout: JSON.stringify(informe()), signal: "SIGTERM" },
    { code: "ENOENT" },
    { code: "ETIMEDOUT", signal: "SIGTERM" },
  ]) assert.throws(() => comprobarAuditoria(() => { throw Object.assign(new Error(), detalles); }));
});
