import { config } from "zod";

/**
 * Lo que necesita el navegador para funcionar con la CSP del gateway, sin 'unsafe-inline' ni 'unsafe-eval'.
 * Se importa lo primero en cada entrada (main.tsx y admin/main.tsx).
 *
 * zod 4 prueba `new Function` para compilar los esquemas: la CSP lo bloquea y lo anota como infracción. En modo
 * jitless valida igual, sin intentarlo.
 */
config({ jitless: true });

/**
 * Nonce de la CSP para los <style> que insertan las librerías al ejecutarse: Radix (bloqueo del desplazamiento
 * al abrir el menú móvil y los diálogos, vía react-style-singleton) y Tiptap (estilos base del editor). El
 * gateway sustituye el marcador de la plantilla por un valor nuevo en cada respuesta y lo pone en la CSP
 * (`style-src 'self' 'nonce-…'`): así la CSP no necesita 'unsafe-inline'. Sin gateway (vite dev, la vista
 * previa de `generar`) queda el marcador, no hay nonce y tampoco hay CSP.
 */
const PLACEHOLDER = "__CSP_NONCE__";

function readNonce() {
  if (typeof document === "undefined") return undefined;
  const value = document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')?.content;
  // El gateway usa $request_id: 32 caracteres hexadecimales. Cualquier otra cosa no se usa.
  return value && value !== PLACEHOLDER && /^[0-9a-f]{32}$/.test(value) ? value : undefined;
}

export const cspNonce = readNonce();

// react-style-singleton lee el nonce con get-nonce, que recurre a esta variable global si nadie llamó a setNonce.
if (cspNonce) (globalThis as { __webpack_nonce__?: string }).__webpack_nonce__ = cspNonce;
