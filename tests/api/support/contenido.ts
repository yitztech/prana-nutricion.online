import sharp from "sharp";
import { BASE, type Cliente } from "./cliente.ts";

/** Foto de prueba en el formato que pide el editor (3:2, al menos 1536 × 1024). */
export const foto = (width = 1600, height = 1067, format: "jpeg" | "png" = "jpeg") =>
  sharp({ create: { width, height, channels: 3, background: { r: 236, g: 72, b: 153 } } })[format]().toBuffer();

export function formulario(buffer: Buffer, nombre = "promo.jpg", tipo = "image/jpeg", campo = "file") {
  const form = new FormData();
  form.append(campo, new Blob([new Uint8Array(buffer)], { type: tipo }), nombre);
  return form;
}

export const promocion = (extra: Record<string, unknown> = {}) => ({
  status: "active",
  name: `Promo de prueba ${crypto.randomUUID().slice(0, 8)}`,
  description: "Una promoción creada por las pruebas automáticas.",
  priceCents: 149_900,
  endsOn: "2099-12-31",
  image: { path: "/img/paquetes-promociones-1024.webp" },
  imageAlt: "Cabina de tratamiento con luz cálida",
  ctaLabel: "Quiero esta promo",
  ...extra,
});

/** Espera a que el sitio publicado refleje un cambio (la publicación es asíncrona). */
export async function esperarPagina(path: string, contiene: string, timeoutMs = 20_000) {
  const limite = Date.now() + timeoutMs;
  let ultimo = "";
  while (Date.now() < limite) {
    const r = await fetch(new URL(path, BASE));
    ultimo = await r.text();
    if (r.ok && ultimo.includes(contiene)) return ultimo;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`${path} no muestra «${contiene}» tras ${timeoutMs} ms`);
}

export async function esperarAusencia(path: string, texto: string, timeoutMs = 20_000) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    const html = await (await fetch(new URL(path, BASE))).text();
    if (!html.includes(texto)) return html;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`${path} sigue mostrando «${texto}»`);
}

export async function categoria(cliente: Cliente) {
  const r = await cliente.get("/api/admin/categories");
  return r.body.items[0] as { id: string; title: string; description: string; photoAlt: string; cta: string; icon: string; benefits: string[]; treatments: { id: string; slug: string; name: string; icon: string; description: string }[] };
}
