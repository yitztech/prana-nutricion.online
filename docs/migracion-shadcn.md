# Migración a shadcn/ui

Rama: `codex/migracion-shadcn`. Fecha: 2026-10-29.

## Alcance y arquitectura

- Skill shadcn copiada con sus reglas y referencias a `.agents/skills/shadcn/`. En este equipo también se
  instaló en `/Users/user/.codex/skills/shadcn/`; la instalación global queda fuera de Git.
- Configuración oficial del CLI en `components.json`: base Radix, JavaScript, Tailwind 4, alias `@/`.
- Botones, inputs, textarea, selector nativo, campos/labels, tarjetas de servicios y separador proceden del
  registro oficial de shadcn/ui y viven en `web/src/components/ui/`. Se adaptaron las variantes a Prana.
- React y React DOM se usan solo al compilar. `scripts/build.mjs` empaqueta el renderizador con esbuild,
  genera las cuatro páginas mediante `renderToStaticMarkup` y compila Tailwind. No se envía React al navegador.
- Contenido en `web/src/pages/*.jsx`; cabeceras, metadatos y JSON-LD en sus plantillas `.html`.
  `web/public/*.html` es salida generada e ignorada por Git. La imagen Docker ejecuta el mismo build.
- El JavaScript progresivo existente mantiene navegación, menú móvil y WhatsApp, con los mismos IDs. Se añadió
  `data-invalid` al contenedor Field para reflejar sus errores. Los iconos conservan el sprite local existente.
- Los cambios locales de contraste que había al empezar en `proposal/contraste-accesibilidad` se conservaron
  en el JSX y los estilos. No se editaron las partes normativas de `AGENTS.md`; se actualizó su sección del proyecto.

## Validación local

Runtime: Node 24.22.0, npm del mismo runtime y Docker local.

```sh
npm ci
npm run build
npm run test:unit
npm run check:audit
npm test
```

- Instalación reproducible y build HTML/CSS correctos. Las dependencias que ya existían mantienen sus versiones.
- 19 pruebas unitarias correctas, incluida una nueva prueba del artefacto HTML: cuatro rutas, SEO, controles
  y límites del formulario, y ausencia de runtime React en las páginas.
- 99 escenarios E2E correctos, 0 fallidos y 0 inestables en Chromium, Pixel 7 y iPhone 15 emulados.
- Los 3 escenarios de contraste marcados previamente con `@pendiente` siguen omitidos. La suite de portada
  comprueba axe salvo contraste; las páginas legales conservan axe completo. No se afirma WCAG AA completa.
- Auditoría npm: 0 vulnerabilidades en el informe de instalación; `check:audit` pasa.
- Inspección visual a 390, 768 y 1440 px, imágenes cargadas, sin errores JavaScript. Verificado el estado
  `aria-invalid` de los controles y `data-invalid` de Field; contenido disponible sin JavaScript.
- Build de imágenes y arranque del compose de producción con el override de CI: saludables. Las pruebas
  verifican las rutas, cabeceras, metadatos, navegación y recuperación del mensaje de WhatsApp.

## Límites

No se ha publicado ni desplegado en producción, ni se ha ejecutado el CI remoto. Las comprobaciones móviles
son de navegador emulado, no de dispositivos físicos. Siguen pendientes la decisión de contraste y la revisión
legal indicadas previamente en el proyecto.

Los componentes que necesiten estado React en el navegador (Dialog, Select personalizado, etc.) requieren
una decisión explícita de hidratación. El selector actual es NativeSelect y funciona con el JavaScript progresivo.
