/**
 * Base temporal para test:db (AGENTS.md §39): se crea en el PostgreSQL local (compose de pruebas o
 * servicio del CI), se migra desde cero como el rol de la app y se borra al terminar.
 *   TEST_PG_URL  superusuario; por defecto el del compose de pruebas (127.0.0.1:54329)
 */
import { randomBytes } from "node:crypto";
import pg from "pg";
import type { MigrateConfig } from "../../app/src/config.ts";
import { createPool } from "../../app/src/db.ts";
import { migrate } from "../../app/src/migrate.ts";

const url = new URL(process.env.TEST_PG_URL ?? "postgres://postgres:ci-postgres-solo-pruebas@127.0.0.1:54329/postgres");

export type TempDatabase = {
  config: MigrateConfig;
  /** Conexión como el rol de la app (search_path prana). */
  app: pg.Pool;
  /** Conexión como superusuario a la base temporal. */
  admin: pg.Pool;
  drop(): Promise<void>;
};

const superuser = (database: string) =>
  new pg.Pool({ host: url.hostname, port: Number(url.port || 5432), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database, max: 2 });

export async function createTempDatabase(): Promise<TempDatabase> {
  const suffix = randomBytes(4).toString("hex");
  const database = `prana_test_${suffix}`;
  const role = `prana_test_${suffix}`;
  const root = superuser(url.pathname.slice(1) || "postgres");
  await root.query(`CREATE DATABASE ${pg.escapeIdentifier(database)}`);
  const config: MigrateConfig = {
    POSTGRES_HOST: url.hostname,
    POSTGRES_PORT: Number(url.port || 5432),
    POSTGRES_DB: database,
    POSTGRES_USER: decodeURIComponent(url.username),
    POSTGRES_PASSWORD: decodeURIComponent(url.password),
    APP_DB_USER: role,
    APP_DB_PASSWORD: randomBytes(18).toString("base64url"),
  };
  await migrate(config, () => {});
  const app = createPool(config, { max: 4 });
  const admin = superuser(database);
  await admin.query(`SET search_path = prana`);
  return {
    config,
    app,
    admin,
    async drop() {
      await app.end();
      await admin.end();
      await root.query(`DROP DATABASE ${pg.escapeIdentifier(database)} WITH (FORCE)`);
      await root.query(`DROP ROLE IF EXISTS ${pg.escapeIdentifier(role)}`);
      await root.end();
    },
  };
}
