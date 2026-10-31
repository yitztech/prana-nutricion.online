import type { LegalSlug } from "../types/index.ts";

/** Las mismas URL que la web anterior: los buscadores y los enlaces existentes siguen sirviendo. */
export function legalPath(slug: LegalSlug) {
  return `/${slug}`;
}

export function legalSlugFromPath(pathname: string): LegalSlug | null {
  const match = /^\/(privacidad|condiciones)\/?$/.exec(pathname);
  return (match?.[1] as LegalSlug | undefined) ?? null;
}
