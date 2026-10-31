import { contact, socialLinks } from "../data/site.ts";
import type { SiteContent } from "../types/index.ts";
import { BRAND, type PageHead } from "./routes.ts";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** JSON dentro de <script>: sin `<` ni separadores de línea que cierren o rompan el bloque. */
export function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function headTags(head: PageHead, siteUrl: string) {
  const url = new URL(head.path, siteUrl).href;
  const image = new URL("/img/og.jpg", siteUrl).href;
  const tags = [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}">`,
    head.indexable ? `<link rel="canonical" href="${escapeHtml(url)}">` : `<meta name="robots" content="noindex">`,
    `<meta property="og:title" content="${escapeHtml(head.title)}">`,
    `<meta property="og:description" content="${escapeHtml(head.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:site_name" content="${escapeHtml(BRAND)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  if (head.path === "/") tags.push(`<script type="application/ld+json">${scriptJson(businessJsonLd(siteUrl))}</script>`);
  return tags.join("\n    ");
}

export function businessJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: BRAND,
    url: new URL("/", siteUrl).href,
    image: new URL("/img/og.jpg", siteUrl).href,
    logo: new URL("/favicon-prana.png", siteUrl).href,
    description: "Tratamientos reductivos, corporales y depilación láser en Cuautla, Morelos, con valoración personalizada.",
    telephone: "+527772095094",
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Guadalupe Victoria #668, Colonia Manantiales",
      addressLocality: "Cuautla",
      addressRegion: "Morelos",
      addressCountry: "MX",
    },
    sameAs: socialLinks.map((link) => link.href),
  };
}

/** Lo que el navegador necesita para hidratar exactamente lo que se generó. */
export function contentScript(content: SiteContent, path: string) {
  return `<script type="application/json" id="prana-datos">${scriptJson({ path, content })}</script>`;
}
