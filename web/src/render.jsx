import { readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./pages/index";
import Privacy from "./pages/privacidad";
import Terms from "./pages/condiciones";
import NotFound from "./pages/404";
import ServicePage from "./pages/servicio";
import { categories, servicePath } from "./lib/catalog";

for (const [name, Page] of Object.entries({
  index: Home,
  privacidad: Privacy,
  condiciones: Terms,
  404: NotFound,
})) {
  const template = readFileSync(`web/src/pages/${name}.html`, "utf8");
  const body = renderToStaticMarkup(<Page />);
  if (!template.includes("<!--prana:body-->"))
    throw new Error(`Falta el marcador del contenido: ${name}`);
  writeFileSync(
    `web/public/${name}.html`,
    template.replace("<!--prana:body-->", body),
  );
}

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
for (const category of categories) {
  for (const service of category.services) {
    const path = servicePath(service);
    const title = escapeHtml(`${service.title} | Prana & Nutrición en Cuautla`);
    const description = escapeHtml(service.description);
    const url = `https://prana-nutricion.online${path}`;
    const body = renderToStaticMarkup(<ServicePage category={category} service={service} />);
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${url}"><meta name="theme-color" content="#FFF9FC"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta property="og:image" content="https://prana-nutricion.online/assets/img/og.jpg"><meta property="og:locale" content="es_MX"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/styles.css"></head><body>${body}</body></html>`;
    writeFileSync(`web/public${path}.html`, html);
  }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/privacidad", "/condiciones", ...categories.flatMap(category => category.services.map(servicePath))].map(path => `  <url><loc>https://prana-nutricion.online${path}</loc></url>`).join("\n")}\n</urlset>\n`;
writeFileSync("web/public/sitemap.xml", sitemap);
