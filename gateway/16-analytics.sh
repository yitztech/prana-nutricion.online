#!/bin/sh
# Analítica con Umami: si hay UMAMI_SCRIPT_URL y UMAMI_WEBSITE_ID, el gateway inserta
# el script en el HTML y amplía la CSP con el origen de Umami. Sin valores no se carga
# nada de terceros.
#   UMAMI_SCRIPT_URL   p. ej. https://stats.yunitztech.com/script.js
#   UMAMI_WEBSITE_ID   UUID de la web en Umami
set -eu

# Se valida antes de generar archivos: ninguna entrada se interpola sin comprobarla.
script_url=${UMAMI_SCRIPT_URL:-}
website_id=${UMAMI_WEBSITE_ID:-}
if [ -n "$script_url" ] || [ -n "$website_id" ]; then
  if [ -z "$script_url" ] || [ -z "$website_id" ]; then
    echo "16-analytics.sh: UMAMI_SCRIPT_URL y UMAMI_WEBSITE_ID deben configurarse juntas" >&2
    exit 1
  fi
  if [ "$script_url" != "https://stats.yunitztech.com/script.js" ]; then
    echo "16-analytics.sh: UMAMI_SCRIPT_URL debe ser https://stats.yunitztech.com/script.js" >&2
    exit 1
  fi
  if ! printf '%s\n' "$website_id" | LC_ALL=C grep -Eq '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' ||
      [ "${#website_id}" -ne 36 ]; then
    echo "16-analytics.sh: UMAMI_WEBSITE_ID debe ser un UUID" >&2
    exit 1
  fi
fi

# La imagen es de solo lectura: lo generado va a /tmp/nginx/ (tmpfs), que incluye nginx.conf
nginx_dir=${NGINX_ENVSUBST_OUTPUT_DIR:-/tmp}/nginx
mkdir -p "$nginx_dir/snippets"
origin=""
snippet=$nginx_dir/snippets/analytics.conf
rm -f "$snippet"

if [ -n "$script_url" ]; then
  origin=https://stats.yunitztech.com
  cat > "$snippet" <<CONF
# Generado por 16-analytics.sh: script de Umami en las páginas HTML
proxy_set_header Accept-Encoding "";
sub_filter_once on;
sub_filter '</head>' '<script defer src="${script_url}" data-website-id="${website_id}"></script></head>';
CONF
fi

# Origen extra para script-src y connect-src de la CSP (vacío sin Umami)
# Las variables de nginx deben quedar literales para que nginx las evalúe por petición.
# shellcheck disable=SC2016
printf 'map $host $analytics_src { default "%s"; }\n' "${origin:+ $origin}" > "$nginx_dir/analytics.conf"
