# Nuevo diseño de Praná

Implementación de `Mockup.png` con React 19, TypeScript, Vite, Tailwind CSS 4 y shadcn/ui. Es independiente de
la landing publicada (`web/`): todavía no se construye ni se despliega desde aquí.

```bash
cd design
npm ci
npm run dev       # http://localhost:5173
npm run build     # typecheck + build en dist/
npm test          # promociones y reglas del sistema de diseño (node:test)
npm run e2e       # escenarios UI; usa Playwright y playwright-bdd de la raíz (npm ci allí primero)
npm run images    # regenera public/img (WebP) desde recursos/ (necesita cwebp)
```

- `recursos/`: originales aprobados, sin tocar. `public/img/`: WebP derivados (hero en 960/1440/1971 px,
  categorías en 640/1024 px, iconos a 192 px).
- Los iconos de Praná son PNG opacos sobre blanco; `PranaIcon` los funde (`mix-blend-multiply`) con su disco
  (`--icon-surface`), así que se ven igual en claro y en oscuro.
- El logo son dos máscaras (`logo-mandala.webp` y `logo-texto.webp`) que `npm run images` genera con
  `scripts/logo-masks.mjs`; sus colores salen de `--logo-mark` y `--logo-ink`.
- Contenido general en `src/data/`: `site.ts` (navegación, contacto y redes) y `promotions.ts`.
  El catálogo y las fichas pertenecen a `src/features/treatments/data/catalog.ts`. Tipos compartidos en `src/types/`.
- Promociones: se distinguen las vigentes de las próximas según la fecha de Cuautla. Reset Praná está
  programada para el Buen Fin 2026 (13–17 de noviembre); se anuncia como próxima antes de ese periodo y se retira al vencer.
- Los horarios no están confirmados: `contact.hours` es `null` y se remite a WhatsApp.
- Las promociones muestran únicamente los importes e inclusiones confirmados. No se prometen resultados
  garantizados; la clínica confirma la idoneidad del tratamiento y las condiciones en la valoración.
- Las reservas abren WhatsApp con el mensaje preparado (`src/lib/booking.ts`); nunca confirman una cita.

## Sistema de diseño

Todo lo visual vive en variables CSS y en las primitivas de `components/ui/` (compartidas) y
`components/brand/ui/` (propias de Praná). El resto de componentes solo compone.

### Estilos (`src/styles/`)

| Capa | Archivo | Qué contiene |
|---|---|---|
| Paleta | `palettes/prana.css` | Colores en bruto (`--prana-rosa-700`, `--prana-noche-900`…). Ningún componente los usa |
| Temas | `themes.css` | Roles semánticos en `:root` (claro) y `.dark` (oscuro): `--primary`, `--heading`, `--script`, `--cta-from`… |
| Tailwind | `theme.css` | Conecta los roles con clases (`bg-primary`, `text-heading`) y fija la escala propia (`text-display`, `max-w-site`) |
| Base | `base.css` | Elementos HTML |
| Utilidades | `utilities.css` | Degradados (`bg-gradient-cta`), máscaras (`fade-x`), encuadres (`object-face-right`) y rejillas con nombre |

- **Cambiar de paleta**: crear otro archivo en `palettes/` con los mismos nombres e importarlo en `styles/index.css`.
  Los componentes no cambian.
- **Modo oscuro**: la clase `.dark` en `<html>`. `public/theme.js` la pone antes de pintar (elección guardada o
  preferencia del sistema). Un único `ThemeProvider` en `main.tsx` mantiene esa clase y comunica la elección a
  todos los consumidores de `useTheme()`. Un rol nuevo se define en los dos bloques de `themes.css`.
- **Fotos con texto encima** se oscurecen en modo oscuro (`photo-dim`, `--photo-brightness`).
- `styles/tokens.ts` enumera la escala y las utilidades propias para `cn()` (tailwind-merge): sin eso,
  `text-display` se tomaría por un color y se perdería.

### Componentes (`src/components/`)

| Carpeta | Para qué | Ejemplos |
|---|---|---|
| `ui/` | Primitivas compartidas: shadcn/ui y componentes sin conocimiento del catálogo o la marca | `Button` (`default`, `outline`, `ghost`…), `Card`, `Heading`, `Text`, `Script`, `Surface`, `Photo` |
| `brand/ui/` | Primitivas visuales propias de Praná, con variantes CVA y tokens semánticos | `BrandButton` (`cta`, `chip`, `list`, `tile`, `benefit`, `social`), `PranaIcon`, `Logo` |
| `brand/` | Piezas de Praná hechas con primitivas | `BookingButton`, `SocialLinks`, `ThemeToggle` |
| `patterns/` | Bloques reutilizables de contenido | `CategoryCard`, `BenefitItem`, `PromotionCard`, `ContactItem` |
| `sections/` | Secciones de la página: datos de `src/data/` + patterns | `Hero`, `TreatmentCatalog`, `Philosophy`… |
| `layout/` | Cabecera, pie y barra móvil | |

### Reglas (las comprueba `npm test`, en `src/styles/design-system.test.ts`)

1. Ningún `.tsx` escribe colores: ni hex, ni `rgb()`, ni colores de Tailwind (`bg-white`), ni `dark:`, ni `style={}`.
2. Fuera de `components/ui/` y `components/brand/ui/`, las clases solo componen (display, rejilla, espacio, tamaño, posición, visibilidad): sin
   valores `[arbitrarios]`, color, tipografía, bordes de color, radios ni sombras.
3. Claro y oscuro definen los mismos roles, y cada rol apunta a un color de la paleta.
4. La escala de `theme.css` y las utilidades de `utilities.css` coinciden con `styles/tokens.ts`.

**Para añadir algo visual**: buscar primero una variante existente. Si no la hay, añadir la variante a la
primitiva compartida de `ui/` o de `brand/ui/` si es específica de Praná (con un comentario de para qué sirve) y usarla por su nombre. Si necesita un color nuevo,
añadir el rol en los dos temas de `themes.css`, conectarlo en `theme.css` y, si hace falta, el color en la paleta.

## Arquitectura frontend

La aplicación usa composición de React, variantes tipadas y funcionalidades con entrada pública.
No necesita un gestor de estado externo ni una capa de API mientras los datos sean locales.

### Tratamientos

Todo acceso externo se hace por `@/features/treatments` (`index.ts`). La funcionalidad contiene:

- `data/catalog.ts`: catálogo y textos comunes de las fichas.
- `model/selection.ts`: resolución de referencias; una categoría inexistente, un tratamiento ajeno a ella o
  una categoría vacía no abren una ficha equivocada.
- `model/use-treatment-selection.ts`: apertura, selección y cierre.
- `model/treatment-dialog-context.ts`: acción compartida `openTreatment` y su hook de acceso.
- `components/TreatmentDialog.tsx`: vista que recibe datos y callbacks por props, sin consultar el catálogo ni el estado.
- `treatment-dialog-provider.tsx`: conecta catálogo, estado, contexto y vista; conserva un único diálogo para toda la página.
- `model/routes.ts`: construye las URLs de categoría y resuelve la ruta actual.
- `treatment-page.tsx`: conecta los textos comunes con la vista `components/TreatmentCategoryPage.tsx`.

El catálogo «Encuentra tu tratamiento» y los enlaces del pie navegan mediante enlaces nativos a cuatro páginas:

| Categoría | URL |
|---|---|
| Reductivos | `/tratamientos/reductivos/` |
| Corporales | `/tratamientos/corporales/` |
| Depilación láser | `/tratamientos/depilacion-laser/` |
| Paquetes y promociones | `/tratamientos/promociones/` |

Cada página contiene la foto, descripción, índice de tratamientos, apartados enlazables (`#slug`), posibles
beneficios, notas y enlaces de valoración a WhatsApp. La cabecera enlaza de regreso a las secciones de inicio.
Las promociones enlazan a las páginas de sus tratamientos incluidos. La franja de objetivos navega a las páginas descritas abajo. No se añade un router ni dependencias.

`vite.config.ts` genera un `index.html` por categoría dentro de `dist/tratamientos/`, con título y descripción
propios, además de los recursos compartidos. Así las URLs admiten acceso directo y recarga en un servidor
estático con índices de directorio, sin depender de un fallback de SPA. El contenido sigue montándose con React;
estos documentos no son un prerenderizado del contenido. El despliegue publicado de `web/` no cambia.

Los tipos compartidos de referencias y contenido siguen en `src/types/`, sin dependencias de React.
Si el catálogo pasa a una API, la carga y sus estados se incorporan dentro de la funcionalidad, manteniendo
su entrada pública y la vista independiente del origen de datos.

### Dirección de dependencias

`src/architecture/boundaries.ts` declara las capas permitidas y `npm test` comprueba los imports con el
parser de Vite 8. Analiza imports estáticos, dinámicos literales, tipos y reexportaciones, con alias y rutas relativas.

| Capa | Dependencias locales permitidas |
|---|---|
| `ui` | `ui`, `lib`, `styles` |
| `brand/ui` | `brand/ui`, `ui`, `lib`, `styles`, `types` |
| `brand` | `brand`, `brand/ui`, `ui`, `hooks`, `lib`, `types` |
| `features/<nombre>` | Su interior, entradas públicas de otras funcionalidades, `brand`, `brand/ui`, `ui`, `hooks`, `lib`, `types` |
| `patterns` | `patterns`, marca, UI, entradas públicas de funcionalidades, `data`, `hooks`, `lib`, `types` |
| `sections`, `layout` | `patterns`, marca, UI, entradas públicas de funcionalidades, `data`, `hooks`, `lib`, `types` |
| `providers` | `hooks`, `lib`, `types` |
| `hooks` | `hooks`, `lib`, `types` |
| `data` | `data`, `lib`, `types` |
| `lib` | `lib`, `styles`, `types` |
| `styles`, `types` | Solo su propia capa |

`main.tsx` y `App.tsx` ensamblan los proveedores y la página. Ningún consumidor externo importa rutas internas
de una funcionalidad. Sus vistas tampoco importan su modelo ni su catálogo. Los componentes de marca que
necesitan contenido, como `SocialLinks`, lo reciben por props. Una nueva capa exige declarar sus reglas.

### Tema compartido

`ThemeProvider` publica `{ theme, toggle }`; `useTheme()` exige estar dentro del proveedor. La preferencia
explícita prevalece sobre el sistema y se mantiene durante la visita aunque `localStorage` falle.
Sin elección, se sigue `prefers-color-scheme`. Los cambios de almacenamiento en otras pestañas se sincronizan;
al retirar la preferencia se vuelve al tema del sistema. Los listeners se retiran al desmontar el proveedor.

### Verificación

- `npm test`: lógica de promociones, selección de tratamientos, reglas visuales y límites de dependencias,
  incluyendo casos que deben ser rechazados por el comprobador.
- `npm run build`: tipado estricto y build de producción.
- `npm run e2e`: escenarios Gherkin en español con la infraestructura de pruebas existente en la raíz;
  requiere `npm ci` en la raíz, además de las dependencias de `design/`, y los navegadores de Playwright.
  Comprueba dos consumidores reales de tema bajo `StrictMode`, recarga, sistema, almacenamiento bloqueado,
  sincronización entre pestañas y consulta de fichas desde catálogo y pie.
  Proyectos: escritorio Chromium, Android Chromium, iPhone WebKit y tableta WebKit (emulados).
  `npm run e2e -- --project=chromium` ejecuta solo escritorio. Resultados y trazas: `tests/e2e/results/`.

La página de dos controles se inyecta por el runner de pruebas; no añade una ruta ni controles a la landing.
`design/` continúa siendo independiente del despliegue de `web/`.

### Páginas de objetivos

Los cinco iconos de la franja son enlaces nativos, sin popover:

| Objetivo | URL |
|---|---|
| Reducción de medidas | `/beneficios/reduccion-medidas/` |
| Mejora la circulación | `/beneficios/mejora-la-circulacion/` |
| Moldea tu figura | `/beneficios/moldea-tu-figura/` |
| Piel más firme y rejuvenecida | `/beneficios/piel-mas-firme/` |
| Bienestar integral | `/beneficios/bienestar-integral/` |

`features/benefits/` reúne sus datos, rutas y resolución de referencias; su entrada pública es `index.ts`.
`benefit-page.tsx` consulta la entrada pública de tratamientos y entrega datos y enlaces a la vista pura
`components/BenefitDetailPage.tsx`. Las referencias no duplican el catálogo: cada tratamiento enlaza a su
categoría y apartado. La página conserva el icono y ofrece valoración por WhatsApp y regreso a `/#beneficios`.
El build genera también sus cinco documentos en `dist/beneficios/`, con metadatos y el favicon compartido.
Las pruebas cubren los cinco destinos, sus referencias, recarga, retorno, teclado y continuidad hacia las fichas.

### Reset Praná · Buen Fin 2026

La oferta confirmada vive en `src/data/promotions.ts`: 5 sesiones de aparatología corporal, 3 de
carboxiterapia, valoración corporal gratis, total de $1,490 MXN y apartado de $500 MXN. Las fechas son
13–17 de noviembre de 2026, periodo del Buen Fin indicado por el cliente y verificado en
https://www.elbuenfin.org/ofertas/; no se conserva la referencia a septiembre del arte anterior.

`activePromotions` devuelve las vigentes y `upcomingPromotions` las próximas. Ambas excluyen las inactivas;
una vencida no aparece. La interfaz diferencia «Próximamente» de la vigencia y muestra las fechas completas.
La consulta abre WhatsApp, sin cobrar, congelar el precio ni confirmar una cita automáticamente.

La oferta se muestra en inicio y en `/tratamientos/promociones/`, con la foto y las primitivas propias del sitio.
`App` inyecta la sección `Promotions` como contenido de `TreatmentPage`: la funcionalidad de tratamientos
no importa componentes de secciones. Las cantidades, importes e inclusiones salen de los datos de la promoción.
La imagen enviada es la referencia de contenido; la presentación se reconstruye con HTML accesible, no como
una imagen con texto. Las pruebas cubren importes, sesiones, fechas de inicio/cierre y navegación a los tratamientos.

### Archivo de promociones

`archivedPromotions`, en `src/data/promotions.ts`, contiene las cuatro campañas pasadas aportadas por la clínica:

- Carboxiterapia: 12 sesiones, precio anunciado de $3,990 MXN.
- Agosto de transformación: Mini Lipo 30%, carboxiterapia 20% y depilación láser de cuerpo completo 40% de descuento.
- Julio regalado: 3×2 en el mismo servicio, sin precio especificado.
- Carboxiterapia: «Pagas 1 y te llevas 3», precio anunciado de $3,490 MXN. El arte no especifica la unidad, por lo que no se inventa un número de sesiones.

El tipo `ArchivedPromotion` no tiene fechas ni CTA de contratación. No se asignan años o fechas completas que
las imágenes no indican. `PastPromotions` se compone únicamente en `/tratamientos/promociones/`, fuera de la
sección de ofertas vigentes/próximas; no se anuncia en inicio. Cada tarjeta indica «Promoción pasada · No vigente»
y presenta los importes como precios históricos. Sus enlaces solo permiten leer información de los tratamientos.
El archivo sigue visible al vencer Reset Praná, sin reactivar ninguna oferta anterior.
