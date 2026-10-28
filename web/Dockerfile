# Web de Prana & Nutrición: una landing estática servida por nginx en el puerto 80.
# El CSS se compila con Tailwind en una etapa de build; la imagen final solo lleva nginx y los archivos.
FROM node:24.22-alpine3.24 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web/ web/
RUN npm run build
# Huella en el nombre del CSS y del JS: el navegador los guarda un año y cada cambio cambia el nombre
WORKDIR /app/web/public
RUN for f in assets/styles.css assets/main.js; do \
      h=$(sha256sum "$f" | cut -c1-10); n="${f%.*}.$h.${f##*.}"; \
      mv "$f" "$n"; sed -i "s#\"/$f\"#\"/$n\"#g" ./*.html; \
    done

FROM nginx:1.30-alpine

# TEMPORAL (2026-10-24): nginx 1.30.6-alpine trae brotli-libs 1.2.0-r1 (CVE-2026-111497), ya corregido
# en Alpine (1.2.1-r0). TEMPORAL (2026-10-26): curl y libcurl 8.22.0-r0 (CVE-2026-92392), corregidos en
# 8.23.0-r0. Quitar cada paquete del `apk upgrade` cuando la imagen lo incluya.
RUN apk upgrade --no-cache brotli-libs curl libcurl \
 && rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY web/default.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/web/public/ /usr/share/nginx/html/

USER 101:101
EXPOSE 80
