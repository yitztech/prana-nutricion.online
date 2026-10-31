/**
 * Reglas del sistema de diseño (ver design/README.md, «Sistema de diseño»):
 * - Claro y oscuro definen los mismos roles, y cada rol apunta a un color de la paleta.
 * - Ningún componente escribe colores: ni hex, ni rgb(), ni colores de Tailwind, ni dark:.
 * - Fuera de components/ui/ y components/brand/ui/ las clases solo componen: sin valores [arbitrarios], sin color,
 *   tipografía ni decoración. Lo visual se pide a una primitiva de ui/ con su variante.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

function block(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `falta el bloque ${selector}`);
  return css.slice(start, css.indexOf("\n}", start));
}
const declared = (css: string) => new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
const referenced = (css: string) => new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));

test("claro y oscuro definen exactamente los mismos roles", () => {
  const themes = read("styles/themes.css");
  const light = declared(block(themes, ":root"));
  const dark = declared(block(themes, ".dark"));
  assert.deepEqual([...light].filter((v) => !dark.has(v)), [], "roles sin valor oscuro");
  assert.deepEqual([...dark].filter((v) => !light.has(v)), [], "roles sin valor claro");
});

test("los roles solo apuntan a colores de la paleta", () => {
  const palette = declared(read("styles/palettes/prana.css"));
  const themes = read("styles/themes.css");
  const roles = declared(themes);
  const unknown = [...referenced(themes)].filter((v) => !palette.has(v) && !roles.has(v));
  assert.deepEqual(unknown, []);
  assert.equal(/#[0-9a-f]{3,8}\b/i.test(themes), false, "themes.css no lleva colores: los toma de la paleta");
});

test("Tailwind solo expone roles que existen", () => {
  const roles = declared(read("styles/themes.css"));
  const missing = [...referenced(read("styles/theme.css"))].filter((v) => !roles.has(v));
  assert.deepEqual(missing, []);
});

const files = (dir: string): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith(".tsx") ? [join(dir, entry.name)] : [],
  );
const components = files(".");
const isPrimitive = (path: string) =>
  path.startsWith(join("components", "ui") + "/") ||
  path.startsWith(join("components", "brand", "ui") + "/");

const colorRules: [RegExp, string][] = [
  [/(?<![\w&/])#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/i, "color hex"],
  [/\b(?:rgba?|hsla?|oklch|oklab)\(/, "color rgb()/hsl()/oklch()"],
  [/\bstyle=\{/, "estilo en línea"],
  [/(?:^|[\s"'`])dark:/, "variante dark: (el tema cambia las variables)"],
  [
    /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|decoration|divide|caret|accent)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/,
    "color de la paleta de Tailwind",
  ],
];

test("ningún componente escribe colores", () => {
  const found = components.flatMap((path) =>
    colorRules.filter(([rule]) => rule.test(read(path))).map(([, what]) => `${path}: ${what}`),
  );
  assert.deepEqual(found, []);
});

/** Clases de className="…" y de los literales dentro de cn(…). */
function classLists(source: string) {
  const lists = [...source.matchAll(/className="([^"]*)"/g)].map((m) => m[1]);
  for (const call of source.matchAll(/\bcn\(([^)]*)\)/g)) {
    lists.push(...[...call[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]));
  }
  return lists.flatMap((list) => list.split(/\s+/).filter(Boolean));
}

const allowedText = /^text-(?:left|center|right|start|end|balance|pretty|wrap|nowrap)$/;
const visual = [
  /\[/, // valor arbitrario
  /^(?:bg|from|via|to|fill|stroke|shadow|rounded|font|leading|tracking|opacity|backdrop|mix-blend|ring|outline|decoration)(?:-|$)/,
  /^border-(?!(?:[trblxyse](?:-[0-9]+)?|[0-9]+)$)/, // grosor sí (border-t, border-b-0), color no
  /^(?:italic|not-italic|uppercase|lowercase|capitalize|underline|line-through)$/,
];

test("fuera de las primitivas base y de marca las clases solo componen", () => {
  const found = components
    .filter((path) => !isPrimitive(path))
    .flatMap((path) =>
      classLists(read(path))
        .map((token) => token.replace(/^(?:[\w-]+:)+/, "").replace(/^-/, ""))
        .filter((token) => (token.startsWith("text-") ? !allowedText.test(token) : visual.some((r) => r.test(token))))
        .map((token) => `${relative(root, join(root, path))}: ${token}`),
    );
  assert.deepEqual(found, []);
});

test("cn conoce toda la escala y las utilidades propias", async () => {
  const { namedUtilities, themeScale } = await import("./tokens.ts");
  const theme = read("styles/theme.css");
  const prefixes = { text: "text", leading: "leading", tracking: "tracking", radius: "radius", container: "container", aspect: "aspect", shadow: "shadow" };
  for (const [key, prefix] of Object.entries(prefixes)) {
    const inCss = [...theme.matchAll(new RegExp(`--${prefix}-([\\w-]+):`, "g"))]
      .map((m) => m[1])
      .filter((name) => !(key === "radius" && ["sm", "md", "lg", "xl"].includes(name)));
    assert.deepEqual([...themeScale[key as keyof typeof themeScale]].sort(), inCss.sort(), `escala ${key}`);
  }
  const utilities = [...read("styles/utilities.css").matchAll(/@utility ([\w-]+)/g)].map((m) => m[1]);
  assert.deepEqual(Object.values(namedUtilities).flat().sort(), utilities.sort());
});
