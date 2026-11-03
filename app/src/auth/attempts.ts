/**
 * Límite de intentos por IP real y por cuenta (§24): 429 con Retry-After.
 *
 * Una cuenta se bloquea para la IP desde la que fallan, no para todas: quien conoce el correo no puede
 * dejar fuera a su dueño fallando a propósito desde otra red. Contra un ataque repartido entre muchas IPs,
 * la cuenta se bloquea para todas con un umbral mucho más alto.
 */
import type { Db } from "../db.ts";
import { HttpProblem } from "../http/problem.ts";

type Kind = "login";

export const attemptLimits: Record<Kind, { windowMinutes: number; perIp: number; perSubjectIp: number; perSubject: number }> = {
  login: { windowMinutes: 15, perIp: 20, perSubjectIp: 5, perSubject: 50 },
};

export async function checkAttempts(db: Db, kind: Kind, ip: string, subject: string) {
  const limit = attemptLimits[kind];
  const { rows: [row] } = await db.query<{ by_ip: number; by_pair: number; by_subject: number; retry_ip: number | null; retry_pair: number | null; retry_subject: number | null }>(
    `WITH recent AS (
       SELECT ip, subject, attempted_at FROM auth_attempts
        WHERE kind = $1 AND attempted_at > now() - make_interval(mins => $4) AND (ip = $2::inet OR subject = $3)),
     expiry AS (SELECT ip, subject, ceil(extract(epoch FROM attempted_at + make_interval(mins => $4) - now()))::int AS left_s FROM recent)
     SELECT count(*) FILTER (WHERE ip = $2::inet)::int AS by_ip,
            count(*) FILTER (WHERE ip = $2::inet AND subject = $3)::int AS by_pair,
            count(*) FILTER (WHERE subject = $3)::int AS by_subject,
            min(left_s) FILTER (WHERE ip = $2::inet) AS retry_ip,
            min(left_s) FILTER (WHERE ip = $2::inet AND subject = $3) AS retry_pair,
            min(left_s) FILTER (WHERE subject = $3) AS retry_subject
       FROM expiry`,
    [kind, ip, subject, limit.windowMinutes],
  );
  const reached = [
    row.by_ip >= limit.perIp ? row.retry_ip : null,
    row.by_pair >= limit.perSubjectIp ? row.retry_pair : null,
    row.by_subject >= limit.perSubject ? row.retry_subject : null,
  ].filter((value): value is number => value !== null);
  if (reached.length) {
    const retry = Math.max(...reached, 1);
    throw new HttpProblem(429, "too_many_attempts", "Demasiados intentos. Espera unos minutos y vuelve a probar.", undefined, { "Retry-After": String(retry) });
  }
}

/** Registra un intento fallido y dice si con él la cuenta queda bloqueada (para avisar a su dueño). */
export async function recordAttempt(db: Db, kind: Kind, ip: string, subject: string) {
  const limit = attemptLimits[kind];
  const { rows: [row] } = await db.query<{ by_pair: number; by_subject: number }>(
    `WITH inserted AS (INSERT INTO auth_attempts (kind, ip, subject) VALUES ($1, $2, $3) RETURNING 1)
     SELECT count(*) FILTER (WHERE ip = $2::inet)::int + 1 AS by_pair, count(*)::int + 1 AS by_subject FROM auth_attempts
      WHERE kind = $1 AND subject = $3 AND attempted_at > now() - make_interval(mins => $4)`,
    [kind, ip, subject, limit.windowMinutes],
  );
  return { locked: row.by_pair === limit.perSubjectIp || row.by_subject === limit.perSubject };
}

/** Tras entrar bien desde una IP, se olvidan sus fallos; los de otras IPs siguen contando. */
export async function clearAttempts(db: Db, kind: Kind, ip: string, subject: string) {
  await db.query("DELETE FROM auth_attempts WHERE kind = $1 AND subject = $2 AND ip = $3::inet", [kind, subject, ip]);
}

/** Un aviso de bloqueo por cuenta y hora como máximo: fallar a propósito no llena el buzón de su dueño. */
export async function shouldNotifyLock(db: Db, userId: string) {
  const { rowCount } = await db.query(
    "SELECT 1 FROM audit_log WHERE user_id = $1 AND action = 'login_locked' AND created_at > now() - interval '1 hour' LIMIT 1", [userId]);
  return !rowCount;
}
