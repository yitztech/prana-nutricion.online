import { benefitHref, benefitIdFromPath, benefitPageDescription, benefits, findBenefit } from "../features/benefits/index.ts";
import { legalPath, legalSlugFromPath } from "../lib/legal-routes.ts";
import { categoryIdFromPath, findCategory, treatmentCategoryHref } from "../features/treatments/index.ts";
import type { Benefit, Category, LegalSlug, SiteContent } from "../types/index.ts";

export type Route =
  | { kind: "home" }
  | { kind: "category"; category: Category }
  | { kind: "benefit"; benefit: Benefit }
  | { kind: "legal"; slug: LegalSlug }
  | { kind: "not-found" };

export function resolveRoute(pathname: string, content: Pick<SiteContent, "categories">): Route {
  if (pathname === "/" || pathname === "/index.html") return { kind: "home" };
  const categoryId = categoryIdFromPath(pathname);
  const category = categoryId ? findCategory(content.categories, categoryId) : undefined;
  if (category) return { kind: "category", category };
  const benefitId = benefitIdFromPath(pathname);
  const benefit = benefitId ? findBenefit(benefitId) : undefined;
  if (benefit) return { kind: "benefit", benefit };
  const slug = legalSlugFromPath(pathname);
  if (slug) return { kind: "legal", slug };
  return { kind: "not-found" };
}

/** Páginas que se generan: su ruta pública y el archivo que la sirve (nginx: $uri, $uri.html, $uri/). */
export function sitePages(content: Pick<SiteContent, "categories">) {
  return [
    { path: "/", file: "index.html" },
    ...content.categories.map((c) => ({ path: treatmentCategoryHref(c.id), file: `tratamientos/${c.id}/index.html` })),
    ...benefits.map((b) => ({ path: benefitHref(b.id), file: `beneficios/${b.id}/index.html` })),
    ...(["privacidad", "condiciones"] as const).map((slug) => ({ path: legalPath(slug), file: `${slug}.html` })),
    { path: "/404", file: "404.html" },
  ];
}

export const BRAND = "Praná: Nutrición y Bienestar";

export type PageHead = { title: string; description: string; path: string; indexable: boolean; status: number };

export function pageHead(route: Route, content: SiteContent, path: string): PageHead {
  switch (route.kind) {
    case "home":
      return {
        title: `${BRAND} en Cuautla, Morelos`,
        description: "Tratamientos reductivos, corporales y depilación láser en Cuautla, Morelos. Valoración personalizada y acompañamiento. Agenda por WhatsApp.",
        path: "/",
        indexable: true,
        status: 200,
      };
    case "category":
      return { title: `${route.category.title} · ${BRAND}`, description: route.category.description, path, indexable: true, status: 200 };
    case "benefit":
      return { title: `${route.benefit.title} · ${BRAND}`, description: benefitPageDescription, path, indexable: true, status: 200 };
    case "legal": {
      const document = content.legal[route.slug];
      return {
        title: `${document.title} · ${BRAND}`,
        description: route.slug === "privacidad"
          ? "Cómo trata Praná: Nutrición y Bienestar los datos personales que compartes al contactarnos, y cómo ejercer tus derechos ARCO."
          : "Condiciones de uso del sitio de Praná: Nutrición y Bienestar en Cuautla, Morelos: información, reservas por WhatsApp y promociones.",
        path,
        indexable: true,
        status: 200,
      };
    }
    case "not-found":
      return { title: `Página no encontrada · ${BRAND}`, description: "La página que buscas no está disponible. Consulta los tratamientos de Praná en Cuautla.", path, indexable: false, status: 404 };
  }
}
