#!/bin/sh
# Genera las versiones WebP de public/img desde los originales de recursos/ (que no se tocan).
# Requiere cwebp (libwebp). Uso: npm run images
set -eu
cd "$(dirname "$0")/.."
src=recursos
out=public/img
mkdir -p "$out/iconos"

webp() { # origen destino ancho [calidad]
  cwebp -quiet -q "${4:-78}" -resize "$3" 0 "$src/$1" -o "$out/$2"
}

for w in 960 1440 1971; do
  webp hero-superior.png "hero-$w.webp" "$w"
  webp hero-inferior.png "filosofia-$w.webp" "$w"
done
webp background.png fondo-1280.webp 1280 70
webp logo-completo.png logo-prana.webp 640 85

webp tratemiento-1.png tratamientos-reductivos-640.webp 640
webp tratemiento-1.png tratamientos-reductivos-1024.webp 1024
webp tratamiento-2.png tratamientos-corporales-640.webp 640
webp tratamiento-2.png tratamientos-corporales-1024.webp 1024
webp tratamiento-3.png depilacion-laser-640.webp 640
webp tratamiento-3.png depilacion-laser-1024.webp 1024
webp tratamiento-4.png paquetes-promociones-640.webp 640
webp tratamiento-4.png paquetes-promociones-1024.webp 1024

# Iconos de Praná: se muestran a 32–64 px; 192 px cubre pantallas 3x.
for f in "$src"/*.png; do
  name=$(basename "$f" .png)
  case "$name" in
    hero-*|background|logo-completo|tratemiento-1|tratamiento-[234]) continue ;;
  esac
  cwebp -quiet -q 82 -resize 192 0 "$f" -o "$out/iconos/$name.webp"
done
echo "Imágenes generadas en $out"
