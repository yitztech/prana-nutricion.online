# prana-nutricion.online

Web de **Prana & Nutrición**, clínica de belleza integral en Cuautla, Morelos: nutrición moldeadora, cuidado
de la piel y recuperación postoperatoria. Una landing estática en español, con aviso de privacidad,
condiciones de uso y un formulario que abre WhatsApp con el mensaje ya escrito.

Creado desde la plantilla de **yitztech** por el alta de clientes
([infra-ionos-vps](https://github.com/yprevot/infra-ionos-vps), playbook `cliente-alta`, ficha
`clientes/prana-nutricion.yml`). Se despliega en modo **imágenes**: GitHub Actions construye y publica en
GHCR, y Coolify (VPS1) solo descarga y arranca. El servidor nunca compila.

```
AGENTS.md, CLAUDE.md      # estándares de desarrollo; lo propio del proyecto, al final de AGENTS.md
compose.prod.yml          # producción en Coolify: gateway + web
compose.ci.yml            # pruebas: el mismo compose con el gateway en 127.0.0.1:8091
nginx/nginx.conf          # nginx sin root y de solo lectura, común a gateway y web
gateway/                  # nginx delante de todo: reparte por dominio (sitio y editor), IP real, cabeceras, X-Request-ID, /version.json, Umami
web/
  src/styles.css          # Tailwind CSS 4: tema Prana y tokens de shadcn/ui
  src/pages/              # JSX y plantillas HTML: portada, legales y 404
  src/components/ui/      # componentes shadcn/ui locales
  src/render.jsx          # React genera HTML estático, sin hidratación
  public/                 # HTML generado, robots y sitemap
    assets/               # main.js, iconos.svg, fuentes/ e img/ (WebP)
  Dockerfile              # compila el CSS (Node) y sirve con nginx
tests/e2e/                # escenarios en Gherkin (playwright-bdd): plataforma/ y landing/
tests/unit/               # node:test: auditoría, preparación local y configuración de Umami (sin Docker)
scripts/                  # test-all.mjs, local-web.mjs y check-audit.mjs
.github/scripts/imagenes-ci.sh # exporta/carga las imágenes verificadas, sus IDs y SBOM, con checksum
.github/workflows/
  deploy.yml              # Verificar, Escenarios y Seguridad → publicar en GHCR → Coolify → comprobar el SHA
  semanal.yml             # Firefox, Trivy y humo contra producción, cada lunes
```

## Desarrollo

Node 24.22 (`.nvmrc`) y Docker.

```bash
npm ci
npm run dev        # regenera HTML y CSS al guardar web/src; servir web/public con un servidor estático
npm test           # unitarias, reconstruye/recrea el compose y ejecuta los escenarios con su resumen
npm test -- --reuse # reutiliza expresamente el compose saludable (puede contener código anterior)
npm test -- --lista # muestra las suites; npm test -- unit o npm test -- e2e ejecuta solo una
npm run test:unit  # sin Docker
npm run e2e -- --grep @smoke    # solo los imprescindibles
npm run e2e:ver    # una ventana, escenario a escenario y a ritmo humano
npm run e2e:summary
```

La web en local, tal como se publica: `docker compose -f compose.prod.yml -f compose.ci.yml up -d --wait`
(con `IMAGE_PREFIX=local/ci IMAGE_TAG=ci TRUSTED_PROXY_CIDR=127.0.0.1/32` y las imágenes construidas, como hace
`npm test`) y abrir http://127.0.0.1:8091.

Sin `--reuse`, cada ejecución reconstruye y recrea los contenedores aunque ya estén saludables.
`E2E_BASE_URL` mantiene el destino externo explícito: no construye ni modifica servicios locales.
El formulario conserva los datos y ofrece «Continuar en WhatsApp» después del intento de apertura;
preparar dos veces el mismo mensaje enfoca ese enlace y evita ventanas duplicadas. Si se edita un campo,
se prepara de nuevo el mensaje al pulsar «Agendar Valoración».

## Reglas de la plataforma

- El dominio va **solo** al servicio `gateway`, en el puerto 80. El resto de servicios no publica puertos.
- **Todo servicio lleva `mem_limit`**: varios clientes comparten servidor. El alta se detiene si falta.
- La configuración va dentro de las imágenes; el compose no monta archivos del repositorio.
- `/version.json` devuelve el commit desplegado: el workflow espera a verlo para dar el despliegue por bueno.
- **Sin root y con el sistema de archivos de solo lectura** (`read_only: true`): cada servicio escribe solo en
  sus volúmenes y en `/tmp` (tmpfs). Lo trae el bloque `x-hardening`, junto con `cap_drop: [ALL]`,
  `no-new-privileges` y la rotación de logs.
- Cada servicio responde `/healthz` para su `healthcheck`, y el gateway espera a que estén sanos.
- El gateway pasa a cada servicio `X-Request-ID`: el mismo identificador en todos los logs de una petición.
- Lo que un agente o una persona deben cumplir al escribir el código está en [`AGENTS.md`](AGENTS.md).

Las reglas completas, y cómo se auditan, están en `docs/AUDITORIA.md` de infra-ionos-vps.

## CI

Cada PR y cada push a `main` pasan por tres checks, los que exige la regla de `main`; solo si pasan, `main`
publica en GHCR y despliega:

1. **`Verificar`**: `npm ci`, `npm run test:unit`, build de HTML y CSS, `npm run check:audit`, hadolint,
   [`reglas-compose.sh`](.github/scripts/reglas-compose.sh), prueba de humo con el compose de producción
   (`/healthz`, `/version.json`, cabeceras, ningún servicio como root) y Trivy sobre cada imagen.
2. **`Escenarios`**: `npm run e2e` contra esas imágenes, en Chromium, Pixel 7 e iPhone 15 emulados.
3. **`Seguridad`**: CodeQL (JavaScript y Actions) y ZAP pasivo.

Solo `Verificar` construye las imágenes. Exporta `imagenes-verificadas` (tar de Docker, IDs, SBOM CycloneDX
y checksums SHA-256); `Escenarios`, `Seguridad` y `Publicar` cargan ese artefacto y comprueban su integridad.
`Publicar` cambia las etiquetas y hace push, sin build, y registra los digests de GHCR en el resumen. Las
atestaciones de procedencia y SBOM se adjuntan al digest publicado con `actions/attest`, sin reconstrucción.
El intercambio sigue el [patrón oficial de Docker para compartir imágenes entre jobs](https://docs.docker.com/build/ci/github-actions/share-image-jobs/).

La portada y las páginas legales ejecutan axe con todas las reglas aplicables, incluido `color-contrast`.
El diseño de reserva aprobado conserva un escenario específico de contraste como comprobación de regresión.
Los resultados y límites de la comprobación local están en [la validación del cambio](docs/validacion-local.md).

Las acciones de terceros van fijadas por commit. Lo que la plataforma pone en el entorno `production`
(`COOLIFY_WEBHOOK`, `COOLIFY_TOKEN`, `SITE_URL`) lo gestiona el alta: no se crea a mano.

## Contrato con la plataforma

- **Variables** que pone el alta: `SITE_URL`, `SMTP_*`, `MAIL_FROM`, `LISTMONK_*`, `UMAMI_*`. Hoy la web solo
  usa `UMAMI_SCRIPT_URL` y `UMAMI_WEBSITE_ID` (el gateway inserta el script de Umami). Un secreto nuevo se
  declara en la ficha con `cliente_web_env_secretos`.
- **Umami**: ambas variables vacías desactivan la analítica. Si se activa, las dos son obligatorias:
  `UMAMI_SCRIPT_URL=https://stats.yunitztech.com/script.js` y `UMAMI_WEBSITE_ID` con formato UUID.
  Una configuración parcial o inválida impide el arranque del gateway.
- **Editor en su propio dominio**: `ADMIN_URL` (por defecto `https://admin.prana-nutricion.online`). El gateway
  sirve el panel y la API del editor solo en ese host; el dominio público responde 404 en `/admin` y en `/api/`,
  salvo `/api/health`. La app solo acepta escrituras con ese `Origin` (CSRF), los correos de contraseña enlazan
  allí y la cookie `__Host-` (sin `Domain`) nunca llega al sitio público. El DNS y el dominio en Coolify/Traefik
  (al servicio `gateway`, puerto 80) los pone el alta en infra-ionos-vps. En local, el sitio es
  `http://127.0.0.1:8091` y el editor `http://localhost:8091` (`E2E_ADMIN_URL` para otro destino).
- **`TRUSTED_PROXY_CIDR`**: la subred de Traefik en la red de la app, medida tras el primer arranque
  (`docs/OPERACION.md` §4.3 de infra-ionos-vps) y fijada en la ficha.
- **Correo** `contacto@prana-nutricion.online` (con `info@` y `hola@`) en el Stalwart de la plataforma, y
  newsletter en `https://news.prana-nutricion.online` (Listmonk), aunque la web aún no los usa.

## Componentes shadcn/ui

La interfaz se compone con React 19 y componentes locales de shadcn/ui (base Radix), usando esbuild solo
para el prerenderizado. El navegador recibe HTML estático, CSS y el JavaScript de navegación/WhatsApp;
no descarga React. Las rutas, metadatos, JSON-LD, recursos locales y despliegue nginx se mantienen.

Editar `web/src/pages/*.jsx` para el contenido y `web/src/pages/*.html` para las cabeceras. Los archivos
`web/public/*.html` y `assets/styles.css` son generados por `npm run build` y no se versionan. Los tokens
semánticos en `web/src/styles.css` conservan la paleta de Prana. `components.json` configura el CLI;
`npx shadcn@latest info` muestra los componentes y `npx shadcn@latest docs <componente>` su documentación.

La skill está incluida en [`.agents/skills/shadcn/SKILL.md`](.agents/skills/shadcn/SKILL.md), con sus reglas
y referencias para que otros checkouts puedan usarla. Antes de añadir un componente interactivo con estado
React, evaluar su necesidad de hidratación: los componentes actuales se prerenderizan y el comportamiento
progresivo del menú y del formulario lo mantiene `web/public/assets/main.js`.


## Reserva directa

La portada ofrece enlaces de valoración en cabecera, primera pantalla, cada tratamiento y contacto; en móvil,
una barra fija conserva la acción al recorrer la página, con espacio inferior para no cubrir el contenido.
Los enlaces nativos de `BookingLink` abren WhatsApp con un mensaje preparado y funcionan sin JavaScript.
No confirman una cita: la clínica acuerda día y hora por WhatsApp. El formulario queda como alternativa
para preparar un mensaje más detallado, con las mismas validaciones y recuperación ante ventanas bloqueadas.

`web/src/lib/booking.js` centraliza las URL de reserva directa. Los enlaces llevan atributos de evento Umami
`reserva-whatsapp` con origen y servicio; solo se registrarán si la analítica está activada. Un clic no equivale
a una cita confirmada. Las pruebas interceptan la navegación a WhatsApp y no envían mensajes reales.
