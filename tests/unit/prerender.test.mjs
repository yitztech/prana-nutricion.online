import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Valida el artefacto que recibe nginx, no solo los componentes de forma aislada.
test("el build genera las cuatro rutas con SEO y controles funcionales sin runtime React", () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  for (const page of ["index", "privacidad", "condiciones", "404"]) {
    const html = readFileSync(`web/public/${page}.html`, "utf8");
    assert.match(html, /<html lang="es"/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<h1[ >]/);
    assert.doesNotMatch(html, /<!--prana:body-->/);
    const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.ok(
      scripts.every((src) => src === "/assets/main.js"),
      `Script inesperado en ${page}`,
    );
  }
  const home = readFileSync("web/public/index.html", "utf8");
  assert.match(home, /type="application\/ld\+json"/);
  assert.equal([...home.matchAll(/data-slot="card"/g)].length, 3);
  for (const [id, tag, limit] of [
    ["wa-nombre", "input", 50],
    ["wa-telefono", "input", 20],
    ["wa-mensaje", "textarea", 2000],
  ]) {
    const control = home.match(new RegExp(`<${tag}[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(control, id);
    assert.match(control, new RegExp(`maxLength="${limit}"`, "i"));
    assert.match(control, /required/);
    assert.match(home, new RegExp(`<label[^>]*for="${id}"`));
  }
  assert.match(
    home,
    /<select[^>]*data-slot="native-select"[^>]*id="wa-servicio"/,
  );
  assert.match(home, /id="wa-continuar"[^>]*hidden/);
});

test("el catálogo genera enlaces, páginas individuales y sitemap coherentes", async () => {
  const { categories, servicePath } = await import("../../web/src/lib/catalog.js");
  const home = readFileSync("web/public/index.html", "utf8");
  const sitemap = readFileSync("web/public/sitemap.xml", "utf8");
  assert.equal(categories.length, 4);
  for (const category of categories) {
    assert.ok(home.includes(`id="categoria-${category.id}"`));
    for (const service of category.services) {
      const path = servicePath(service);
      const html = readFileSync(`web/public${path}.html`, "utf8");
      assert.ok(home.includes(`href="${path}"`));
      assert.ok(sitemap.includes(`https://prana-nutricion.online${path}</loc>`));
      assert.ok(html.includes(`<h1>${service.title}</h1>`));
      assert.ok(html.includes(`href="/#categoria-${category.id}"`));
      assert.match(html, /https:\/\/wa\.me\/527772095094\?text=/);
      assert.ok(html.includes(`rel="canonical" href="https://prana-nutricion.online${path}"`));
    }
  }
});
