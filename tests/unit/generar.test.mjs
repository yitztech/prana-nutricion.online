import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seedContent } from "#shared/seed/index.ts";
import { limits } from "#shared/limits.ts";

// Valida el artefacto que sirve nginx: el sitio generado con el contenido inicial, sin base de datos.
const out = mkdtempSync(join(tmpdir(), "prana-sitio-"));
const site = join(out, "current");
const read = (file) => readFileSync(join(site, file), "utf8");

test.before(() => {
  if (!existsSync("web/dist/server/entry-server.js")) {
    const build = spawnSync("npm", ["run", "build"], { encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr);
  }
  const result = spawnSync(process.execPath, ["app/src/cli.ts", "generar", "--salida", out, "--dia", "2026-10-31"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
test.after(() => rmSync(out, { recursive: true, force: true }));

test("cada página trae idioma, título, h1, canonical y los datos para hidratar", () => {
  for (const page of ["index.html", "privacidad.html", "condiciones.html", "404.html", "tratamientos/reductivos/index.html"]) {
    const html = read(page);
    assert.match(html, /<html lang="es"/, page);
    assert.match(html, /<title>[^<]*Praná[^<]*<\/title>/, page);
    assert.match(html, /<h1[ >]/, page);
    assert.doesNotMatch(html, /<!--prana:/, page);
    assert.equal([...html.matchAll(/id="prana-datos"/g)].length, 1, page);
    assert.equal([...html.matchAll(/id="contenido"/g)].length, 1, `${page}: un solo destino del enlace de salto`);
    const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(scripts.every((src) => src.startsWith("/")), `${page}: ningún script de terceros`);
  }
  assert.match(read("index.html"), /type="application\/ld\+json"/);
  assert.match(read("404.html"), /name="robots" content="noindex/);
  assert.match(read("privacidad.html"), /rel="canonical" href="https:\/\/prana-nutricion\.online\/privacidad"/);
});

test("el formulario sale con sus límites, etiquetas y la región de estado", () => {
  const home = read("index.html");
  for (const [id, tag, limit] of [
    ["wa-nombre", "input", limits.contact.name],
    ["wa-telefono", "input", limits.contact.phone],
    ["wa-mensaje", "textarea", limits.contact.message],
  ]) {
    const control = home.match(new RegExp(`<${tag}[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(control, id);
    assert.match(control, new RegExp(`maxLength="${limit}"`, "i"));
    assert.match(control, /required/);
    assert.match(home, new RegExp(`<label[^>]*for="${id}"`));
  }
  assert.match(home, /<select[^>]*id="wa-servicio"/);
  assert.match(home, /id="wa-estado" role="status"/);
  assert.doesNotMatch(home, /id="wa-continuar"/, "el respaldo aparece solo tras intentar abrir WhatsApp");
});

test("categorías, legales y sitemap coherentes con el contenido", () => {
  const content = seedContent("2026-10-31");
  const sitemap = read("sitemap.xml");
  const home = read("index.html");
  for (const category of content.categories) {
    const path = `/tratamientos/${category.id}/`;
    assert.ok(sitemap.includes(`<loc>https://prana-nutricion.online${path}</loc>`), path);
    assert.ok(home.includes(`href="${path}"`), path);
    const html = read(`tratamientos/${category.id}/index.html`);
    assert.ok(html.includes(category.title), category.id);
    for (const treatment of category.treatments) assert.ok(html.includes(treatment.name), treatment.name);
  }
  for (const slug of ["privacidad", "condiciones"]) {
    assert.ok(sitemap.includes(`<loc>https://prana-nutricion.online/${slug}</loc>`));
    assert.ok(read(`${slug}.html`).includes(content.legal[slug].title));
  }
  assert.ok(!sitemap.includes("/404"));
  assert.doesNotMatch(read("robots.txt"), /admin/, "el editor tiene su propio dominio");
});
