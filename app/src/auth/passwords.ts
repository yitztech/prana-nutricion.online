import argon2 from "argon2";
import { createLimiter } from "../concurrency.ts";

/**
 * Argon2id por encima del mínimo de OWASP, porque son cuentas de administración: 64 MiB, 3 iteraciones
 * y 1 hilo (unos 0,3 s por cálculo). Un cálculo a la vez por proceso, para no superar el mem_limit del
 * servicio (compartido con la orden de Ansible) aunque lleguen muchos inicios de sesión juntos:
 * el resto espera su turno. Con un solo editor y el límite de intentos, la espera es despreciable.
 */
export const hashOptions = { type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1 } as const;

const limited = createLimiter(1);

export const hashPassword = (password: string) => limited(() => argon2.hash(password, hashOptions));

export async function verifyPassword(hash: string, password: string) {
  try {
    return await limited(() => argon2.verify(hash, password));
  } catch {
    return false;
  }
}

/** Un hash con parámetros anteriores se recalcula al iniciar sesión, cuando se conoce la contraseña. */
export const needsRehash = (hash: string) => argon2.needsRehash(hash, hashOptions);

/** Se verifica contra este hash cuando la cuenta no existe: el tiempo de respuesta no la delata. */
export const decoyHash = await hashPassword("cuenta-inexistente-para-igualar-el-tiempo");
