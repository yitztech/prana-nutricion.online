/**
 * Generación estática: el servicio (app/src/site/generator.ts) importa este módulo ya compilado
 * (web/dist/server/entry-server.js) y escribe una página HTML por ruta.
 */
import { renderToString } from "react-dom/server";
import { Root } from "@/Root";
import { contentScript, headTags } from "@/site/head";
import { pageHead, resolveRoute, sitePages } from "@/site/routes";
import type { SiteContent } from "@/types";

export { sitePages };

const markers = ["<!--prana:head-->", "<!--prana:app-->", "<!--prana:data-->"] as const;

export function renderDocument({ template, path, content, siteUrl }: { template: string; path: string; content: SiteContent; siteUrl: string }) {
  for (const marker of markers) if (!template.includes(marker)) throw new Error(`La plantilla no tiene ${marker}`);
  const route = resolveRoute(path, content);
  const head = pageHead(route, content, path);
  const app = renderToString(<Root content={content} pathname={path} />);
  const html = template
    .replace(markers[0], headTags(head, siteUrl))
    .replace(markers[1], app)
    .replace(markers[2], contentScript(content, path));
  return { status: head.status, html };
}
