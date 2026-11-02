/**
 * Imágenes de las promociones (§29): tipo comprobado por el contenido, tamaño mínimo y máximo, recorte
 * a 3:2 por la zona de interés y variantes WebP de 640, 1024 y 1536 px. sharp no copia los metadatos
 * (EXIF, ubicación) y el nombre del archivo lo genera el servidor.
 *
 * Memoria acotada (mem_limit del servicio): se decodifica una sola vez, de una en una, sin la caché de
 * libvips y con un hilo; las medidas se leen de la cabecera antes de decodificar nada.
 */
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sharp, { type Metadata } from "sharp";
import { promotionImage } from "#shared/limits.ts";
import { createLimiter } from "../concurrency.ts";
import { HttpProblem } from "../http/problem.ts";

sharp.cache(false);
sharp.concurrency(1);
const oneAtATime = createLimiter(1);

export const UPLOADS_SUBDIR = "promociones";

const invalid = (code: string, message: string) => new HttpProblem(422, "validation_failed", "Revisa la imagen.", [{ field: "file", code, message }]);

export const formatHelp = `JPG, PNG o WebP de hasta ${promotionImage.maxBytes / 1024 / 1024} MB, horizontal 3:2, de al menos ${promotionImage.minWidth} × ${promotionImage.minHeight} px y de hasta ${promotionImage.maxPixels / 1_000_000} megapíxeles.`;
const input = { limitInputPixels: promotionImage.maxPixels } as const;

export async function inspectImage(buffer: Buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !(promotionImage.types as readonly string[]).includes(type.mime)) {
    throw invalid("invalid_type", `El archivo no es una imagen admitida. Usa ${formatHelp}`);
  }
  let meta: Metadata;
  try {
    // Solo la cabecera, sin decodificar los píxeles: aquí se mide, y el límite se explica con su propio error.
    meta = await sharp(buffer, { limitInputPixels: false, failOn: "error" }).metadata();
  } catch {
    throw invalid("invalid_type", "La imagen está dañada o no se puede leer.");
  }
  // Con orientación EXIF 5–8 la foto se ve girada: se mide como se verá.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = (rotated ? meta.height : meta.width) ?? 0;
  const height = (rotated ? meta.width : meta.height) ?? 0;
  if (width * height > promotionImage.maxPixels) {
    throw invalid("too_large", `La imagen mide ${width} × ${height} px; como máximo puede tener ${promotionImage.maxPixels / 1_000_000} megapíxeles. Redúcela antes de subirla.`);
  }
  if (width < promotionImage.minWidth || height < promotionImage.minHeight) {
    throw invalid("too_small", `La imagen mide ${width} × ${height} px; necesita al menos ${promotionImage.minWidth} × ${promotionImage.minHeight} px.`);
  }
  return { width, height, mime: type.mime };
}

export const writeVariants = (buffer: Buffer, uploadsDir: string, id: string) => oneAtATime(async () => {
  const dir = join(uploadsDir, UPLOADS_SUBDIR);
  await mkdir(dir, { recursive: true });
  const { width: ratioW, height: ratioH } = promotionImage.aspect;
  const heightFor = (width: number) => Math.round((width * ratioH) / ratioW);
  // Una sola decodificación del original: el recorte más grande, del que salen las demás variantes.
  const largest = Math.max(...promotionImage.widths);
  const base = await sharp(buffer, input)
    .autoOrient()
    .resize(largest, heightFor(largest), { fit: "cover", position: sharp.strategy.attention })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: base.info.width, height: base.info.height, channels: base.info.channels } };
  const files: string[] = [];
  try {
    for (const width of promotionImage.widths) {
      const file = join(dir, `${id}-${width}.webp`);
      await sharp(base.data, raw).resize(width, heightFor(width)).webp({ quality: 78 }).toFile(file);
      files.push(file);
    }
  } catch (error) {
    await Promise.all(files.map((file) => rm(file, { force: true })));
    throw error;
  }
  return [...promotionImage.widths];
});

export async function removeVariants(uploadsDir: string, id: string, widths: readonly number[]) {
  await Promise.all(widths.map((w) => rm(join(uploadsDir, UPLOADS_SUBDIR, `${id}-${w}.webp`), { force: true })));
}
