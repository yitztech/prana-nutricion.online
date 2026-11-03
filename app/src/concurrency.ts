/**
 * Cola de trabajos con un máximo a la vez dentro del proceso: lo que gasta mucha memoria (Argon2id,
 * decodificar imágenes) no supera el mem_limit del servicio aunque lleguen muchas peticiones juntas.
 * El turno pasa directamente al siguiente en espera: nunca hay más de `max` a la vez.
 */
export function createLimiter(max: number) {
  let running = 0;
  const waiting: (() => void)[] = [];
  return async function limited<T>(work: () => Promise<T>): Promise<T> {
    if (running >= max) await new Promise<void>((resolve) => waiting.push(resolve));
    else running++;
    try {
      return await work();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else running--;
    }
  };
}
