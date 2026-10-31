/**
 * Servicio `migrate` del compose (§27): se ejecuta antes de la API y, si falla, la API no arranca.
 * 1. Como superusuario: crea (o actualiza la contraseña de) el rol de la app, sin privilegios
 *    especiales, y le da sus esquemas.
 * 2. Como rol de la app: aplica las migraciones pendientes, con bloqueo (no corren dos a la vez).
 * 3. Como rol de la app: instala o actualiza la cola (pg-boss), con un CREATE temporal en la base.
 * 4. Si el catálogo está vacío, carga el contenido inicial (shared/seed).
 */
import { join } from "node:path";
import { runner } from "node-pg-migrate";
import pg from "pg";
import { PgBoss } from "pg-boss";
import { loadMigrateConfig, type MigrateConfig } from "./config.ts";
import { SCHEMA } from "./db.ts";
import { seedIfEmpty } from "./content/seed.ts";
import { createPool } from "./db.ts";

export const MIGRATIONS_DIR = join(import.meta.dirname, "..", "migrations");
/** Esquema de la cola (pg-boss): también es del rol de la app. */
export const QUEUE_SCHEMA = "pgboss";

export async function prepareRole(config: MigrateConfig) {
  const admin = new pg.Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
  });
  await admin.connect();
  try {
    const role = pg.escapeIdentifier(config.APP_DB_USER);
    const password = pg.escapeLiteral(config.APP_DB_PASSWORD);
    const database = pg.escapeIdentifier(config.POSTGRES_DB);
    await admin.query("SELECT pg_advisory_lock(hashtext('prana-migrate-role'))");
    const { rowCount } = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [config.APP_DB_USER]);
    const attributes = "LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT";
    await admin.query(rowCount ? `ALTER ROLE ${role} ${attributes} PASSWORD ${password}` : `CREATE ROLE ${role} ${attributes} PASSWORD ${password}`);
    await admin.query(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC`);
    await admin.query(`GRANT CONNECT, TEMPORARY ON DATABASE ${database} TO ${role}`);
    await admin.query("REVOKE ALL ON SCHEMA public FROM PUBLIC");
    for (const schema of [SCHEMA, QUEUE_SCHEMA]) {
      await admin.query(`CREATE SCHEMA IF NOT EXISTS ${pg.escapeIdentifier(schema)} AUTHORIZATION ${role}`);
      await admin.query(`ALTER SCHEMA ${pg.escapeIdentifier(schema)} OWNER TO ${role}`);
    }
    await admin.query(`ALTER ROLE ${role} SET search_path = ${pg.escapeIdentifier(SCHEMA)}`);
    await admin.query(`ALTER ROLE ${role} SET statement_timeout = '15s'`);
  } finally {
    await admin.end();
  }
}

/**
 * pg-boss ejecuta `CREATE SCHEMA IF NOT EXISTS`, y PostgreSQL exige CREATE en la base aunque el
 * esquema ya exista. El rol de la app no lo tiene: se le da solo mientras se instala la cola, aquí,
 * y la app arranca con `migrate: false` (no hace DDL).
 */
async function installQueue(config: MigrateConfig) {
  const admin = new pg.Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
  });
  await admin.connect();
  const role = pg.escapeIdentifier(config.APP_DB_USER);
  const database = pg.escapeIdentifier(config.POSTGRES_DB);
  try {
    await admin.query(`GRANT CREATE ON DATABASE ${database} TO ${role}`);
    const boss = new PgBoss({
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      database: config.POSTGRES_DB,
      user: config.APP_DB_USER,
      password: config.APP_DB_PASSWORD,
      schema: QUEUE_SCHEMA,
      max: 1,
      supervise: false,
      schedule: false,
      application_name: "prana-migrate",
    });
    await boss.start();
    await boss.stop({ graceful: false });
  } finally {
    await admin.query(`REVOKE CREATE ON DATABASE ${database} FROM ${role}`);
    await admin.end();
  }
}

export async function migrate(config: MigrateConfig, log: (message: string) => void = console.log) {
  await prepareRole(config);
  const client = new pg.Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.APP_DB_USER,
    password: config.APP_DB_PASSWORD,
  });
  await client.connect();
  try {
    const applied = await runner({
      dbClient: client,
      dir: MIGRATIONS_DIR,
      direction: "up",
      migrationsTable: "pgmigrations",
      schema: SCHEMA,
      createSchema: false,
      checkOrder: true,
      singleTransaction: true,
      log: () => {},
    });
    log(applied.length ? `Migraciones aplicadas: ${applied.map((m) => m.name).join(", ")}` : "Migraciones al día.");
  } finally {
    await client.end();
  }
  await installQueue(config);
  const pool = createPool(config, { max: 1 });
  try {
    if (await seedIfEmpty(pool)) log("Contenido inicial cargado.");
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  try {
    await migrate(loadMigrateConfig());
  } catch (error) {
    console.error(JSON.stringify({ time: new Date().toISOString(), level: "error", msg: "La migración falló", err: String(error) }));
    process.exit(1);
  }
}
