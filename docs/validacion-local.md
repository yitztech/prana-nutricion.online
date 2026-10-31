# Validación local — 23 de octubre de 2026

Rama: `fix/fiabilidad-validacion-local`. Las siete mejoras del plan están implementadas y comprobadas en
local. No se hizo commit, push, publicación en GHCR ni despliegue.

## Cambios

| Mejora | Archivos principales | Resultado |
| --- | --- | --- |
| Auditoría fiable | `scripts/check-audit.mjs`, `tests/unit/check-audit.test.mjs` | Errores de ejecución, JSON incompleto, resúmenes incoherentes y referencias inválidas fallan. Las excepciones se aplican por aviso y fecha, también transitivamente. |
| Contacto recuperable | `web/public/assets/main.js`, `web/public/index.html` | Se conservan todos los datos, se ofrece «Continuar en WhatsApp» y se evita afirmar que se abrió la ventana. Repetir el mismo mensaje no duplica ventanas; editar invalida el enlace anterior. |
| Pruebas sobre el código actual | `scripts/test-all.mjs`, `scripts/local-web.mjs`, `package.json` | Reconstrucción y recreación predeterminadas. `--reuse` exige salud local; `E2E_BASE_URL` mantiene el destino externo explícito. Unitarias y E2E aparecen en el resumen. |
| Axe en la portada | `tests/e2e/features/plataforma/accesibilidad.feature`, `tests/e2e/steps/plataforma.js` | Se ejecutan todas las reglas aplicables salvo el contraste pendiente, que conserva su escenario independiente. |
| Mismas imágenes en todo el CI | `.github/workflows/deploy.yml`, `.github/scripts/imagenes-ci.sh` | Solo `Verificar` construye. Los demás jobs cargan el tar, comprueban checksums e IDs y publican sin reconstruir. Se conservan SBOM y procedencia mediante atestaciones por digest. |
| Pegado comprobable | `tests/e2e/steps/landing.js`, `tests/e2e/features/landing/formulario.feature` | El evento de pegado se acompaña de inserción mediante el editor del navegador. Se verifica el valor final, selección reemplazada, límites, aviso, contador y conservación del prefijo. |
| Configuración de Umami | `gateway/16-analytics.sh`, `tests/unit/analytics.test.mjs` | Ambas variables vacías desactivan la analítica. Se exige la pareja completa, URL exacta permitida y UUID antes de generar archivos. |

Se usaron Node **24.22.0** y npm **11.19.1**, con Tailwind **4.3.3**, Playwright **1.64.1** y
playwright-bdd **9.2.1**. No se cambiaron dependencias ni el lockfile. El proyecto es HTML/JavaScript
estático; no tiene backend, base de datos ni comando de typecheck.

## Resultados ejecutados

- `npm ci`, `npm run build` y `npm run check:audit`: correctos. La auditoría real no encontró avisos altos
  ni críticos; sus casos de error, excepciones y fechas se comprobaron con pruebas unitarias.
- `npm test`: **18 unitarias correctas; 99 E2E correctas, 0 fallidas, 0 inestables y 3 omitidas**. Las
  omisiones corresponden únicamente al contraste pendiente en Chromium, Pixel 7 e iPhone 15 emulados.
  Las tres ejecuciones completas reconstruyeron y recrearon los contenedores; las dos últimas también
  lo hicieron con el entorno anterior saludable. La última terminó en unos 47 segundos.
- `npm test -- --lista` y selección de suite con `npm test -- --reuse unit`: correctos. Los casos de
  reutilización saludable/no saludable y destino externo están cubiertos en `tests/unit/local-web.test.mjs`.
- `actionlint .github/workflows/deploy.yml`, ShellCheck de ambos scripts de shell, hadolint **2.14.0**
  de ambos Dockerfiles, reglas del compose y `git diff --check`: correctos.
- Trivy **0.76.0** sobre ambas imágenes finales, con `--scanners vuln --severity HIGH,CRITICAL
  --ignore-unfixed --exit-code 1 --format cyclonedx`: correcto, sin avisos en esos informes. Se generaron
  los dos SBOM CycloneDX.
- `imagenes-ci.sh guardar` y `cargar`: checksums e IDs conservados. Las comprobaciones negativas
  rechazaron un archivo alterado y un ID distinto incluso después de recalcular el checksum.
- Gateway real: salud, revisión `local`, cabeceras de seguridad y ambos servicios como usuario **101**.
  Umami desactivado y activado pasan `nginx -t`; configuraciones parciales, URL ajena y UUID inválido
  detienen el arranque. Con Umami activo se comprobó HTTP 200, una sola inserción del script y CSP
  limitada a `https://stats.yunitztech.com`. La espera de esta prueba consulta el estado HTTP hasta que
  el upstream está disponible.
- Revisión visual en escritorio y móvil: datos conservados, enlace accesible por teclado y sin
  desbordamiento horizontal. Capturas locales en `tests/e2e/results/visual/formulario-desktop.png` y
  `formulario-movil.png`; informe E2E en `tests/e2e/results/report/index.html`.

## Alcance pendiente

- El entorno queda disponible en **http://127.0.0.1:8091**. Ambos contenedores están saludables.
- No se ejecutaron GitHub Actions, CodeQL, ZAP, transferencias de artefactos en GitHub, push a GHCR,
  atestaciones remotas ni Coolify. Se verificaron localmente el workflow, sus scripts y el intercambio
  de imágenes; la integración con esos servicios queda por comprobar en GitHub.
- Se conserva la paleta aprobada. El contraste requiere decisión del cliente. Las excepciones del
  detector visual `low-contrast`, `gradient-text` y `clipped-overflow-container` se documentan en
  `.impeccable/config.json`, únicamente para `web/public/index.html`. No desactivan axe ni reglas en
  otras páginas. El degradado y el recorte decorativo existentes se mantienen dentro del alcance
  aprobado, sin rediseño.
- Siguen pendientes la razón social y la revisión de los textos legales, como ya indica `AGENTS.md`.

## Revisión de los diez avisos posteriores del detector

Se compararon con `git show HEAD:web/public/index.html` y se comprobaron los estilos calculados en el
navegador. Los diez corresponden a elementos existentes antes de esta sesión. La única adición al HTML
de la portada sigue siendo el enlace de recuperación del formulario; no se modificó el diseño para
resolver estos avisos.

| Regla | Avisos | Clasificación y evidencia |
| --- | --- | --- |
| `all-caps-body` | 2 | Falsos positivos: rótulos breves («Clínica de Belleza Integral» y «Nuestra Filosofía»), no párrafos en mayúsculas. |
| `cramped-padding` | 3 | Falsos positivos en envolturas estructurales: sus hijos aportan el relleno. Servicios tiene 96 px verticales en la sección y 96 px horizontales en el contenido de escritorio; los paneles de contacto usan `p-10 md:p-16`. |
| `buried-raster` | 1 | Falso positivo: `patron-cruces` es un SVG decorativo en una data URI con opacidad 0.1, sin fotografía oculta. |
| `tight-leading` | 1 | Excepción del diseño conservado: títulos y cita grande usan interlineado 1.0. Ajustarlo requiere ampliar el alcance visual; no se presenta como una regresión. |
| `kicker-above-heading` | 2 | Excepción del diseño conservado: los dos rótulos ya existían y no se autorizó rediseñar la portada. |
| `cream-palette` | 1 | Excepción de la paleta aprobada: fondo `champagne`, `rgb(250, 246, 242)`. |

Se persistieron las seis excepciones mediante `impeccable hooks ignore-value`, limitadas a
`web/public/index.html` y con su motivo en `.impeccable/config.json`. No se desactivaron reglas globales,
no se ignoró el archivo completo y no se alteraron las comprobaciones de axe. El contraste continúa
pendiente como se documentó arriba. En esta revisión solo se cambiaron configuración del detector y
este informe: se ejecutó `git diff --check`, sin repetir las suites de producto ya verificadas.
