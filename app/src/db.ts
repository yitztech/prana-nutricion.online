import pg from "pg";
import type { DatabaseConfig } from "./config.ts";

/** Esquema propio de la app; el rol de la app es su dueño (§26). */
export const SCHEMA = "prana";

/** Pool acotado y con `statement_timeout`: el servidor comparte memoria con otros clientes. */
export function createPool(config: DatabaseConfig, options: { max?: number; user?: string; password?: string } = {}) {
  return new pg.Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: options.user ?? config.APP_DB_USER,
    password: options.password ?? config.APP_DB_PASSWORD,
    max: options.max ?? 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
    options: `-c search_path=${SCHEMA}`,
    application_name: "prana-app",
  });
}

export type Db = pg.Pool | pg.PoolClient;

/** Escrituras de varios pasos en una transacción (§26). */
export async function transaction<T>(pool: pg.Pool, work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
