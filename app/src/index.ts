/**
 * Arranque del servicio. Apagado ordenado con SIGTERM en menos de 10 s (§20): deja de aceptar
 * conexiones, termina las peticiones y la publicación en curso, para la cola y cierra la base de datos.
 */
import { ConfigError, loadServiceConfig } from "./config.ts";
import { createPool } from "./db.ts";
import { scheduleCleanUp } from "./jobs/maintenance.ts";
import { createBoss, queueMailer, startMailWorker } from "./jobs/mail.ts";
import { buildServer } from "./server.ts";
import { loadRenderer } from "./site/generator.ts";
import { Publisher } from "./site/publisher.ts";

let config;
try {
  config = loadServiceConfig();
} catch (error) {
  console.error(JSON.stringify({ time: new Date().toISOString(), level: "error", msg: error instanceof ConfigError ? error.message : String(error) }));
  process.exit(1);
}
const extraOrigins = (process.env.EXTRA_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);

const pool = createPool(config);
const boss = createBoss(config);
const renderer = await loadRenderer(config.WEB_DIST);
let app: Awaited<ReturnType<typeof buildServer>>;
const publisher = new Publisher(pool, {
  webDist: config.WEB_DIST,
  siteDir: config.SITE_DIR,
  siteUrl: config.SITE_URL,
  renderer,
  log: { info: (o, m) => app?.log.info(o, m), error: (o, m) => app?.log.error(o, m) },
});
app = await buildServer({ config: { ...config, extraOrigins }, pool, mailer: queueMailer(boss), publisher });

boss.on("error", (error) => app.log.error({ err: String(error) }, "Error de la cola"));
await boss.start();
await startMailWorker(boss, config, app.log);

// El sitio se publica al arrancar: una imagen nueva trae un build nuevo de la web.
await publisher.request("arranque", null);
await publisher.idle();
const stopDaily = publisher.schedule();
const stopCleanUp = scheduleCleanUp(pool, config.UPLOADS_DIR, app.log);

await app.listen({ host: "0.0.0.0", port: config.PORT });

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, "Apagando");
  const force = setTimeout(() => process.exit(1), 9_000);
  force.unref();
  stopDaily();
  stopCleanUp();
  try {
    await app.close();
    await publisher.idle();
    await boss.stop({ graceful: true, timeout: 5_000 });
    await pool.end();
    process.exit(0);
  } catch (error) {
    app.log.error({ err: String(error) }, "Apagado con errores");
    process.exit(1);
  }
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
