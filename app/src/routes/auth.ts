import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, passwordChangeSchema, passwordResetRequestSchema, passwordResetSchema } from "#shared/schemas.ts";
import { checkAttempts, clearAttempts, recordAttempt } from "../auth/attempts.ts";
import { decoyHash, hashPassword, verifyPassword } from "../auth/passwords.ts";
import { ABSOLUTE_HOURS, cookieName, createSession, deleteSession, deleteUserSessions, findSession } from "../auth/sessions.ts";
import { hashToken, newToken } from "../auth/tokens.ts";
import { audit } from "../content/repository.ts";
import { transaction } from "../db.ts";
import { HttpProblem, validationFailed } from "../http/problem.ts";
import { parse } from "../http/validate.ts";
import { mails } from "../jobs/mail.ts";
import { requireUser, type Deps } from "../server.ts";

export function sessionLoader(deps: Deps) {
  const name = cookieName(deps.config.SESSION_COOKIE_SECURE);
  return async (request: FastifyRequest) => {
    const token = request.cookies[name];
    request.user = token ? await findSession(deps.pool, token) : null;
  };
}

export function setSessionCookie(deps: Deps, reply: FastifyReply, token: string) {
  reply.setCookie(cookieName(deps.config.SESSION_COOKIE_SECURE), token, {
    path: "/",
    httpOnly: true,
    secure: deps.config.SESSION_COOKIE_SECURE,
    sameSite: "lax",
    maxAge: ABSOLUTE_HOURS * 3600,
  });
}

export const authRoutes = (deps: Deps) => async (app: FastifyInstance) => {
  const { pool, config, mailer } = deps;
  const name = cookieName(config.SESSION_COOKIE_SECURE);
  app.addHook("preHandler", sessionLoader(deps));

  app.post("/login", async (request, reply) => {
    const input = parse(loginSchema, request.body);
    await checkAttempts(pool, "login", request.realIp, input.email);
    const { rows: [user] } = await pool.query<{ id: string; email: string; name: string; password_hash: string }>(
      "SELECT id, email, name, password_hash FROM admin_users WHERE email = $1", [input.email]);
    // Mismo trabajo y misma respuesta exista o no la cuenta (§22).
    const valid = await verifyPassword(user?.password_hash ?? decoyHash, input.password);
    if (!user || !valid) {
      await recordAttempt(pool, "login", request.realIp, input.email);
      throw new HttpProblem(401, "invalid_credentials", "El correo o la contraseña no son correctos.");
    }
    await clearAttempts(pool, "login", input.email);
    // La sesión anterior de este navegador no se reutiliza: identificador nuevo al iniciar sesión.
    const previous = request.cookies[name];
    if (previous) await deleteSession(pool, previous);
    setSessionCookie(deps, reply, await createSession(pool, user.id));
    await audit(pool, user.id, "login", "admin_user", user.id);
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post("/logout", async (request, reply) => {
    const token = request.cookies[name];
    if (token) await deleteSession(pool, token);
    if (request.user) await audit(pool, request.user.id, "logout", "admin_user", request.user.id);
    reply.clearCookie(name, { path: "/", secure: config.SESSION_COOKIE_SECURE, httpOnly: true, sameSite: "lax" });
    return reply.code(204).send();
  });

  app.get("/session", async (request, reply) => {
    if (requireUser(request, reply)) return reply;
    return { user: request.user };
  });

  app.post("/password-reset", async (request, reply) => {
    const input = parse(passwordResetRequestSchema, request.body);
    await checkAttempts(pool, "password_reset", request.realIp, input.email);
    await recordAttempt(pool, "password_reset", request.realIp, input.email);
    const { rows: [user] } = await pool.query<{ id: string; email: string }>("SELECT id, email FROM admin_users WHERE email = $1", [input.email]);
    if (user) {
      const { token, hash } = newToken();
      await pool.query(
        "INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '1 hour')", [hash, user.id]);
      // El token va en el fragmento: no llega al servidor ni a los logs al abrir el enlace.
      await mailer.send(mails.passwordReset(user.email, `${config.SITE_URL}/admin/restablecer#token=${token}`));
      await audit(pool, user.id, "password_reset_requested", "admin_user", user.id);
    }
    return reply.code(202).send({ detail: "Si el correo tiene una cuenta, te enviamos un enlace para restablecer la contraseña." });
  });

  app.post("/password-reset/confirm", async (request, reply) => {
    const input = parse(passwordResetSchema, request.body);
    const passwordHash = await hashPassword(input.password);
    const user = await transaction(pool, async (client) => {
      const { rows: [row] } = await client.query<{ user_id: string; email: string }>(
        `SELECT t.user_id, u.email FROM password_reset_tokens t JOIN admin_users u ON u.id = t.user_id
          WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now() FOR UPDATE OF t`, [hashToken(input.token)]);
      if (!row) return null;
      await client.query("UPDATE admin_users SET password_hash = $2, password_changed_at = now(), updated_at = now() WHERE id = $1", [row.user_id, passwordHash]);
      // Se invalidan este y cualquier otro enlace pendiente, y se cierran todas las sesiones.
      await client.query("UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [row.user_id]);
      await deleteUserSessions(client, row.user_id);
      await audit(client, row.user_id, "password_reset", "admin_user", row.user_id);
      return row;
    });
    if (!user) throw validationFailed([{ field: "token", code: "invalid_token", message: "El enlace no es válido o ha caducado. Pide uno nuevo." }]);
    await mailer.send(mails.passwordChanged(user.email, config.SITE_URL));
    return reply.code(204).send();
  });

  app.post("/password", async (request, reply) => {
    if (requireUser(request, reply)) return reply;
    const input = parse(passwordChangeSchema, request.body);
    const user = request.user!;
    const { rows: [row] } = await pool.query<{ password_hash: string }>("SELECT password_hash FROM admin_users WHERE id = $1", [user.id]);
    if (!row || !(await verifyPassword(row.password_hash, input.currentPassword))) {
      throw validationFailed([{ field: "currentPassword", code: "invalid_credentials", message: "La contraseña actual no es correcta." }]);
    }
    const passwordHash = await hashPassword(input.newPassword);
    const token = await transaction(pool, async (client) => {
      await client.query("UPDATE admin_users SET password_hash = $2, password_changed_at = now(), updated_at = now() WHERE id = $1", [user.id, passwordHash]);
      await deleteUserSessions(client, user.id);
      await audit(client, user.id, "password_changed", "admin_user", user.id);
      return createSession(client, user.id);
    });
    setSessionCookie(deps, reply, token);
    await mailer.send(mails.passwordChanged(user.email, config.SITE_URL));
    return reply.code(204).send();
  });
};
