import argon2 from "argon2";

/** Argon2id con los parámetros mínimos que recomienda OWASP (19 MiB, 2 iteraciones, 1 hilo). */
const options = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => argon2.hash(password, options);

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/** Se verifica contra este hash cuando la cuenta no existe: el tiempo de respuesta no la delata. */
export const decoyHash = await hashPassword("cuenta-inexistente-para-igualar-el-tiempo");
