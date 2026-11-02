/**
 * Cuentas del editor desde la plataforma: la orden que usa Ansible (admin:asegurar), ejecutada como la
 * ejecutará en producción, dentro del contenedor de la app y con la contraseña por stdin.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { cerrar, Cliente, correoPara, db } from "../support/cliente.ts";

after(cerrar);

// Solo contra el compose local: en producción la orden la ejecuta la plataforma, no las pruebas.
const local = !process.env.E2E_BASE_URL;
const proyecto = process.env.COMPOSE_PROJECT_NAME ?? "prana-nutriciononline";

function contenedorApp() {
  if (process.env.E2E_APP_CONTAINER) return process.env.E2E_APP_CONTAINER;
  const id = execFileSync("docker", ["ps", "-q", "--filter", "label=com.docker.compose.service=app",
    "--filter", `label=com.docker.compose.project=${proyecto}`], { encoding: "utf8" }).trim().split("\n")[0];
  assert.ok(id, `no hay contenedor app del proyecto ${proyecto}`);
  return id;
}

function asegurar(args: string[], clave: string) {
  const r = spawnSync("docker", ["exec", "-i", contenedorApp(), "node", "app/src/cli.ts", "admin:asegurar", ...args], { input: clave, encoding: "utf8" });
  const salida = r.stdout.trim() ? JSON.parse(r.stdout.trim()) : null;
  return { code: r.status, salida, error: r.stderr };
}

const nuevaClave = () => randomBytes(24).toString("base64url");

async function entrar(email: string, password: string) {
  const cliente = new Cliente();
  const r = await cliente.post("/api/auth/login", { email, password });
  return { cliente, r };
}

describe("admin:asegurar (Ansible)", { skip: !local && "solo contra el compose local" }, () => {
  test("crea la cuenta una vez y después no cambia nada; al entrar pide cambiar la contraseña", async () => {
    const email = `ansible-${randomUUID()}@ejemplo.mx`;
    const clave = nuevaClave();
    const alta = asegurar(["--correo", email, "--nombre", "Ana López"], clave);
    assert.equal(alta.code, 0, alta.error);
    assert.deepEqual(alta.salida, { changed: true, action: "created", email });
    // La contraseña no aparece en ninguna salida.
    assert.doesNotMatch(alta.error + JSON.stringify(alta.salida), new RegExp(clave));

    const repetida = asegurar(["--correo", email, "--nombre", "Ana López"], nuevaClave());
    assert.deepEqual(repetida.salida, { changed: false, action: "unchanged", email });

    const { cliente, r } = await entrar(email, clave);
    assert.equal(r.status, 200, "la contraseña de stdin sirve; la de la segunda pasada no la cambió");
    assert.equal(r.body.user.mustChangePassword, true);
    assert.equal((await cliente.get("/api/admin/categories")).status, 403);

    const renombrada = asegurar(["--correo", email, "--nombre", "Ana López Ruiz"], nuevaClave());
    assert.deepEqual(renombrada.salida, { changed: true, action: "updated", email });
  });

  test("--restablecer pone la contraseña nueva, cierra las sesiones, desbloquea y avisa", async () => {
    const email = `ansible-${randomUUID()}@ejemplo.mx`;
    const vieja = nuevaClave();
    asegurar(["--correo", email, "--nombre", "Ana López"], vieja);
    const { cliente: abierta } = await entrar(email, vieja);
    for (let i = 0; i < 5; i++) await new Cliente().post("/api/auth/login", { email, password: `mala-${i}` });
    assert.equal((await entrar(email, vieja)).r.status, 429, "bloqueada por los intentos fallidos");
    await correoPara(email, /Bloqueamos/);

    const nueva = nuevaClave();
    const reset = asegurar(["--correo", email, "--nombre", "Ana López", "--restablecer"], nueva);
    assert.deepEqual(reset.salida, { changed: true, action: "password_reset", email });
    assert.equal((await abierta.get("/api/auth/session")).status, 401, "se cerraron sus sesiones");
    assert.equal((await entrar(email, vieja)).r.status, 401);
    const { r } = await entrar(email, nueva);
    assert.equal(r.status, 200);
    assert.equal(r.body.user.mustChangePassword, true);
    await correoPara(email, /cambió/);
  });

  test("rechaza contraseñas débiles y datos no válidos sin tocar la base de datos", async () => {
    const email = `ansible-${randomUUID()}@ejemplo.mx`;
    for (const [args, clave] of [
      [["--correo", email, "--nombre", "Ana"], "corta"],
      [["--correo", email, "--nombre", "Ana"], "passwordpassword"],
      [["--correo", email, "--nombre", "Ana"], ""],
      [["--correo", "no-es-un-correo", "--nombre", "Ana"], nuevaClave()],
      [["--correo", email, "--nombre", "Ana123"], nuevaClave()],
    ] as const) {
      const r = asegurar([...args], clave);
      assert.equal(r.code, 2, `${args.join(" ")}: ${r.error}`);
      assert.equal(r.salida, null);
    }
    const { rowCount } = await db().query("SELECT 1 FROM admin_users WHERE email = $1", [email]);
    assert.equal(rowCount, 0);
  });

  test("la contraseña no se acepta como argumento", () => {
    const r = asegurar(["--correo", `ansible-${randomUUID()}@ejemplo.mx`, "--nombre", "Ana", "--contrasena", nuevaClave()], "");
    assert.notEqual(r.code, 0);
  });
});
