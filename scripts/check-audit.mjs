// npm audit con excepciones por aviso, nunca por paquete completo.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const excepciones = {
  "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm": {
    motivo: "Sin arreglo; solo en tailwindcss --watch, fuera de la imagen final",
    revisar: "2026-11-20",
  },
};
const niveles = ["info", "low", "moderate", "high", "critical"];
const graves = new Set(["high", "critical"]);
const objeto = (valor) => valor !== null && typeof valor === "object" && !Array.isArray(valor);

export function evaluarAuditoria(salida, hoy = new Date().toISOString().slice(0, 10)) {
  let informe;
  try {
    informe = JSON.parse(salida);
  } catch {
    throw new Error("npm audit no devolvió JSON válido; no se pudo completar la auditoría.");
  }
  const resumen = informe?.metadata?.vulnerabilities;
  if (!objeto(informe) || informe.error || informe.auditReportVersion !== 2 ||
      !objeto(informe.vulnerabilities) || !objeto(resumen) ||
      ![...niveles, "total"].every((nivel) => Number.isInteger(resumen[nivel]) && resumen[nivel] >= 0) ||
      niveles.reduce((total, nivel) => total + resumen[nivel], 0) !== resumen.total ||
      Object.keys(informe.vulnerabilities).length !== resumen.total) {
    throw new Error("npm audit devolvió un error o un informe incompleto; no se pudo completar la auditoría.");
  }

  const vulnerabilidades = informe.vulnerabilities;
  const recuento = Object.fromEntries(niveles.map((nivel) => [nivel, 0]));
  for (const [paquete, v] of Object.entries(vulnerabilidades)) {
    if (!objeto(v) || !niveles.includes(v.severity) || !Array.isArray(v.via) || !v.via.length) {
      throw new Error(`Informe de npm audit inválido para ${paquete}.`);
    }
    recuento[v.severity]++;
    for (const via of v.via) {
      if (typeof via === "string" ? !Object.hasOwn(vulnerabilidades, via) :
          !objeto(via) || typeof via.url !== "string" || !via.url || !niveles.includes(via.severity)) {
        throw new Error(`Aviso o dependencia sin resolver en npm audit: ${paquete}.`);
      }
    }
  }
  if (niveles.some((nivel) => recuento[nivel] !== resumen[nivel])) {
    throw new Error("npm audit devolvió un resumen incoherente; no se pudo completar la auditoría.");
  }

  // npm representa las vulnerabilidades transitivas con nombres en `via`.
  // Se siguen todos sus avisos: aceptar uno nunca acepta otros del mismo paquete.
  const avisosDe = (paquete, camino = new Set()) => {
    if (camino.has(paquete)) throw new Error(`Dependencia circular en el informe de npm audit: ${paquete}.`);
    const siguiente = new Set([...camino, paquete]);
    return vulnerabilidades[paquete].via.flatMap((via) =>
      typeof via === "string" ? avisosDe(via, siguiente) : [via]);
  };
  const aceptados = new Map();
  const fallos = new Set();
  for (const [paquete, v] of Object.entries(vulnerabilidades)) {
    const avisos = avisosDe(paquete).filter((aviso) => graves.has(aviso.severity));
    if (graves.has(v.severity) && !avisos.length) throw new Error(`No se pudo resolver el aviso grave de ${paquete}.`);
    for (const aviso of avisos) {
      const excepcion = excepciones[aviso.url];
      if (excepcion && hoy <= excepcion.revisar) {
        aceptados.set(aviso.url, `Aceptado hasta ${excepcion.revisar}: ${aviso.url}: ${excepcion.motivo}`);
      } else {
        fallos.add(`${paquete} (${aviso.severity}): ${aviso.url}${excepcion ? `; excepción caducada el ${excepcion.revisar}` : ""}`);
      }
    }
  }
  return { aceptados: [...aceptados.values()], fallos: [...fallos] };
}

export function comprobarAuditoria(ejecutar = execFileSync) {
  let salida;
  try {
    salida = ejecutar("npm", ["audit", "--json"], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 60_000,
    });
  } catch (error) {
    // Solo el código 1 puede representar vulnerabilidades; los demás son errores de ejecución.
    if (error.status !== 1 || error.signal || typeof error.stdout !== "string") {
      throw new Error("No se pudo ejecutar npm audit; la auditoría no está disponible.", { cause: error });
    }
    salida = error.stdout;
  }
  return evaluarAuditoria(salida);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { aceptados, fallos } = comprobarAuditoria();
    for (const aviso of aceptados) console.log(aviso);
    if (fallos.length) throw new Error(`Vulnerabilidades altas o críticas:\n- ${fallos.join("\n- ")}`);
    console.log("npm audit: sin vulnerabilidades altas ni críticas fuera de las excepciones.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
