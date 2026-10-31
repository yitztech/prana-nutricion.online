/** Enlaces nativos: funcionan con Atrás, recarga, teclado y apertura en otra pestaña. */
export function treatmentCategoryHref(categoryId: string, slug?: string) {
  const path = `/tratamientos/${encodeURIComponent(categoryId)}/`;
  return slug ? `${path}#${encodeURIComponent(slug)}` : path;
}

export function categoryIdFromPath(pathname: string) {
  const match = /^\/tratamientos\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match?.[1] ?? null;
}
