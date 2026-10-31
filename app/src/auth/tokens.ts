import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** 32 bytes aleatorios en base64url (43 caracteres). Solo se guarda su SHA-256. */
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest();
}

export function sameHash(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}
