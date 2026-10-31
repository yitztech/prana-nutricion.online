# Servicio `web` de Praná: nginx sirve el sitio que genera `app` (volumen `site`, solo lectura),
# las imágenes subidas (volumen `uploads`) y el editor (/admin/). La imagen no lleva páginas:
# las escribe `app` al arrancar y tras cada cambio del editor.
FROM nginx:1.30-alpine

# TEMPORAL (2026-10-19): nginx 1.30.6-alpine aún trae libexpat 2.8.5 (CVE-2026-77214) y libx11 1.8.13
# (CVE-2026-88806), ya corregidos en Alpine. Quitar el `apk upgrade` cuando la imagen los incluya.
RUN apk upgrade --no-cache libexpat libx11 \
 && rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY web/default.conf /etc/nginx/conf.d/web.conf

USER 101:101
EXPOSE 80
