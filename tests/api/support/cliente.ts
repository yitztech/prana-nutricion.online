/**
 * Cliente de la API real para test:api, test:endpoints y test:security (AGENTS.md §39): habla con el
 * gateway del compose de pruebas, guarda la cookie de sesión y manda el origen y la cabecera del editor.
 * Las cuentas se crean directamente en PostgreSQL (puerto de pruebas), una por escenario.
 */
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { hashPassword } from "../../../app/src/auth/passwords.ts";

export const BASE = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_PUERTO ?? "8091"}`;
export const MAILPIT = process.env.E2E_MAILPIT_URL ?? `http://127.0.0.1:${process.env.E2E_MAILPIT_PUERTO ?? "8025"}`;
export const COOKIE = process.env.E2E_COOKIE ?? "prana_sesion";
const PG_URL = process.env.TEST_PG_URL_APP ?? "postgres://postgres:ci-postgres-solo-pruebas@127.0.0.1:54329/prana";

let pool: pg.Pool | undefined;
export function db() {
  pool ??= new pg.Pool({ connectionString: PG_URL, max: 2, options: "-c search_path=prana" });
  return pool;
}
export async function cerrar() {
  await pool?.end();
  pool = undefined;
}

export type Respuesta = { status: number; headers: Headers; body: any; text: string };

type Opciones = {
  body?: unknown;
  form?: FormData;
  origin?: string | null;
  editor?: boolean;
  headers?: Record<string, string>;
};

export class Cliente {
  sesion: string | null = null;
  setCookies: string[] = [];

  async pedir(method: string, path: string, opciones: Opciones = {}): Promise<Respuesta> {
    const headers: Record<string, string> = { ...opciones.headers };
    if (opciones.origin !== null) headers.origin = opciones.origin ?? BASE;
    if (opciones.editor !== false) headers["x-requested-with"] = "prana-admin";
    if (this.sesion) headers.cookie = `${COOKIE}=${this.sesion}`;
    let body: FormData | string | undefined;
    if (opciones.form) body = opciones.form;
    else if (opciones.body !== undefined) {
      headers["content-type"] ??= "application/json";
      body = typeof opciones.body === "string" ? opciones.body : JSON.stringify(opciones.body);
    }
    const response = await fetch(new URL(path, BASE), { method, headers, body, redirect: "manual" });
    this.setCookies = response.headers.getSetCookie();
    for (const cookie of this.setCookies) {
      const [pair] = cookie.split(";");
      const [name, value] = pair.split("=");
      if (name === COOKIE) this.sesion = value || null;
    }
    const text = await response.text();
    let parsed: unknown = undefined;
    try { parsed = text ? JSON.parse(text) : undefined; } catch { /* no es JSON */ }
    return { status: response.status, headers: response.headers, body: parsed, text };
  }

  get = (path: string, o?: Opciones) => this.pedir("GET", path, o);
  post = (path: string, body?: unknown, o?: Opciones) => this.pedir("POST", path, { ...o, body });
  put = (path: string, body?: unknown, o?: Opciones) => this.pedir("PUT", path, { ...o, body });
  delete = (path: string, o?: Opciones) => this.pedir("DELETE", path, o);
}

export type Cuenta = { id: string; email: string; password: string };

/** Cuenta única por escenario: las pruebas pueden correr en paralelo y en cualquier orden. */
export async function nuevaCuenta(): Promise<Cuenta> {
  const email = `prueba-${randomUUID()}@ejemplo.mx`;
  const password = `clave-${randomBytes(9).toString("base64url")}`;
  const { rows: [row] } = await db().query<{ id: string }>(
    "INSERT INTO admin_users (email, name, password_hash) VALUES ($1, 'Persona de prueba', $2) RETURNING id",
    [email, await hashPassword(password)],
  );
  return { id: row.id, email, password };
}

export async function conSesion(cuenta?: Cuenta) {
  const c = cuenta ?? (await nuevaCuenta());
  const cliente = new Cliente();
  const r = await cliente.post("/api/auth/login", { email: c.email, password: c.password });
  if (r.status !== 200) throw new Error(`login ${r.status}: ${r.text}`);
  return { cliente, cuenta: c };
}

/** Los intentos fallidos de un escenario no deben bloquear a los siguientes (límite por IP). */
export async function limpiarIntentos(...correos: string[]) {
  await db().query("DELETE FROM auth_attempts WHERE subject = ANY($1)", [correos]);
}

/** Último correo enviado a una dirección (Mailpit), esperando a que llegue. */
export async function correoPara(direccion: string, asunto?: RegExp, timeoutMs = 15_000) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${direccion}"`)}`);
    const { messages = [] } = (await r.json()) as { messages?: { ID: string; Subject: string }[] };
    const mensaje = messages.find((m) => !asunto || asunto.test(m.Subject));
    if (mensaje) {
      const detalle = await fetch(`${MAILPIT}/api/v1/message/${mensaje.ID}`);
      return (await detalle.json()) as { Subject: string; Text: string; HTML: string };
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`No llegó ningún correo para ${direccion}`);
}

/** Documento legal mínimo válido (subconjunto de Tiptap). */
export const documento = (texto: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: texto }] }],
});
