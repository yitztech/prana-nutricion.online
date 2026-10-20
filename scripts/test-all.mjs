// `npm test`: todas las suites del proyecto, una tras otra, con un resumen al final (AGENTS.md §37).
// Si la web no está arriba en local, la levanta con Docker (compose.prod.yml + compose.ci.yml).
//   npm test                 todas
//   npm test -- --lista      las muestra
//   npm test -- e2e          solo esas
import { spawnSync } from "node:child_process";

const env = {
  IMAGE_PREFIX: "local/ci",
  IMAGE_TAG: "ci",
  TRUSTED_PROXY_CIDR: "127.0.0.1/32",
  ...process.env,
};
const puerto = env.E2E_PUERTO || "8091";
const compose = ["compose", "-f", "compose.prod.yml", "-f", "compose.ci.yml"];

const suites = {
  e2e: { descripcion: "Escenarios web (Playwright + Gherkin)", comando: ["npm", "run", "e2e"], necesitaWeb: true },
};

const args = process.argv.slice(2);
if (args.includes("--lista")) {
  for (const [nombre, s] of Object.entries(suites)) console.log(`${nombre.padEnd(8)} ${s.descripcion}`);
  process.exit(0);
}
const elegidas = args.length ? args : Object.keys(suites);

const corre = (cmd, opciones = {}) => spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit", env, ...opciones }).status;

async function webArriba() {
  try {
    return (await fetch(`http://127.0.0.1:${puerto}/healthz`)).ok;
  } catch {
    return false;
  }
}

async function levantarWeb() {
  if (env.E2E_BASE_URL || (await webArriba())) return;
  console.log("La web no está arriba: construyo las imágenes y levanto el compose…");
  const pasos = [
    ["docker", "build", "-q", "-f", "gateway/Dockerfile", "--build-arg", "RELEASE_SHA=local", "-t", "local/ci-gateway:ci", "."],
    ["docker", "build", "-q", "-f", "web/Dockerfile", "-t", "local/ci-web:ci", "."],
    ["docker", ...compose, "up", "-d", "--wait", "--wait-timeout", "120"],
  ];
  for (const paso of pasos) if (corre(paso) !== 0) throw new Error(`Falló: ${paso.join(" ")}`);
}

const resultados = [];
for (const nombre of elegidas) {
  const suite = suites[nombre];
  if (!suite) {
    console.error(`Suite desconocida: ${nombre} (npm test -- --lista)`);
    process.exit(2);
  }
  const inicio = Date.now();
  let estado;
  try {
    if (suite.necesitaWeb) await levantarWeb();
    estado = corre(suite.comando);
  } catch (e) {
    console.error(e.message);
    estado = 1;
  }
  resultados.push({ nombre, ok: estado === 0, segundos: Math.round((Date.now() - inicio) / 1000), comando: suite.comando.join(" ") });
}

console.log("\nResumen");
for (const r of resultados) console.log(`  ${r.ok ? "✓" : "✗"} ${r.nombre.padEnd(8)} ${r.segundos}s${r.ok ? "" : `   repetir: ${r.comando}`}`);
process.exit(resultados.every((r) => r.ok) ? 0 : 1);
