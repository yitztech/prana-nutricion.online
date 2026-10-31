# QA de diseño — reserva directa de Prana

Fecha: 2026-10-29. Rama: `codex/migracion-shadcn`.

final result: passed

## Fuente y evidencia

- Propuesta seleccionada: [escritorio y móvil](docs/diseno/propuesta-reserva.png), imagen original de
  1448 × 1086 px. El marco de escritorio ocupa aproximadamente 1028 × 1060 px; el móvil es una vista
  alargada de la página, no una captura de un dispositivo de 844 px de alto.
- Implementación: [escritorio](docs/diseno/portada-reserva-escritorio.jpg),
  [móvil](docs/diseno/portada-reserva-movil.jpg) y [tableta](docs/diseno/portada-reserva-tableta.jpg).
- Comparación realizada con la referencia y la implementación juntas en la misma revisión: recorte del
  escritorio de la referencia normalizado a 1280 px de ancho frente a los primeros 1320 px de la captura
  Chromium de 1280 px. También se revisaron la primera pantalla móvil, la barra fija y la vista de tableta.
- Las capturas completas y originales están adjuntas al escenario «La primera pantalla permite agendar
  directamente» del informe de Playwright. Chromium: viewport 1280 × 720, DPR 1. iPhone 15 emulado:
  viewport 393 × 659, DPR 3; imagen original 1179 × 1977, reducida proporcionalmente para esta documentación.
  La tableta usa viewport 834 × 1024, DPR 1. Hay otra captura de escritorio a 1440 × 1024.
- Se verificó además la UI en el navegador integrado: menú móvil, navegación a «Cómo agendar», expansión
  de preguntas frecuentes y revisión de composición en móvil y escritorio.

## Hallazgos resueltos

- **P2, cabecera en tableta:** la navegación completa podía competir por espacio con marca y CTA. El menú
  compacto se mantiene hasta 1024 px. Los escenarios verifican límites de cada control y ausencia de desborde
  a 768, 834, 1024 y 1440 px en los tres motores/dispositivos configurados.
- **P2, proporciones del bloque inicial:** se ajustaron la división 44/56 en escritorio, el margen del texto
  y la altura de imagen a 570 px. El botón principal tiene al menos 56 px de alto y el de cabecera, 44 px.
- **P2, contraste y estados:** el botón usa rosa oscuro sobre blanco y cambia a carbón en hover; las acciones
  secundarias usan texto oscuro sobre el fondo de acento. Se activó axe con contraste completo en portada,
  retirando la omisión histórica; se conserva el escenario específico de contraste como regresión.

## Superficies de fidelidad

| Superficie | Resultado y límites |
| --- | --- |
| Tipografía | Playfair Display y Outfit locales, jerarquía serif/sans, encabezado principal con el texto aprobado. Las líneas se adaptan al ancho; no se fuerza un salto que rompa móvil o zoom. |
| Espaciado y composición | Bloque inicial dividido, fotografía a la derecha, tratamientos en tres columnas y proceso en tres pasos. En móvil se apilan los bloques y persiste el CTA. La tableta tiene menú compacto y dos columnas en el bloque inicial. |
| Color y estados | Blanco/champagne, carbón y rosa de Prana con tokens shadcn. Se revisaron botones, enlaces, hover, foco, errores y barra móvil. Axe incluye contraste en portada y legales. |
| Imágenes e iconos | Se reutilizan los WebP 640/1024 y el sprite real del proyecto. Hay dimensiones, srcset, preload coherente con sizes y carga diferida fuera de la primera pantalla. No se presentan nuevas fotos como evidencia del local o del equipo. |
| Contenido y flujo | Texto y acción principal de la propuesta, CTA por tratamiento y explicación de confirmación por WhatsApp. El formulario es secundario y conserva límites, errores y recuperación. No se inventaron horarios, precios, credenciales ni disponibilidad. |

## Diferencias intencionales

- Se preservan las fotografías originales del proyecto; el mock generado las reinterpreta. Se ajusta su
  recorte con `object-fit`, sin sustituirlas por imágenes ficticias de la profesional o del negocio.
- Se usa el icono de teléfono del sprite en las acciones de WhatsApp y el de confirmación en el proceso,
  manteniendo la biblioteca de iconos existente. Los enlaces nombran WhatsApp explícitamente.
- El fondo se conserva limpio, sin las sombras decorativas simuladas del mock. Las tarjetas son componentes
  shadcn sin cajas ni sombras adicionales. El formulario, dirección y preguntas continúan debajo de la zona
  mostrada en la propuesta.
- La pantalla móvil real es más corta que la composición de referencia. La acción principal y la barra
  permanecen visibles; el contenido continúa al hacer scroll. La barra no cubre los enlaces legales.

## Validación del comportamiento

`npm test`: 19 pruebas unitarias y 132 E2E correctos, 0 fallidos, 0 omitidos y 0 inestables. Se reconstruyen
las imágenes y se recrea el compose de producción con el override local. Escenarios en Chromium, Pixel 7
emulado e iPhone 15 emulado, incluidos menú, imágenes, SEO, cabeceras, formulario, recuperación, reserva
por tratamiento, reserva sin JavaScript y anchos de tableta/escritorio. La navegación externa a WhatsApp
se intercepta: no se enviaron mensajes reales. `npm run build`, `npm run check:audit` y `git diff --check` pasan.

No quedan hallazgos P0/P1/P2 abiertos dentro de este alcance. La evaluación combina revisión visual y pruebas
automatizadas; no representa una certificación exhaustiva de WCAG ni una prueba en dispositivos físicos.

## Entrega y pendientes

- Implementación local lista para revisión en `http://127.0.0.1:8091/`.
- Sin publicación, CI remoto ni despliegue a producción en este cambio.
- La cita se confirma con la clínica; abrir o enviar el mensaje no bloquea un horario en un calendario.
- La revisión legal y razón social siguen pendientes del cliente. Fotografías reales y credenciales
  verificables pueden incorporarse cuando el cliente las proporcione.
- Los eventos Umami solo funcionan si la analítica está configurada. La mejora de conversión debe medirse
  tras publicar; no se infiere de una revisión de diseño ni de un clic.
