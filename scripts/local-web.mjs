import { spawnSync } from "node:child_process";

const ejecutarComando = (cmd, env) => {
  const resultado = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit", env });
  if (resultado.error) throw resultado.error;
  return resultado.status;
};

export async function prepararWeb({ env, reutilizar = false, ejecutar = ejecutarComando, salud }) {
  if (env.E2E_BASE_URL) return;
  if (reutilizar) {
    const comprobar = salud ?? (async () => {
      try {
        return (await fetch(`http://127.0.0.1:${env.E2E_PUERTO || "8091"}/healthz`, {
          signal: AbortSignal.timeout(3000),
        })).ok;
      } catch {
        return false;
      }
    });
    if (!(await comprobar())) throw new Error("--reuse requiere una web local saludable; ejecuta npm test sin --reuse.");
    console.log("Reutilizo la web local (--reuse): no se verifica que incluya los últimos cambios.");
    return;
  }

  console.log("Construyo las imágenes actuales y recreo la web local…");
  const pasos = [
    ["docker", "build", "-q", "-f", "gateway/Dockerfile", "--build-arg", "RELEASE_SHA=local", "-t", `${env.IMAGE_PREFIX}-gateway:${env.IMAGE_TAG}`, "."],
    ["docker", "build", "-q", "-f", "web/Dockerfile", "-t", `${env.IMAGE_PREFIX}-web:${env.IMAGE_TAG}`, "."],
    ["docker", "compose", "-f", "compose.prod.yml", "-f", "compose.ci.yml", "up", "-d", "--no-build", "--force-recreate", "--wait", "--wait-timeout", "120"],
  ];
  for (const paso of pasos) if (ejecutar(paso, env) !== 0) throw new Error(`Falló: ${paso.join(" ")}`);
}
