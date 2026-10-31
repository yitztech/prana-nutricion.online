export function benefitHref(id: string) {
  return `/beneficios/${encodeURIComponent(id)}/`;
}

export function benefitIdFromPath(pathname: string) {
  return /^\/beneficios\/([a-z0-9-]+)\/?$/.exec(pathname)?.[1] ?? null;
}
