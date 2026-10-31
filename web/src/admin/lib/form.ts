/** Utilidades de los formularios del panel: errores por campo (cliente y servidor) e importes. */
import { useCallback, useRef, useState } from "react";
import type { z } from "zod";
import { fieldErrors } from "#shared/schemas.ts";
import { ApiError, errorMessage } from "./api";

export type Errors = Record<string, string>;

/** Primer error de cada campo, con la ruta del servidor (`includes.0.label`). */
export function toErrors(list: { field: string; message: string }[]): Errors {
  const errors: Errors = {};
  for (const { field, message } of list) errors[field || "_"] ??= message;
  return errors;
}

/** Valida con el mismo esquema que el servidor (§6, §23). */
export function validate<S extends z.ZodType>(schema: S, value: unknown): { data: z.output<S>; errors: null } | { data: null; errors: Errors } {
  const result = schema.safeParse(value, { reportInput: true });
  if (result.success) return { data: result.data, errors: null };
  return { data: null, errors: toErrors(fieldErrors(result.error)) };
}

/**
 * Envío de un formulario: un solo envío a la vez, errores por campo y mensaje general. Los datos del
 * formulario no se tocan si falla, para no perder lo escrito.
 */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);
  const running = useRef(false);

  const run = useCallback(async (action: () => Promise<void>, form?: HTMLFormElement | null) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setErrors({});
    } catch (error) {
      if (error instanceof ClientErrors) {
        setErrors(error.errors);
        setMessage("Revisa los campos marcados.");
        focusFirstError(form);
      } else if (error instanceof ApiError && error.errors.length) {
        setErrors(toErrors(error.errors));
        setMessage(error.message || "Revisa los campos marcados.");
        focusFirstError(form);
      } else {
        setMessage(errorMessage(error));
      }
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, errors, setErrors, message, setMessage, run };
}

/** Errores encontrados antes de enviar: los recoge useSubmit. */
export class ClientErrors extends Error {
  readonly errors: Errors;
  constructor(errors: Errors) {
    super("Revisa los campos marcados.");
    this.errors = errors;
  }
}

export function check<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = validate(schema, value);
  if (result.errors) throw new ClientErrors(result.errors);
  return result.data;
}

function focusFirstError(form?: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

// ── Importes ──────────────────────────────────────────────────────────────────

/** «1,499.50» o «1499.5» → 149950 centavos. Vacío → null. Formato inválido → NaN. */
export function parsePesos(value: string): number | null {
  const clean = value.replace(/[\s,$]/g, "");
  if (!clean) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}

/** 249000 → «$2,490»: para mostrar. */
export function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

export function formatPesos(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

/** Solo dígitos, punto y coma en los importes (§6.2): lo demás se descarta al escribir o pegar. */
export const pesosCharacters = /[^0-9.,]/g;
export const integerCharacters = /[^0-9]/g;

/** Fecha y hora en la zona de Cuautla, para mostrar. */
export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Mexico_City" }).format(new Date(iso));
}

export function formatDay(day: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
}
