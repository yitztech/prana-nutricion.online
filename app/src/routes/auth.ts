import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, passwordChangeSchema } from "#shared/schemas.ts";
import { attemptLimits, checkAttempts, clearAttempts, recordAttempt, shouldNotifyLock } from "../auth/attempts.ts";
import { decoyHash, hashPassword, needsRehash, verifyPassword } from "../auth/passwords.ts";
import { isStrongPassword, WEAK_PASSWORD_MESSAGE } from "../auth/strength.ts";
import { ABSOLUTE_HOURS, cookieName, createSession, deleteSession, deleteUserSessions, findSession } from "../auth/sessions.ts";
import { audit } from "../content/repository.ts";
import { transaction } from "../db.ts";
import { HttpProblem, validationFailed } from "../http/problem.ts";
import { credentialsLimit } from "../http/rate-limit.ts";
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
    // Strict: el panel no recibe navegaciones de otros sitios que necesiten la sesión.
    sameSite: "strict",
    maxAge: ABSOLUTE_HOURS * 3600,
  });
}

export const authRoutes = (deps: Deps) => async (app: FastifyInstance) => {
  const { pool, config, mailer } = deps;
  const name = cookieName(config.SESSION_COOKIE_SECURE);
  app.addHook("preHandler", sessionLoader(deps));

  app.post("/login", { config: { rateLimit: credentialsLimit } }, async (request, reply) => {
    const input = parse(loginSchema, request.body);
    await checkAttempts(pool, "login", request.realIp, input.email);
    const { rows: [user] } = await pool.query<{ id: string; email: string; name: string; password_hash: string; must_change_password: boolean }>(
      "SELECT id, email, name, password_hash, must_change_password FROM admin_users WHERE email = $1", [input.email]);
    // Mismo trabajo y misma respuesta exista o no la cuenta (§22).
    const valid = await verifyPassword(user?.password_hash ?? decoyHash, input.password);
    if (!user || !valid) {
      const { locked } = await recordAttempt(pool, "login", request.realIp, input.email);
      // El aviso de bloqueo va al dueño de la cuenta, nunca a quien intenta entrar.
      if (locked && user && (await shouldNotifyLock(pool, user.id))) {
        await mailer.send(mails.accountLocked(user.email, attemptLimits.login.windowMinutes));
        await audit(pool, user.id, "login_locked", "admin_user", user.id);
      }
      throw new HttpProblem(401, "invalid_credentials", "El correo o la contraseña no son correctos.");
    }
    await clearAttempts(pool, "login", request.realIp, input.email);
    if (needsRehash(user.password_hash)) {
      await pool.query("UPDATE admin_users SET password_hash = $2, updated_at = now() WHERE id = $1", [user.id, await hashPassword(input.password)]);
    }
    // La sesión anterior de este navegador no se reutiliza: identificador nuevo al iniciar sesión.
    const previous = request.cookies[name];
    if (previous) await deleteSession(pool, previous);
    setSessionCookie(deps, reply, await createSession(pool, user.id));
    await audit(pool, user.id, "login", "admin_user", user.id);
    await mailer.send(mails.newLogin(user.email, config.ADMIN_URL, new Date()));
    return { user: { id: user.id, email: user.email, name: user.name, mustChangePassword: user.must_change_password } };
  });

  app.post("/logout", async (request, reply) => {
    const token = request.cookies[name];
    if (token) await deleteSession(pool, token);
    if (request.user) await audit(pool, request.user.id, "logout", "admin_user", request.user.id);
    reply.clearCookie(name, { path: "/", secure: config.SESSION_COOKIE_SECURE, httpOnly: true, sameSite: "strict" });
    return reply.code(204).send();
  });

  app.get("/session", async (request, reply) => {
    if (requireUser(request, reply)) return reply;
    return { user: request.user };
  });

  app.post("/password", { config: { rateLimit: credentialsLimit } }, async (request, reply) => {
    if (requireUser(request, reply)) return reply;
    const input = parse(passwordChangeSchema, request.body);
    const user = request.user!;
    // Adivinar la contraseña actual cuenta como un intento de inicio de sesión: mismo límite por IP y cuenta (§24).
    await checkAttempts(pool, "login", request.realIp, user.email);
    const { rows: [row] } = await pool.query<{ password_hash: string }>("SELECT password_hash FROM admin_users WHERE id = $1", [user.id]);
    if (!row || !(await verifyPassword(row.password_hash, input.currentPassword))) {
      await recordAttempt(pool, "login", request.realIp, user.email);
      throw validationFailed([{ field: "currentPassword", code: "invalid_credentials", message: "La contraseña actual no es correcta." }]);
    }
    await clearAttempts(pool, "login", request.realIp, user.email);
    if (input.newPassword === input.currentPassword) {
      throw validationFailed([{ field: "newPassword", code: "password_reused", message: "Elige una contraseña distinta de la actual." }]);
    }
    if (!(await isStrongPassword(input.newPassword, user))) {
      throw validationFailed([{ field: "newPassword", code: "weak_password", message: WEAK_PASSWORD_MESSAGE }]);
    }
    const passwordHash = await hashPassword(input.newPassword);
    const token = await transaction(pool, async (client) => {
      await client.query("UPDATE admin_users SET password_hash = $2, must_change_password = false, password_changed_at = now(), updated_at = now() WHERE id = $1",
        [user.id, passwordHash]);
      await deleteUserSessions(client, user.id);
      await audit(client, user.id, "password_changed", "admin_user", user.id);
      return createSession(client, user.id);
    });
    setSessionCookie(deps, reply, token);
    await mailer.send(mails.passwordChanged(user.email, config.ADMIN_URL));
    return reply.code(204).send();
  });
};
