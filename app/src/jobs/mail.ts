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
  // Un correo por trabajo (un fallo solo reintenta ese), con cuatro trabajadores: los avisos de seguridad
  // (cada inicio de sesión) no esperan detrás de otros.
  await boss.work<Mail>(MAIL_QUEUE, { batchSize: 1, localConcurrency: 4, pollingIntervalSeconds: 1 }, async (jobs) => {
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

/** Fecha y hora de la clínica, para los avisos de seguridad. */
const clinicTime = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short", timeZone: "America/Mexico_City" }).format(date);

/** Sin recuperación por correo: quien administra el sitio restablece la contraseña desde la plataforma. */
const ifNotYou = "Si no fuiste tú, avisa cuanto antes a quien administra el sitio: puede cerrar todas las sesiones y restablecer la contraseña.";

export const mails = {
  newLogin: (to: string, adminUrl: string, when: Date): Mail => ({
    to,
    subject: "Nuevo inicio de sesión en el editor de Praná",
    text: [
      "Hola:",
      "",
      `Se inició sesión con tu cuenta en el editor del sitio de Praná: Nutrición y Bienestar (${adminUrl}/) el ${clinicTime(when)}.`,
      "",
      ifNotYou,
    ].join("\n"),
  }),
  accountLocked: (to: string, minutes: number): Mail => ({
    to,
    subject: "Bloqueamos el acceso a tu cuenta del editor de Praná",
    text: [
      "Hola:",
      "",
      `Hubo varios intentos fallidos de entrar con tu cuenta del editor del sitio de Praná: Nutrición y Bienestar. Por seguridad, el acceso queda bloqueado ${minutes} minutos.`,
      "",
      "Si fuiste tú, espera y vuelve a probar. Si no, tu contraseña sigue a salvo mientras nadie la conozca; aun así, avisa a quien administra el sitio.",
    ].join("\n"),
  }),
  passwordChanged: (to: string, adminUrl: string): Mail => ({
    to,
    subject: "Tu contraseña del editor de Praná cambió",
    text: [
      "Hola:",
      "",
      `La contraseña de tu cuenta del editor del sitio de Praná: Nutrición y Bienestar (${adminUrl}/) acaba de cambiar y se cerraron todas las sesiones abiertas.`,
      "",
      ifNotYou,
    ].join("\n"),
  }),
};
