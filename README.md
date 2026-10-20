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
gateway/                  # nginx delante de todo: IP real, cabeceras, X-Request-ID, /version.json, Umami
web/
  src/styles.css          # Tailwind CSS 4: tema (colores, fuentes) y utilidades propias
  public/                 # la web: index.html, privacidad.html, condiciones.html, 404.html, robots, sitemap
    assets/               # main.js, iconos.svg, fuentes/ e img/ (WebP)
  Dockerfile              # compila el CSS (Node) y sirve con nginx
tests/e2e/                # escenarios en Gherkin (playwright-bdd): plataforma/ y landing/
scripts/                  # test-all.mjs (npm test) y check-audit.mjs (npm audit con excepciones)
.github/workflows/
  deploy.yml              # Verificar, Escenarios y Seguridad → publicar en GHCR → Coolify → comprobar el SHA
  semanal.yml             # Firefox, Trivy y humo contra producción, cada lunes
```

## Desarrollo

Node 24.22 (`.nvmrc`) y Docker.

```bash
npm ci
npm run dev        # recompila el CSS al guardar; abrir web/public con cualquier servidor estático
npm test           # construye las imágenes, levanta el compose y ejecuta todos los escenarios
npm run e2e -- --grep @smoke    # solo los imprescindibles
npm run e2e:ver    # una ventana, escenario a escenario y a ritmo humano
npm run e2e:summary
```

La web en local, tal como se publica: `docker compose -f compose.prod.yml -f compose.ci.yml up -d --wait`
(con `IMAGE_PREFIX=local/ci IMAGE_TAG=ci TRUSTED_PROXY_CIDR=127.0.0.1/32` y las imágenes construidas, como hace
`npm test`) y abrir http://127.0.0.1:8091.

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

1. **`Verificar`**: `npm ci`, build del CSS, `npm run check:audit`, hadolint,
   [`reglas-compose.sh`](.github/scripts/reglas-compose.sh), prueba de humo con el compose de producción
   (`/healthz`, `/version.json`, cabeceras, ningún servicio como root) y Trivy sobre cada imagen.
2. **`Escenarios`**: `npm run e2e` contra esas imágenes, en Chromium, Pixel 7 e iPhone 15 emulados.
3. **`Seguridad`**: CodeQL (JavaScript y Actions) y ZAP pasivo.

Las acciones de terceros van fijadas por commit. Lo que la plataforma pone en el entorno `production`
(`COOLIFY_WEBHOOK`, `COOLIFY_TOKEN`, `SITE_URL`) lo gestiona el alta: no se crea a mano.

## Contrato con la plataforma

- **Variables** que pone el alta: `SITE_URL`, `SMTP_*`, `MAIL_FROM`, `LISTMONK_*`, `UMAMI_*`. Hoy la web solo
  usa `UMAMI_SCRIPT_URL` y `UMAMI_WEBSITE_ID` (el gateway inserta el script de Umami). Un secreto nuevo se
  declara en la ficha con `cliente_web_env_secretos`.
- **`TRUSTED_PROXY_CIDR`**: la subred de Traefik en la red de la app, medida tras el primer arranque
  (`docs/OPERACION.md` §4.3 de infra-ionos-vps) y fijada en la ficha.
- **Correo** `contacto@prana-nutricion.online` (con `info@` y `hola@`) en el Stalwart de la plataforma, y
  newsletter en `https://news.prana-nutricion.online` (Listmonk), aunque la web aún no los usa.
