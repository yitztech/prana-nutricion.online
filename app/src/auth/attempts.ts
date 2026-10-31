/** Límite de intentos por IP real y por cuenta (§24): 429 con Retry-After. */
import type { Db } from "../db.ts";
import { HttpProblem } from "../http/problem.ts";

type Kind = "login" | "password_reset";

export const attemptLimits: Record<Kind, { windowMinutes: number; perIp: number; perSubject: number }> = {
  login: { windowMinutes: 15, perIp: 20, perSubject: 5 },
  password_reset: { windowMinutes: 60, perIp: 5, perSubject: 3 },
};

export async function checkAttempts(db: Db, kind: Kind, ip: string, subject: string) {
  const limit = attemptLimits[kind];
  const { rows: [row] } = await db.query<{ by_ip: number; by_subject: number; retry: number | null }>(
    `WITH recent AS (
       SELECT ip, subject, attempted_at FROM auth_attempts
        WHERE kind = $1 AND attempted_at > now() - make_interval(mins => $4) AND (ip = $2::inet OR subject = $3))
     SELECT count(*) FILTER (WHERE ip = $2::inet)::int AS by_ip,
            count(*) FILTER (WHERE subject = $3)::int AS by_subject,
            ceil(extract(epoch FROM min(attempted_at) + make_interval(mins => $4) - now()))::int AS retry
       FROM recent`,
    [kind, ip, subject, limit.windowMinutes],
  );
  if (row.by_ip >= limit.perIp || row.by_subject >= limit.perSubject) {
    const retry = Math.max(row.retry ?? 60, 1);
    throw new HttpProblem(429, "too_many_attempts", "Demasiados intentos. Espera unos minutos y vuelve a probar.", undefined, { "Retry-After": String(retry) });
  }
}

export async function recordAttempt(db: Db, kind: Kind, ip: string, subject: string) {
  await db.query("INSERT INTO auth_attempts (kind, ip, subject) VALUES ($1, $2, $3)", [kind, ip, subject]);
}

export async function clearAttempts(db: Db, kind: Kind, subject: string) {
  await db.query("DELETE FROM auth_attempts WHERE kind = $1 AND subject = $2", [kind, subject]);
}
