#!/bin/sh
# Dominio del editor: el gateway sirve el panel y su API solo en el host de ADMIN_URL
# (p. ej. https://admin.prana-nutricion.online). Cualquier otro host es el sitio público.
#   ADMIN_URL   origen del editor, sin ruta
set -eu

admin_url=${ADMIN_URL:-}
if [ -z "$admin_url" ]; then
  echo "17-admin.sh: falta ADMIN_URL (p. ej. https://admin.prana-nutricion.online)" >&2
  exit 1
fi
# Solo un origen: esquema, host en minúsculas y, en local, el puerto. Se valida antes de interpolarlo.
if ! printf '%s\n' "$admin_url" | LC_ALL=C grep -Eq '^https?://[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?(:[0-9]{1,5})?/?$' ||
    [ "$(printf '%s' "$admin_url" | wc -l)" -ne 0 ]; then
  echo "17-admin.sh: ADMIN_URL debe ser un origen como https://admin.prana-nutricion.online" >&2
  exit 1
fi
host=${admin_url#*://}
host=${host%/}
host=${host%%:*}

nginx_dir=${NGINX_ENVSUBST_OUTPUT_DIR:-/tmp}/nginx
mkdir -p "$nginx_dir/snippets"
printf '# Generado por 17-admin.sh\nserver_name %s;\n' "$host" > "$nginx_dir/snippets/admin-host.conf"
