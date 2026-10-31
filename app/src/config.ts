/**
 * Configuración solo por variables de entorno, validada al arrancar (AGENTS.md §20): si falta una
 * obligatoria o no es válida, el proceso termina con un mensaje claro. Ningún secreto tiene valor por
 * defecto. Los nombres son los de la plataforma (README.md).
 */
import { z } from "zod";

const flag = z.enum(["true", "false"]).transform((value) => value === "true");
const port = z.coerce.number().int().min(1).max(65535);
const nonEmpty = z.string().trim().min(1);

const databaseSchema = z.object({
  POSTGRES_HOST: nonEmpty.default("postgres"),
  POSTGRES_PORT: port.default(5432),
  POSTGRES_DB: nonEmpty,
  /** Rol propio de la app, sin superusuario (§26). */
  APP_DB_USER: z.string().regex(/^[a-z_][a-z0-9_]{0,62}$/, "nombre de rol inválido"),
  APP_DB_PASSWORD: z.string().min(16, "al menos 16 caracteres"),
});

const serviceSchema = databaseSchema.extend({
  PORT: port.default(3000),
  SITE_URL: z.url({ protocol: /^https?$/ }).transform((value) => new URL(value).origin),
  /** Origen del editor (admin.<dominio>): el único desde el que se aceptan escrituras (CSRF, §24). */
  ADMIN_URL: z.url({ protocol: /^https?$/ }).transform((value) => new URL(value).origin),
  SMTP_HOST: nonEmpty,
  SMTP_PORT: port,
  SMTP_SECURE: flag,
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  MAIL_FROM: nonEmpty,
  /** Volúmenes del compose: el HTML generado (lo sirve `web`) y las imágenes subidas. */
  SITE_DIR: nonEmpty.default("/srv/site"),
  UPLOADS_DIR: nonEmpty.default("/srv/uploads"),
  /** Build de la web dentro de la imagen. */
  WEB_DIST: nonEmpty.default("/app/web/dist"),
  /** Solo para el entorno local de pruebas por HTTP; en producción siempre `true`. */
  SESSION_COOKIE_SECURE: flag.default(true),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

const migrateSchema = databaseSchema.extend({
  /** Superusuario: solo para crear el rol de la app y su esquema (§26). */
  POSTGRES_USER: nonEmpty,
  POSTGRES_PASSWORD: nonEmpty,
});

export type ServiceConfig = z.infer<typeof serviceSchema>;
export type DatabaseConfig = z.infer<typeof databaseSchema>;
export type MigrateConfig = z.infer<typeof migrateSchema>;

function parse<T extends z.ZodType>(schema: T, env: NodeJS.ProcessEnv): z.infer<T> {
  const result = schema.safeParse(env);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new ConfigError(`Configuración no válida:\n${problems}`);
}

export class ConfigError extends Error {}

export const loadServiceConfig = (env = process.env) => parse(serviceSchema, env);
export const loadDatabaseConfig = (env = process.env) => parse(databaseSchema, env);
export const loadMigrateConfig = (env = process.env) => parse(migrateSchema, env);
