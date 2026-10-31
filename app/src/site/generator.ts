/**
 * Genera el sitio estático (§ «Instrucciones del proyecto»): una página HTML por ruta con el contenido
 * de la base de datos, más los recursos del build. Escribe una versión nueva en `releases/<id>` y
 * cambia el enlace `current` de una vez: nginx nunca sirve una mezcla de dos versiones.
 */
import { randomBytes } from "node:crypto";
import { cp, mkdir, readdir, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { SiteContent } from "#shared/content.ts";

export type Renderer = {
  renderDocument(args: { template: string; path: string; content: SiteContent; siteUrl: string }): { status: number; html: string };
  sitePages(content: SiteContent): { path: string; file: string }[];
};

export async function loadRenderer(webDist: string): Promise<Renderer> {
  return import(pathToFileURL(join(webDist, "server", "entry-server.js")).href);
}

const KEEP_RELEASES = 3;

export async function generateSite({ content, webDist, siteDir, siteUrl, renderer }: {
  content: SiteContent;
  webDist: string;
  siteDir: string;
  siteUrl: string;
  renderer: Renderer;
}) {
  const clientDir = join(webDist, "client");
  const template = await readFile(join(clientDir, "index.html"), "utf8");
  const id = `${Date.now()}-${randomBytes(3).toString("hex")}`;
  const releases = join(siteDir, "releases");
  const release = join(releases, id);
  await mkdir(releases, { recursive: true });
  await cp(clientDir, release, { recursive: true });

  const pages = renderer.sitePages(content);
  for (const page of pages) {
    const { html } = renderer.renderDocument({ template, path: page.path, content, siteUrl });
    const file = join(release, page.file);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  const indexable = pages.filter((page) => page.path !== "/404");
  await writeFile(join(release, "sitemap.xml"), sitemap(indexable.map((page) => new URL(page.path, siteUrl).href)));
  await writeFile(join(release, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${new URL("/sitemap.xml", siteUrl).href}\n`);
  await writeFile(join(release, "release.json"), JSON.stringify({ id, generatedOn: content.generatedOn, pages: pages.length }));

  // Cambio atómico del enlace: rename sustituye `current` en una sola operación.
  const temporary = join(siteDir, `.current-${id}`);
  await symlink(join("releases", id), temporary);
  await rename(temporary, join(siteDir, "current"));
  await prune(releases, id);
  return { id, pages: pages.length };
}

/** Se conservan las últimas versiones: una página abierta sigue encontrando su CSS y su JS. */
async function prune(releases: string, current: string) {
  const all = (await readdir(releases)).filter((name) => /^\d+-[0-9a-f]{6}$/.test(name)).sort();
  const old = all.filter((name) => name !== current).slice(0, Math.max(0, all.length - KEEP_RELEASES));
  await Promise.all(old.map((name) => rm(join(releases, name), { recursive: true, force: true })));
}

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function sitemap(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}
