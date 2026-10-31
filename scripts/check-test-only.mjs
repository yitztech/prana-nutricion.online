// Servicios solo de pruebas (AGENTS.md §35): nunca en el compose de producción, en un Dockerfile ni
// en un workflow de despliegue. Un servicio nuevo solo de pruebas se añade a `servicios`.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const servicios = ["mailpit"];
export const etiqueta = "prana.solo-pruebas";

const dockerfiles = (dir = ".") =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".git", "tests"].includes(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return dockerfiles(path);
    return entry.name === "Dockerfile" ? [path] : [];
  });

export function revisar(archivos) {
  return archivos.flatMap((archivo) => {
    const texto = readFileSync(archivo, "utf8");
    return [...servicios, etiqueta]
      .filter((nombre) => new RegExp(`\\b${nombre.replace(/[.]/g, "\\.")}\\b`, "i").test(texto))
      .map((nombre) => `${archivo}: menciona «${nombre}», que solo existe en pruebas`);
  });
}

if (import.meta.main) {
  const archivos = ["compose.prod.yml", ".github/workflows/deploy.yml", ...dockerfiles()].filter(existsSync);
  const errores = revisar(archivos);
  if (errores.length) {
    console.error(errores.join("\n"));
    process.exit(1);
  }
  console.log(`Ningún servicio solo de pruebas en ${archivos.length} archivos de producción.`);
}
