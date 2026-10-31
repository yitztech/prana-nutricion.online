// Entorno de los escenarios: a qué URL se prueba y a qué ritmo (AGENTS.md §37).
//   E2E_BASE_URL   la web (por defecto, el compose local: compose.ci.yml)
//   E2E_ADMIN_URL  el editor, en su propio dominio (por defecto, http://localhost:<puerto> en local y
//                  admin.<dominio de la web> fuera)
//   E2E_SLOWMO, E2E_TECLADO, E2E_PAUSA   ritmo humano en milisegundos (npm run e2e:ver)
const num = (v) => Number(v ?? 0) || 0;

export const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${process.env.E2E_PUERTO || 8091}`;
export const local = /^http:\/\/(127\.0\.0\.1|localhost)/.test(baseURL);
// En local, localhost y 127.0.0.1 son hosts distintos para el navegador (y para sus cookies), como
// admin.prana-nutricion.online y prana-nutricion.online en producción.
export const adminURL = process.env.E2E_ADMIN_URL
  || (local ? `http://localhost:${process.env.E2E_PUERTO || 8091}` : `${new URL(baseURL).protocol}//admin.${new URL(baseURL).host}`);
/** Cookie de sesión del editor: con https lleva el prefijo __Host- (app/src/auth/sessions.ts). */
export const cookieSesion = adminURL.startsWith("https:") ? "__Host-prana_sesion" : "prana_sesion";
/** PostgreSQL del compose de pruebas (compose.ci.yml), para crear las cuentas de los escenarios. */
export const pgURL = process.env.TEST_PG_URL_APP ?? "postgres://postgres:ci-postgres-solo-pruebas@127.0.0.1:54329/prana";
export const slowMo = num(process.env.E2E_SLOWMO);
export const teclado = num(process.env.E2E_TECLADO);
export const pausa = num(process.env.E2E_PAUSA);
export const lento = slowMo > 0 || teclado > 0 || pausa > 0;
