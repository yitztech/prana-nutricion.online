/**
 * Dirección del sitio público a partir de la del editor: admin.<dominio> → <dominio>. En el entorno
 * local de pruebas el editor es localhost y el sitio 127.0.0.1, en el mismo puerto (compose.ci.yml).
 */
export function siteUrl(path = "/") {
  const { protocol, hostname, port } = window.location;
  const host = hostname.startsWith("admin.") ? hostname.slice("admin.".length) : hostname === "localhost" ? "127.0.0.1" : hostname;
  return `${protocol}//${host}${port ? `:${port}` : ""}${path}`;
}
