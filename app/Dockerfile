# Servicio `app` de Praná: API del editor, generación del sitio estático y cola de trabajos.
# Se construye desde la raíz del repositorio: docker build -f app/Dockerfile .
# Node ejecuta TypeScript directamente (type stripping): la imagen lleva el código fuente del servicio,
# las dependencias de producción y el build de la web (cliente y SSR) con el que genera las páginas.
FROM node:24.22-alpine3.24 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY shared/ shared/
COPY web/ web/
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:24.22-alpine3.24
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/web/dist/ web/dist/
COPY shared/ shared/
COPY app/src/ app/src/
COPY app/migrations/ app/migrations/
# Sin herramientas de desarrollo en la imagen final (§31): npm, npx y corepack no se usan al ejecutar
# y el npm de la imagen base arrastra sus propias vulnerabilidades. Volúmenes del compose: Docker copia
# este dueño al crearlos (sitio generado e imágenes subidas).
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
 && mkdir -p /srv/site /srv/uploads && chown node:node /srv/site /srv/uploads
# Usuario node de la imagen oficial, por UID: Kubernetes y Docker lo comprueban sin consultar /etc/passwd
USER 1000:1000
EXPOSE 3000
CMD ["node", "app/src/index.ts"]
