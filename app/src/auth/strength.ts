/**
 * Fortaleza de las contraseñas del editor (cuentas de administración). Además de la longitud de
 * shared/limits.ts, se rechaza lo que un atacante probaría pronto: contraseñas comunes o filtradas,
 * palabras de diccionario, secuencias, teclados, fechas y repeticiones, y lo que se deduce de la cuenta
 * o del sitio (correo, nombre, la clínica). zxcvbn estima los intentos necesarios; se exige su nivel
 * máximo (4: más de 10¹⁰ intentos). Solo en el servidor: el navegador no descarga los diccionarios.
 * Los diccionarios ocupan unos 50 MB: se cargan la primera vez que se comprueba una contraseña, no al
 * arrancar (el servicio comparte el límite de memoria con la orden de Ansible).
 */
import type { ZxcvbnFactory } from "@zxcvbn-ts/core";

let zxcvbn: Promise<ZxcvbnFactory> | undefined;

function loadZxcvbn() {
  zxcvbn ??= Promise.all([import("@zxcvbn-ts/core"), import("@zxcvbn-ts/language-common"), import("@zxcvbn-ts/language-es-es")])
    .then(([core, common, es]) => new core.ZxcvbnFactory({
      dictionary: { ...common.dictionary, ...es.dictionary },
      graphs: common.adjacencyGraphs,
      translations: es.translations,
    }));
  return zxcvbn;
}

const SITE_WORDS = ["prana", "praná", "nutricion", "nutrición", "bienestar", "cuautla", "morelos", "editor", "admin", "clinica", "clínica"];

export const MIN_SCORE = 4;

export const WEAK_PASSWORD_MESSAGE =
  "Es fácil de adivinar. Usa una frase de varias palabras que no tengan que ver contigo ni con la clínica, o una contraseña de un gestor.";

/** Palabras de la cuenta que no deben formar la contraseña: el correo (y sus partes) y el nombre. */
function accountWords(account: { email: string; name?: string }) {
  const [local = "", domain = ""] = account.email.toLowerCase().split("@");
  const parts = [local, domain, ...local.split(/[^\p{L}\p{N}]+/u), ...domain.split("."), ...(account.name ?? "").toLowerCase().split(/\s+/)];
  return parts.filter((word) => word.length >= 3);
}

const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * zxcvbn da por buena una unión de varias palabras de la clínica («cuautla-morelos-prana»): quien ataque
 * esta cuenta probaría esas primero. Sin ellas, sin las de la cuenta y sin cifras ni símbolos, deben
 * quedar al menos 8 letras propias.
 */
function ownLetters(password: string, words: string[]) {
  let rest = fold(password);
  for (const word of [...new Set(words.map(fold))].sort((a, b) => b.length - a.length)) rest = rest.replaceAll(word, "");
  return rest.replace(/[^\p{L}]/gu, "").length;
}

export async function isStrongPassword(password: string, account: { email: string; name?: string }) {
  const words = [...SITE_WORDS, ...accountWords(account)];
  if (ownLetters(password, words) < 8) return false;
  const result = await (await loadZxcvbn()).check(password, words);
  return result.score >= MIN_SCORE;
}
