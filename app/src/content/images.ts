/**
 * Imágenes de las promociones (§29): tipo comprobado por el contenido, tamaño mínimo, recorte a 3:2
 * por la zona de interés y variantes WebP de 640, 1024 y 1536 px. sharp no copia los metadatos
 * (EXIF, ubicación) y el nombre del archivo lo genera el servidor.
 */
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sharp, { type Metadata } from "sharp";
import { promotionImage } from "#shared/limits.ts";
import { HttpProblem } from "../http/problem.ts";

export const UPLOADS_SUBDIR = "promociones";

const invalid = (code: string, message: string) => new HttpProblem(422, "validation_failed", "Revisa la imagen.", [{ field: "file", code, message }]);

export const formatHelp = `JPG, PNG o WebP de hasta ${promotionImage.maxBytes / 1024 / 1024} MB, horizontal 3:2 y de al menos ${promotionImage.minWidth} × ${promotionImage.minHeight} px.`;

export async function inspectImage(buffer: Buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !(promotionImage.types as readonly string[]).includes(type.mime)) {
    throw invalid("invalid_type", `El archivo no es una imagen admitida. Usa ${formatHelp}`);
  }
  let meta: Metadata;
  try {
    meta = await sharp(buffer, { limitInputPixels: 60_000_000, failOn: "error" }).metadata();
  } catch {
    throw invalid("invalid_type", "La imagen está dañada o no se puede leer.");
  }
  // Con orientación EXIF 5–8 la foto se ve girada: se mide como se verá.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = (rotated ? meta.height : meta.width) ?? 0;
  const height = (rotated ? meta.width : meta.height) ?? 0;
  if (width < promotionImage.minWidth || height < promotionImage.minHeight) {
    throw invalid("too_small", `La imagen mide ${width} × ${height} px; necesita al menos ${promotionImage.minWidth} × ${promotionImage.minHeight} px.`);
  }
  return { width, height, mime: type.mime };
}

export async function writeVariants(buffer: Buffer, uploadsDir: string, id: string) {
  const dir = join(uploadsDir, UPLOADS_SUBDIR);
  await mkdir(dir, { recursive: true });
  const { width: ratioW, height: ratioH } = promotionImage.aspect;
  const files: string[] = [];
  try {
    for (const width of promotionImage.widths) {
      const file = join(dir, `${id}-${width}.webp`);
      await sharp(buffer, { limitInputPixels: 60_000_000 })
        .autoOrient()
        .resize(width, Math.round((width * ratioH) / ratioW), { fit: "cover", position: sharp.strategy.attention })
        .webp({ quality: 78 })
        .toFile(file);
      files.push(file);
    }
  } catch (error) {
    await Promise.all(files.map((file) => rm(file, { force: true })));
    throw error;
  }
  return [...promotionImage.widths];
}

export async function removeVariants(uploadsDir: string, id: string, widths: readonly number[]) {
  await Promise.all(widths.map((w) => rm(join(uploadsDir, UPLOADS_SUBDIR, `${id}-${w}.webp`), { force: true })));
}
