// `npm test`: todas las suites del proyecto, una tras otra, con un resumen al final (AGENTS.md §37).
// Reconstruye y recrea la web local con Docker (compose.prod.yml + compose.ci.yml).
//   npm test                 todas
//   npm test -- --lista      las muestra
//   npm test -- e2e          solo esas
//   npm test -- --reuse      reutiliza explícitamente la web local que ya está arriba
import { spawnSync } from "node:child_process";
import { prepararWeb } from "./local-web.mjs";

const env = {
  IMAGE_PREFIX: "local/ci",
  IMAGE_TAG: "ci",
  TRUSTED_PROXY_CIDR: "127.0.0.1/32",
  ...process.env,
};
const suites = {
  unit: { descripcion: "Auditoría, scripts locales y configuración de analítica", comando: ["npm", "run", "test:unit"] },
  e2e: { descripcion: "Escenarios web (Playwright + Gherkin)", comando: ["npm", "run", "e2e"], necesitaWeb: true },
};

const args = process.argv.slice(2);
if (args.includes("--lista")) {
  for (const [nombre, s] of Object.entries(suites)) console.log(`${nombre.padEnd(8)} ${s.descripcion}`);
  process.exit(0);
}
const reutilizar = args.includes("--reuse");
const nombres = args.filter((arg) => arg !== "--reuse");
const elegidas = nombres.length ? nombres : Object.keys(suites);
for (const nombre of elegidas) {
  if (!Object.hasOwn(suites, nombre)) {
    console.error(`Suite desconocida: ${nombre} (npm test -- --lista)`);
    process.exit(2);
  }
}

const corre = (cmd) => {
  const resultado = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit", env });
  if (resultado.error) throw resultado.error;
  return resultado.status;
};

const resultados = [];
let webPreparada = false;
for (const nombre of elegidas) {
  const suite = suites[nombre];
  const inicio = Date.now();
  let estado;
  try {
    if (suite.necesitaWeb && !webPreparada) {
      await prepararWeb({ env, reutilizar });
      webPreparada = true;
    }
    estado = corre(suite.comando);
    if (suite.necesitaWeb) {
      const resumen = corre(["npm", "run", "e2e:summary"]);
      if (resumen !== 0) estado = 1;
    }
  } catch (e) {
    console.error(e.message);
    estado = 1;
  }
  resultados.push({ nombre, ok: estado === 0, segundos: Math.round((Date.now() - inicio) / 1000), comando: suite.comando.join(" ") });
}

console.log("\nResumen");
for (const r of resultados) console.log(`  ${r.ok ? "✓" : "✗"} ${r.nombre.padEnd(8)} ${r.segundos}s${r.ok ? "" : `   repetir: ${r.comando}`}`);
process.exit(resultados.every((r) => r.ok) ? 0 : 1);
