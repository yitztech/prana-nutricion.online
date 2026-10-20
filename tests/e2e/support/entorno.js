// Entorno de los escenarios: a qué URL se prueba y a qué ritmo (AGENTS.md §37).
//   E2E_BASE_URL   la web (por defecto, el compose local: compose.ci.yml)
//   E2E_SLOWMO, E2E_TECLADO, E2E_PAUSA   ritmo humano en milisegundos (npm run e2e:ver)
const num = (v) => Number(v ?? 0) || 0;

export const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${process.env.E2E_PUERTO || 8091}`;
export const local = /^http:\/\/(127\.0\.0\.1|localhost)/.test(baseURL);
export const slowMo = num(process.env.E2E_SLOWMO);
export const teclado = num(process.env.E2E_TECLADO);
export const pausa = num(process.env.E2E_PAUSA);
export const lento = slowMo > 0 || teclado > 0 || pausa > 0;
