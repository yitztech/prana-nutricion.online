/**
 * Sesiones del admin (§24): cookie `__Host-` HttpOnly, Secure y SameSite=Lax, con un identificador
 * aleatorio guardado como hash. Caduca tras 2 horas sin uso y, en todo caso, a las 12 horas.
 */
import type { Db } from "../db.ts";
import { hashToken, newToken } from "./tokens.ts";

export const IDLE_MINUTES = 120;
export const ABSOLUTE_HOURS = 12;

export function cookieName(secure: boolean) {
  // `__Host-` exige Secure; en el entorno local de pruebas por HTTP se usa el nombre sin prefijo.
  return secure ? "__Host-prana_sesion" : "prana_sesion";
}

export type SessionUser = { id: string; email: string; name: string };

export async function createSession(db: Db, userId: string) {
  const { token, hash } = newToken();
  await db.query(
    "INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(hours => $3))",
    [hash, userId, ABSOLUTE_HOURS],
  );
  return token;
}

export async function findSession(db: Db, token: string): Promise<SessionUser | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { rows } = await db.query<SessionUser & { stale: boolean }>(
    `UPDATE admin_sessions s
        SET last_seen_at = CASE WHEN s.last_seen_at < now() - interval '1 minute' THEN now() ELSE s.last_seen_at END
       FROM admin_users u
      WHERE s.token_hash = $1 AND u.id = s.user_id
        AND s.expires_at > now() AND s.last_seen_at > now() - make_interval(mins => $2)
      RETURNING u.id, u.email, u.name`,
    [hashToken(token), IDLE_MINUTES],
  );
  return rows[0] ?? null;
}

export async function deleteSession(db: Db, token: string) {
  await db.query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function deleteUserSessions(db: Db, userId: string) {
  await db.query("DELETE FROM admin_sessions WHERE user_id = $1", [userId]);
}
