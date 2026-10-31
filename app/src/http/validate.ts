import type { z } from "zod";
import { fieldErrors } from "#shared/schemas.ts";
import { HttpProblem, validationFailed } from "./problem.ts";

/** Valida en el borde con el esquema compartido; 422 con cada campo (§22, §23). */
export function parse<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  if (value === undefined || value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpProblem(400, "bad_request", "Envía un objeto JSON.");
  }
  // reportInput: fieldErrors distingue un campo ausente de uno con el tipo equivocado
  const result = schema.safeParse(value, { reportInput: true });
  if (!result.success) throw validationFailed(fieldErrors(result.error));
  return result.data;
}

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
