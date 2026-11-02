/**
 * Órdenes del servicio:
 *   node app/src/cli.ts generar [--salida web/dist/sitio] [--sitio https://prana-nutricion.online]
 *       Genera el sitio con el contenido inicial, sin base de datos (vista previa local).
 *   node app/src/cli.ts admin:asegurar --correo ana@ejemplo.mx --nombre "Ana López" [--restablecer]
 *       Deja la cuenta del editor como se pide, sin repetir nada (idempotente, para Ansible):
 *       - si no existe, la crea con la contraseña de stdin;
 *       - si existe, actualiza el nombre y no toca la contraseña, salvo con --restablecer: entonces pone
 *         la de stdin, cierra sus sesiones, la desbloquea y avisa a su dueño por correo.
 *       Una contraseña puesta así la conoce alguien más: se pide cambiarla al entrar.
 *       La contraseña llega solo por stdin, nunca como argumento (quedaría en `ps` y en el historial) ni se
 *       muestra: sin stdin, la orden termina con código 2.
 *       Salida: una línea JSON {"changed":…,"action":"created|updated|password_reset|unchanged","email":…}.
 *       Códigos: 0 bien, 2 datos no válidos, 1 otro error.
 *       En producción, dentro del contenedor de la app (la imagen no lleva npm):
 *         printf %s "$CLAVE" | docker exec -i <contenedor-app> node app/src/cli.ts admin:asegurar --correo … --nombre …
 */
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { adminNameSchema, emailSchema, fieldErrors, newPassword } from "#shared/schemas.ts";
import { hashPassword } from "./auth/passwords.ts";
import { isStrongPassword, WEAK_PASSWORD_MESSAGE } from "./auth/strength.ts";
import { loadDatabaseConfig, loadServiceConfig } from "./config.ts";
import { audit } from "./content/repository.ts";
import { createPool, transaction } from "./db.ts";
import { createBoss, mails, queueMailer } from "./jobs/mail.ts";

const root = resolve(import.meta.dirname, "..", "..");
const [command, ...rest] = process.argv.slice(2);

async function readStdin() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

if (command === "generar") {
  // Solo esta orden carga el generador y el contenido inicial: admin:asegurar corre junto al servicio, con
  // su mismo límite de memoria.
  const [{ seedContent }, { generateSite, loadRenderer }, { clinicToday }] = await Promise.all([
    import("#shared/seed/index.ts"), import("./site/generator.ts"), import("./site/publisher.ts")]);
  const { values } = parseArgs({ args: rest, options: { salida: { type: "string" }, sitio: { type: "string" }, dia: { type: "string" } } });
  const webDist = process.env.WEB_DIST ?? join(root, "web", "dist");
  const siteDir = resolve(values.salida ?? join(webDist, "sitio"));
  await mkdir(siteDir, { recursive: true });
  const result = await generateSite({
    content: seedContent(values.dia ?? clinicToday()),
    webDist,
    siteDir,
    siteUrl: values.sitio ?? "https://prana-nutricion.online",
    renderer: await loadRenderer(webDist),
  });
  console.log(`Sitio generado (${result.pages} páginas) en ${join(siteDir, "current")}`);
} else if (command === "admin:asegurar") {
  const { values } = parseArgs({ args: rest, options: { correo: { type: "string" }, nombre: { type: "string" }, restablecer: { type: "boolean" } } });
  const email = emailSchema.safeParse(values.correo ?? "");
  if (!email.success) fail(`--correo: ${fieldErrors(email.error)[0].message}`, 2);
  const name = adminNameSchema.safeParse(values.nombre ?? "");
  if (!name.success || !name.data) fail(`--nombre: ${name.success ? "Escribe un nombre." : fieldErrors(name.error)[0].message}`, 2);
  if (process.stdin.isTTY) fail("Contraseña: pásala por stdin (printf %s \"$CLAVE\" | node app/src/cli.ts admin:asegurar …).", 2);
  const password = await readStdin();
  const checked = newPassword.safeParse(password);
  if (!checked.success) fail(`Contraseña: ${fieldErrors(checked.error)[0].message}`, 2);
  if (!(await isStrongPassword(password, { email: email.data, name: name.data }))) fail(`Contraseña: ${WEAK_PASSWORD_MESSAGE}`, 2);

  const config = loadServiceConfig();
  const pool = createPool(loadDatabaseConfig(), { max: 1 });
  const boss = createBoss(config);
  try {
    const passwordHash = await hashPassword(password);
    const result = await transaction(pool, async (client) => {
      const { rows: [existing] } = await client.query<{ id: string; name: string }>(
        "SELECT id, name FROM admin_users WHERE email = $1 FOR UPDATE", [email.data]);
      if (!existing) {
        const { rows: [row] } = await client.query<{ id: string }>(
          "INSERT INTO admin_users (email, name, password_hash, must_change_password) VALUES ($1, $2, $3, true) RETURNING id",
          [email.data, name.data, passwordHash]);
        await audit(client, null, "admin_user.create", "admin_user", row.id);
        return { action: "created" as const };
      }
      if (values.restablecer) {
        await client.query(
          `UPDATE admin_users SET name = $2, password_hash = $3, must_change_password = true, password_changed_at = now(), updated_at = now()
            WHERE id = $1`, [existing.id, name.data, passwordHash]);
        await client.query("DELETE FROM admin_sessions WHERE user_id = $1", [existing.id]);
        await client.query("DELETE FROM auth_attempts WHERE kind = 'login' AND subject = $1", [email.data]);
        await audit(client, null, "admin_user.password_reset", "admin_user", existing.id);
        return { action: "password_reset" as const };
      }
      if (existing.name !== name.data) {
        await client.query("UPDATE admin_users SET name = $2, updated_at = now() WHERE id = $1", [existing.id, name.data]);
        await audit(client, null, "admin_user.update", "admin_user", existing.id);
        return { action: "updated" as const };
      }
      return { action: "unchanged" as const };
    });
    if (result.action === "password_reset") {
      // Solo para encolar el aviso: el trabajador de la app lo envía.
      await boss.start();
      await queueMailer(boss).send(mails.passwordChanged(email.data, config.ADMIN_URL));
    }
    console.log(JSON.stringify({ changed: result.action !== "unchanged", action: result.action, email: email.data }));
  } finally {
    await boss.stop({ graceful: false }).catch(() => {});
    await pool.end();
  }
} else {
  fail("Uso: node app/src/cli.ts generar | admin:asegurar --correo … --nombre … [--restablecer]", 2);
}
