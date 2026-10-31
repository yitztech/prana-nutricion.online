import { charLength, limits, normalizeSpaces } from "#shared/limits.ts";
import { WHATSAPP_NUMBER } from "../../../lib/booking.ts";

/** Campos con caracteres restringidos y longitud máxima (AGENTS.md §6.2 y §6.3). */
export const contactLimits = limits.contact;
export const phoneDigits = { min: 8, max: 15 } as const;

const notName = /[^\p{L}\p{M} '’.-]/gu;
const notPhone = /[^0-9 ().+-]/g;
const validName = /^[\p{L}\p{M}](?:[\p{L}\p{M} '’.-]*[\p{L}\p{M}.])?$/u;
const validPhone = /^\+?[0-9 ().-]+$/;

export const contactMessages = {
  nameCharacters: "El nombre solo admite letras, espacios, apóstrofo, guion y punto.",
  phoneCharacters: "El teléfono solo admite números, espacios, guiones, puntos, paréntesis y + al principio.",
  nameRequired: "Escribe tu nombre.",
  phoneRequired: "Escribe tu teléfono.",
  messageRequired: "Escribe tu mensaje.",
  phoneDigits: `El teléfono debe tener entre ${phoneDigits.min} y ${phoneDigits.max} dígitos.`,
  tooLong: (max: number) => `Máximo ${max} caracteres.`,
  pasteTooLong: (max: number) => `Máximo ${max} caracteres: el texto pegado no cabe completo.`,
  review: "Revisa los campos marcados.",
  ready: "Tu mensaje está listo. Si WhatsApp no se abrió, usa «Continuar en WhatsApp». Envíalo desde allí.",
  openFailed: "No pudimos abrir WhatsApp. Usa «Continuar en WhatsApp» para enviar tu mensaje.",
} as const;

export type ContactField = "name" | "phone" | "message";
export type ContactValues = { name: string; phone: string; service: string; message: string };
export type ContactErrors = Partial<Record<ContactField, string>>;

/** Lo que no admite un campo se descarta al escribir o pegar; `rejected` dice si hubo que quitar algo. */
export function filterField(field: ContactField, value: string) {
  const pattern = field === "name" ? notName : field === "phone" ? notPhone : null;
  const clean = pattern ? value.replace(pattern, "") : value;
  return { value: clean, rejected: clean !== value };
}

export const filterMessage: Partial<Record<ContactField, string>> = {
  name: contactMessages.nameCharacters,
  phone: contactMessages.phoneCharacters,
};

/** ¿El texto pegado, sustituyendo la selección, supera el máximo? */
export function pasteExceeds(current: string, selectionLength: number, pasted: string, max: number) {
  return current.length - selectionLength + pasted.length > max;
}

export function validateContact(values: ContactValues): { errors: ContactErrors; data?: ContactValues } {
  const name = normalizeSpaces(values.name);
  const phone = normalizeSpaces(values.phone);
  const message = values.message.trim();
  const digits = phone.replace(/\D/g, "").length;
  const errors: ContactErrors = {};

  if (!name) errors.name = contactMessages.nameRequired;
  else if (!validName.test(name)) errors.name = contactMessages.nameCharacters;
  else if (charLength(name) > contactLimits.name) errors.name = contactMessages.tooLong(contactLimits.name);

  if (!phone) errors.phone = contactMessages.phoneRequired;
  else if (!validPhone.test(phone) || digits < phoneDigits.min || digits > phoneDigits.max) errors.phone = contactMessages.phoneDigits;
  else if (charLength(phone) > contactLimits.phone) errors.phone = contactMessages.tooLong(contactLimits.phone);

  if (!message) errors.message = contactMessages.messageRequired;
  else if (charLength(message) > contactLimits.message) errors.message = contactMessages.tooLong(contactLimits.message);

  return Object.keys(errors).length ? { errors } : { errors, data: { name, phone, service: values.service, message } };
}

/** Texto plano: WhatsApp no interpreta HTML, y encodeURIComponent evita que un & o un # corten el mensaje. */
export function whatsappUrl(data: ContactValues) {
  const text = [
    "¡Hola Praná! Quisiera agendar una valoración.",
    "",
    `*Nombre:* ${data.name}`,
    `*Teléfono:* ${data.phone}`,
    `*Servicio de Interés:* ${data.service}`,
    `*Mensaje:* ${data.message}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
