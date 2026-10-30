# Nuevo diseño de Praná

Implementación de `Mockup.png` con React 19, TypeScript, Vite, Tailwind CSS 4 y shadcn/ui. Es independiente de
la landing publicada (`web/`): todavía no se construye ni se despliega desde aquí.

```bash
cd design
npm ci
npm run dev       # http://localhost:5173
npm run build     # typecheck + build en dist/
npm test          # promociones y reglas del sistema de diseño (node:test)
npm run images    # regenera public/img (WebP) desde recursos/ (necesita cwebp)
```

- `recursos/`: originales aprobados, sin tocar. `public/img/`: WebP derivados (hero en 960/1440/1971 px,
  categorías en 640/1024 px, iconos a 192 px).
- Los iconos de Praná son PNG opacos sobre blanco; `PranaIcon` los funde (`mix-blend-multiply`) con su disco
  (`--icon-surface`), así que se ven igual en claro y en oscuro.
- El logo son dos máscaras (`logo-mandala.webp` y `logo-texto.webp`) que `npm run images` genera con
  `scripts/logo-masks.mjs`; sus colores salen de `--logo-mark` y `--logo-ink`.
- Contenido en `src/data/`: `treatments.ts` (catálogo y fichas), `site.ts` (navegación, beneficios, contacto y
  redes) y `promotions.ts`. Tipos en `src/types/`.
- Promociones: solo se publican las `active` dentro de su vigencia (fecha de Cuautla). Hoy no hay ninguna
  confirmada y se muestra el estado alternativo.
- Los horarios no están confirmados: `contact.hours` es `null` y se remite a WhatsApp.
- Las fichas no incluyen precios, resultados garantizados,
  contraindicaciones ni promociones vigentes: lo confirma la clínica en la valoración.
- Las reservas abren WhatsApp con el mensaje preparado (`src/lib/booking.ts`); nunca confirman una cita.

## Sistema de diseño

Todo lo visual vive en variables CSS y en las primitivas de `components/ui/`. El resto de componentes solo compone.

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
  preferencia del sistema) y `ThemeToggle` la cambia. Un rol nuevo se define en los dos bloques de `themes.css`.
- **Fotos con texto encima** se oscurecen en modo oscuro (`photo-dim`, `--photo-brightness`).
- `styles/tokens.ts` enumera la escala y las utilidades propias para `cn()` (tailwind-merge): sin eso,
  `text-display` se tomaría por un color y se perdería.

### Componentes (`src/components/`)

| Carpeta | Para qué | Ejemplos |
|---|---|---|
| `ui/` | Primitivas visuales: shadcn/ui y las propias. Únicas con colores, tipografía y decoración, siempre como variantes de `cva` | `Button` (`cta`, `chip`, `list`…), `Card`, `Heading`, `Text`, `Script`, `Surface`, `Photo`, `PranaIcon`, `Logo` |
| `brand/` | Piezas de Praná hechas con primitivas | `BookingButton`, `SocialLinks`, `ThemeToggle` |
| `patterns/` | Bloques reutilizables de contenido | `CategoryCard`, `BenefitItem`, `PromotionCard`, `ContactItem`, `TreatmentDialog` |
| `sections/` | Secciones de la página: datos de `src/data/` + patterns | `Hero`, `TreatmentCatalog`, `Philosophy`… |
| `layout/` | Cabecera, pie y barra móvil | |

### Reglas (las comprueba `npm test`, en `src/styles/design-system.test.ts`)

1. Ningún `.tsx` escribe colores: ni hex, ni `rgb()`, ni colores de Tailwind (`bg-white`), ni `dark:`, ni `style={}`.
2. Fuera de `ui/`, las clases solo componen (display, rejilla, espacio, tamaño, posición, visibilidad): sin
   valores `[arbitrarios]`, color, tipografía, bordes de color, radios ni sombras.
3. Claro y oscuro definen los mismos roles, y cada rol apunta a un color de la paleta.
4. La escala de `theme.css` y las utilidades de `utilities.css` coinciden con `styles/tokens.ts`.

**Para añadir algo visual**: buscar primero una variante existente. Si no la hay, añadir la variante a la
primitiva de `ui/` (con un comentario de para qué sirve) y usarla por su nombre. Si necesita un color nuevo,
añadir el rol en los dos temas de `themes.css`, conectarlo en `theme.css` y, si hace falta, el color en la paleta.
