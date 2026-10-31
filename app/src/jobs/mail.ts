/**
 * Correo por el SMTP de la plataforma (§28): se encola en PostgreSQL y lo envía un trabajador con
 * reintentos y espera exponencial. La petición que lo pide no espera al SMTP.
 */
import nodemailer from "nodemailer";
import { PgBoss } from "pg-boss";
import type { ServiceConfig } from "../config.ts";
import { QUEUE_SCHEMA } from "../migrate.ts";

export const MAIL_QUEUE = "correo";

export type Mail = { to: string; subject: string; text: string };

export type Mailer = { send(mail: Mail): Promise<void> };

export function createBoss(config: ServiceConfig) {
  return new PgBoss({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.APP_DB_USER,
    password: config.APP_DB_PASSWORD,
    schema: QUEUE_SCHEMA,
    // La instala el servicio migrate: el rol de la app no puede crear esquemas
    migrate: false,
    max: 2,
    application_name: "prana-cola",
  });
}

export async function startMailWorker(boss: PgBoss, config: ServiceConfig, log: { error: (o: object, m: string) => void; info: (o: object, m: string) => void }) {
  await boss.createQueue(MAIL_QUEUE, { retryLimit: 6, retryDelay: 30, retryBackoff: true, expireInSeconds: 120 }).catch(() => {});
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } : undefined,
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 30_000,
  });
  await boss.work<Mail>(MAIL_QUEUE, async (jobs) => {
    for (const job of jobs) {
      try {
        await transport.sendMail({ from: config.MAIL_FROM, to: job.data.to, subject: job.data.subject, text: job.data.text });
        log.info({ job: job.id, to: maskEmail(job.data.to) }, "Correo enviado");
      } catch (error) {
        // Se reintenta; el error de terceros no se reenvía a nadie (§22).
        log.error({ job: job.id, to: maskEmail(job.data.to), err: String(error) }, "Fallo al enviar un correo");
        throw error;
      }
    }
  });
}

export function queueMailer(boss: PgBoss): Mailer {
  return {
    async send(mail) {
      await boss.send(MAIL_QUEUE, mail, { retryLimit: 6, retryDelay: 30, retryBackoff: true });
    },
  };
}

/** a***@dominio.mx: los logs nunca llevan el correo completo (§30). */
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  return `${user?.slice(0, 1) ?? ""}***@${domain ?? ""}`;
}

export const mails = {
  passwordReset: (to: string, link: string): Mail => ({
    to,
    subject: "Restablece tu contraseña del editor de Praná",
    text: [
      "Hola:",
      "",
      "Recibimos una solicitud para restablecer la contraseña del editor del sitio de Praná: Nutrición y Bienestar.",
      "Abre este enlace en la próxima hora para elegir una nueva:",
      "",
      link,
      "",
      "Si no lo pediste, ignora este correo: tu contraseña no cambia.",
    ].join("\n"),
  }),
  passwordChanged: (to: string, siteUrl: string): Mail => ({
    to,
    subject: "Tu contraseña del editor de Praná cambió",
    text: [
      "Hola:",
      "",
      "La contraseña de tu cuenta del editor del sitio de Praná: Nutrición y Bienestar acaba de cambiar y se cerraron todas las sesiones abiertas.",
      "",
      `Si no fuiste tú, restablécela desde ${siteUrl}/admin/ y avisa a quien administra el sitio.`,
    ].join("\n"),
  }),
};
