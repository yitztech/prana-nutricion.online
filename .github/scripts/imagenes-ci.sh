#!/bin/sh
# El artefacto conserva las imágenes verificadas y sus IDs; ningún consumidor las reconstruye.
set -eu
: "${IMAGE_PREFIX:?Define IMAGE_PREFIX}" "${IMAGE_TAG:?Define IMAGE_TAG}"
accion=${1:?Uso: imagenes-ci.sh guardar|cargar DIRECTORIO}
directorio=${2:?Falta el directorio del artefacto}

case "$accion" in
  guardar)
    mkdir -p "$directorio"
    for servicio in gateway web app; do
      docker image inspect --format '{{.Id}}' "$IMAGE_PREFIX-$servicio:$IMAGE_TAG" > "$directorio/$servicio.id"
    done
    docker image save --output "$directorio/imagenes.tar" "$IMAGE_PREFIX-gateway:$IMAGE_TAG" "$IMAGE_PREFIX-web:$IMAGE_TAG" "$IMAGE_PREFIX-app:$IMAGE_TAG"
    (cd "$directorio" && shasum -a 256 imagenes.tar gateway.id web.id app.id gateway.cdx.json web.cdx.json app.cdx.json > SHA256SUMS)
    ;;
  cargar)
    (cd "$directorio" && shasum -a 256 -c SHA256SUMS)
    docker image load --input "$directorio/imagenes.tar"
    for servicio in gateway web app; do
      actual=$(docker image inspect --format '{{.Id}}' "$IMAGE_PREFIX-$servicio:$IMAGE_TAG")
      esperado=$(cat "$directorio/$servicio.id")
      if [ "$actual" != "$esperado" ]; then
        echo "La imagen de $servicio no coincide con la verificada" >&2
        exit 1
      fi
      printf '%s: %s (verificado)\n' "$servicio" "$actual"
    done
    ;;
  *) echo "Acción desconocida: $accion" >&2; exit 2 ;;
esac
