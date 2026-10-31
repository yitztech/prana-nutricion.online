/**
 * Órdenes del servicio:
 *   node app/src/cli.ts generar [--salida web/dist/sitio] [--sitio https://prana-nutricion.online]
 *       Genera el sitio con el contenido inicial, sin base de datos (vista previa local).
 *   node app/src/cli.ts admin:crear --correo ana@ejemplo.mx --nombre "Ana López"
 *       Crea una cuenta del editor. Sin terminal (stdin redirigido) lee la contraseña de stdin; en una
 *       terminal genera una provisional, la muestra una sola vez y pide cambiarla al entrar.
 *       En producción: docker compose exec app node src/cli.ts admin:crear …
 */
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { seedContent } from "#shared/seed/index.ts";
import { adminNameSchema, emailSchema, fieldErrors, newPassword } from "#shared/schemas.ts";
import { hashPassword } from "./auth/passwords.ts";
import { loadDatabaseConfig } from "./config.ts";
import { audit } from "./content/repository.ts";
import { createPool } from "./db.ts";
import { generateSite, loadRenderer } from "./site/generator.ts";
import { clinicToday } from "./site/publisher.ts";

const root = resolve(import.meta.dirname, "..", "..");
const [command, ...rest] = process.argv.slice(2);

async function readStdin() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (command === "generar") {
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
} else if (command === "admin:crear") {
  const { values } = parseArgs({ args: rest, options: { correo: { type: "string" }, nombre: { type: "string" } } });
  const email = emailSchema.safeParse(values.correo ?? "");
  if (!email.success) fail(`--correo: ${fieldErrors(email.error)[0].message}`);
  const name = adminNameSchema.safeParse(values.nombre ?? "");
  if (!name.success || !name.data) fail(`--nombre: ${name.success ? "Escribe un nombre." : fieldErrors(name.error)[0].message}`);
  const provisional = process.stdin.isTTY;
  const password = provisional ? randomBytes(18).toString("base64url") : await readStdin();
  const checked = newPassword.safeParse(password);
  if (!checked.success) fail(`Contraseña: ${fieldErrors(checked.error)[0].message}`);
  const pool = createPool(loadDatabaseConfig(), { max: 1 });
  try {
    const { rows: [row] } = await pool.query<{ id: string }>(
      "INSERT INTO admin_users (email, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id",
      [email.data, name.data, await hashPassword(password)],
    );
    if (!row) fail("Ya existe una cuenta con ese correo.");
    await audit(pool, null, "admin_user.create", "admin_user", row.id);
    console.log(`Cuenta creada: ${email.data}`);
    if (provisional) console.log(`Contraseña provisional (se muestra una sola vez; cámbiala al entrar): ${password}`);
  } finally {
    await pool.end();
  }
} else {
  fail("Uso: node app/src/cli.ts generar | admin:crear --correo … --nombre …");
}
