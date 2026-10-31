/**
 * Limpieza periódica en el planificador de la app (§28): sesiones, enlaces e intentos caducados, e
 * imágenes subidas que ninguna promoción usa desde hace un día (datos mínimos, §26).
 */
import type pg from "pg";
import { removeVariants } from "../content/images.ts";

type Log = { info: (o: object, m: string) => void; error: (o: object, m: string) => void };

export async function cleanUp(pool: pg.Pool, uploadsDir: string, log: Log) {
  const sessions = await pool.query("DELETE FROM admin_sessions WHERE expires_at < now() OR last_seen_at < now() - interval '1 day'");
  const tokens = await pool.query("DELETE FROM password_reset_tokens WHERE expires_at < now() - interval '1 day'");
  const attempts = await pool.query("DELETE FROM auth_attempts WHERE attempted_at < now() - interval '1 day'");
  const { rows: orphans } = await pool.query<{ id: string; widths: number[] }>(
    `DELETE FROM uploads u WHERE u.created_at < now() - interval '1 day'
        AND NOT EXISTS (SELECT 1 FROM promotions p WHERE p.image_upload_id = u.id)
      RETURNING u.id, u.widths`);
  for (const orphan of orphans) await removeVariants(uploadsDir, orphan.id, orphan.widths);
  const old = await pool.query("DELETE FROM site_publications WHERE requested_at < now() - interval '90 days'");
  log.info({ sessions: sessions.rowCount, tokens: tokens.rowCount, attempts: attempts.rowCount, uploads: orphans.length, publications: old.rowCount }, "Limpieza");
}

export function scheduleCleanUp(pool: pg.Pool, uploadsDir: string, log: Log) {
  const run = () => cleanUp(pool, uploadsDir, log).catch((error) => log.error({ err: String(error) }, "La limpieza falló"));
  const timer = setInterval(run, 6 * 60 * 60_000);
  timer.unref();
  return () => clearInterval(timer);
}
