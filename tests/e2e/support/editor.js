// Apoyo de los escenarios del editor: cuentas únicas por escenario (PostgreSQL del compose de pruebas),
// correos de Mailpit y espera a que el sitio publicado refleje un cambio.
import { randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import pg from "pg";
import { pgURL } from "./entorno.js";

const mailpit = process.env.E2E_MAILPIT_URL ?? `http://127.0.0.1:${process.env.E2E_MAILPIT_PUERTO ?? "8025"}`;

/** Los mismos parámetros que app/src/auth/passwords.ts. */
const hash = (password) => argon2.hash(password, { type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1 });

/** provisional: como la crea la plataforma (admin:asegurar), que obliga a cambiar la contraseña al entrar. */
export async function nuevaCuenta(nombre = "Persona de prueba", { provisional = false } = {}) {
  const email = `e2e-${randomUUID()}@ejemplo.mx`;
  const password = `clave-${randomBytes(9).toString("base64url")}`;
  const db = new pg.Client({ connectionString: pgURL, options: "-c search_path=prana" });
  await db.connect();
  try {
    await db.query("INSERT INTO admin_users (email, name, password_hash, must_change_password) VALUES ($1, $2, $3, $4)",
      [email, nombre, await hash(password), provisional]);
  } finally {
    await db.end();
  }
  return { email, password, nombre };
}

/** Los intentos fallidos de un escenario no deben bloquear a los siguientes (límite por IP). */
export async function limpiarIntentos(email) {
  const db = new pg.Client({ connectionString: pgURL, options: "-c search_path=prana" });
  await db.connect();
  try {
    await db.query("DELETE FROM auth_attempts WHERE subject = $1", [email]);
  } finally {
    await db.end();
  }
}

/** Último correo para una dirección, esperando a que llegue. */
export async function correoPara(direccion, asunto, timeoutMs = 15_000) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    const r = await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${direccion}"`)}`);
    const { messages = [] } = await r.json();
    const mensaje = messages.find((m) => asunto.test(m.Subject));
    if (mensaje) return (await fetch(`${mailpit}/api/v1/message/${mensaje.ID}`)).json();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`No llegó ningún correo para ${direccion}`);
}

/** Espera a que una página del sitio publicado contenga (o deje de contener) un texto. */
export async function esperarSitio(url, texto, { presente = true, timeoutMs = 20_000 } = {}) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    const html = await (await fetch(url)).text();
    if (html.includes(texto) === presente) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`${url} ${presente ? "no muestra" : "sigue mostrando"} «${texto}»`);
}
