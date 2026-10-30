// Separa el logo (PAM RGBA sobre blanco) en dos máscaras: el mandala y el texto.
// Cada máscara es blanca con alfa; el color lo ponen las variables --logo-mark y --logo-ink.
// Uso: node scripts/logo-masks.mjs <logo.pam> <mandala.pam> <texto.pam>
import { readFileSync, writeFileSync } from "node:fs";

const [input, markOut, inkOut] = process.argv.slice(2);
const data = readFileSync(input);
const end = data.indexOf("ENDHDR\n") + 7;
const header = data.subarray(0, end).toString();
const width = Number(/WIDTH (\d+)/.exec(header)[1]);
const height = Number(/HEIGHT (\d+)/.exec(header)[1]);
const pixels = data.subarray(end);

const clamp = (n) => Math.max(0, Math.min(1, n));
const mark = Buffer.alloc(width * height * 4, 255);
const ink = Buffer.alloc(width * height * 4, 255);

for (let i = 0; i < width * height; i++) {
  const [r, g, b] = pixels.subarray(i * 4, i * 4 + 3);
  // El rosa del mandala tiene el rojo alto y el verde bajo; el texto es casi neutro y oscuro.
  const pink = clamp((r - g) / 190);
  const dark = clamp((255 - Math.max(r, g, b)) / 200 - pink);
  mark[i * 4 + 3] = Math.round(pink * 255);
  ink[i * 4 + 3] = Math.round(dark * 255);
}

const pam = (buf) =>
  Buffer.concat([
    Buffer.from(`P7\nWIDTH ${width}\nHEIGHT ${height}\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n`),
    buf,
  ]);
writeFileSync(markOut, pam(mark));
writeFileSync(inkOut, pam(ink));
