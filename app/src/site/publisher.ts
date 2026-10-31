/**
 * Publica el sitio: tras cada cambio del admin, al arrancar y cuando cambia el día en Cuautla (las
 * promociones empiezan y terminan por fecha). Las peticiones no esperan: se encola y se agrupa, y
 * nunca corren dos generaciones a la vez.
 */
import type pg from "pg";
import { loadSiteContent } from "../content/repository.ts";
import { generateSite, type Renderer } from "./generator.ts";

export function clinicToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

type Log = { info: (o: object, m: string) => void; error: (o: object, m: string) => void };

export class Publisher {
  private running: Promise<void> | null = null;
  private pending: { id: string } | null = null;
  lastDay: string | null = null;
  lastError: string | null = null;

  private pool: pg.Pool;
  private options: { webDist: string; siteDir: string; siteUrl: string; renderer: Renderer; log: Log };

  constructor(pool: pg.Pool, options: { webDist: string; siteDir: string; siteUrl: string; renderer: Renderer; log: Log }) {
    this.pool = pool;
    this.options = options;
  }

  /** Registra la petición y la atiende en segundo plano. Devuelve el id de la publicación. */
  async request(reason: string, userId: string | null) {
    const { rows: [row] } = await this.pool.query<{ id: string }>(
      "INSERT INTO site_publications (reason, requested_by) VALUES ($1, $2) RETURNING id", [reason, userId]);
    this.pending = row;
    this.kick();
    return row.id;
  }

  /** Espera a que no quede nada pendiente (pruebas y apagado ordenado). */
  async idle() {
    while (this.running) await this.running;
  }

  private kick() {
    if (this.running) return;
    this.running = this.loop().finally(() => {
      this.running = null;
      if (this.pending) this.kick();
    });
  }

  private async loop() {
    while (this.pending) {
      this.pending = null;
      const today = clinicToday();
      let started: Date | null = null;
      try {
        // Solo las peticiones anteriores a la lectura del contenido quedan cubiertas por esta generación.
        ({ rows: [{ started }] } = await this.pool.query<{ started: Date }>("SELECT clock_timestamp() AS started"));
        const content = await loadSiteContent(this.pool, today);
        const result = await generateSite({ content, ...this.options });
        await this.pool.query("UPDATE site_publications SET finished_at = now() WHERE finished_at IS NULL AND requested_at <= $1", [started]);
        this.lastDay = today;
        this.lastError = null;
        this.options.log.info({ release: result.id, pages: result.pages }, "Sitio publicado");
      } catch (error) {
        this.lastError = String(error);
        await this.pool.query(
          "UPDATE site_publications SET finished_at = now(), error = $1 WHERE finished_at IS NULL AND requested_at <= coalesce($2, now())",
          ["No se pudo generar el sitio.", started]).catch(() => {});
        this.options.log.error({ err: String(error) }, "No se pudo generar el sitio");
      }
    }
  }

  /** Cada 10 minutos: si cambió el día en Cuautla, vuelve a publicar. */
  schedule() {
    const timer = setInterval(() => {
      if (this.lastDay !== clinicToday()) void this.request("cambio-de-dia", null);
    }, 10 * 60_000);
    timer.unref();
    return () => clearInterval(timer);
  }
}

export async function lastPublication(pool: pg.Pool) {
  const { rows } = await pool.query<{ id: string; reason: string; requested_at: Date; finished_at: Date | null; error: string | null }>(
    "SELECT id, reason, requested_at, finished_at, error FROM site_publications ORDER BY requested_at DESC LIMIT 1");
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    reason: row.reason,
    requestedAt: row.requested_at.toISOString(),
    finishedAt: row.finished_at?.toISOString() ?? null,
    status: row.error ? "error" : row.finished_at ? "published" : "pending",
  };
}
