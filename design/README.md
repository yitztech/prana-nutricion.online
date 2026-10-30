# Nuevo diseño de Praná

Implementación de `Mockup.png` con React 19, TypeScript, Vite, Tailwind CSS 4 y shadcn/ui. Es independiente de
la landing publicada (`web/`): todavía no se construye ni se despliega desde aquí.

```bash
cd design
npm ci
npm run dev       # http://localhost:5173
npm run build     # typecheck + build en dist/
npm test          # lógica de promociones (node:test)
npm run images    # regenera public/img (WebP) desde recursos/ (necesita cwebp)
```

- `recursos/`: originales aprobados, sin tocar. `public/img/`: WebP derivados (hero en 960/1440/1971 px,
  categorías en 640/1024 px, iconos a 192 px).
- Los iconos de Praná son PNG opacos sobre blanco; `PranaIcon` los muestra con `mix-blend-multiply`.
- Contenido en `src/data/`: `treatments.ts` (catálogo y fichas), `site.ts` (navegación, beneficios, contacto y
  redes) y `promotions.ts`. Tipos en `src/types/`.
- Promociones: solo se publican las `active` dentro de su vigencia (fecha de Cuautla). Hoy no hay ninguna
  confirmada y se muestra el estado alternativo.
- Los horarios no están confirmados: `contact.hours` es `null` y se remite a WhatsApp.
- Las fichas no incluyen precios, resultados garantizados,
  contraindicaciones ni promociones vigentes: lo confirma la clínica en la valoración.
- Las reservas abren WhatsApp con el mensaje preparado (`src/lib/booking.ts`); nunca confirman una cita.
