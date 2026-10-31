# Diseño orientado a valoración y reserva

Propuesta aprobada e implementada en `codex/migracion-shadcn`, sobre la migración estática a shadcn/ui.

## Comportamiento

La acción «Agendar mi valoración» aparece en cabecera, bloque inicial, filosofía y contacto. Cada tarjeta
abre WhatsApp con el servicio ya incluido en el mensaje. En móvil se añade una barra fija con zona segura
y espacio inferior en la página. Ninguno de estos enlaces requiere completar el formulario ni ejecutar
JavaScript. El mensaje pregunta por horarios y el equipo confirma la cita; no hay disponibilidad inventada.

El formulario conserva su funcionamiento y validación, como alternativa para un mensaje detallado.
Su botón se llama «Preparar mensaje en WhatsApp» para describir la acción real. El menú mantiene Escape,
foco y cierre al navegar. Las preguntas frecuentes usan `details` y `summary` nativos.

## Implementación

- `web/src/pages/index.jsx`: composición, navegación, tratamientos, proceso, contacto y preguntas.
- `web/src/components/booking-link.jsx`: Button de shadcn con enlace nativo mediante `asChild`.
- `web/src/lib/booking.js`: URL codificada de WhatsApp, mensaje general y mensaje por servicio.
- `web/src/components/service-card.jsx`: Card y sus partes, con reserva contextual.
- `web/src/components/contact-form.jsx`: formulario secundario con Field, Input, NativeSelect y Textarea.
- `web/src/styles.css`: identidad de Prana, adaptación responsive y espacio para la barra móvil.
- `tests/e2e/features/landing/reserva.feature`: contrato del nuevo recorrido y validación responsive.

No se añadieron ni actualizaron dependencias. React sigue ejecutándose solo durante el build.
No se contacta con WhatsApp desde las pruebas; la navegación se intercepta.

Los enlaces incluyen `data-umami-event="reserva-whatsapp"` con origen y servicio. No incluyen nombres ni
telefonía de pacientes. Requieren Umami activo para producir datos. Miden intención de contacto, no citas
confirmadas. Para valorar conversión real, contrastar las conversaciones iniciadas con las citas confirmadas
por la clínica; este cambio no afirma un aumento medido.

## Comprobación

```sh
npm run build
npm run check:audit
npm test
```

Resultado: 19 unitarias y 132 E2E correctos, sin omisiones, fallos ni inestables. Axe se ejecuta con contraste
incluido. [La revisión visual](../design-qa.md) conserva fuente, capturas, diferencias intencionales y límites.

Revisión manual: abrir la portada en escritorio y móvil; comprobar CTA visible al entrar; seleccionar cada
tratamiento; revisar el mensaje sin enviarlo; abrir el menú y cerrarlo con Escape; comprobar que el formulario
sigue preparando mensajes y conserva los datos; recorrer hasta el pie y acceder a los enlaces legales.
La clínica debe confirmar el día y hora después de recibir la consulta. La publicación y el CI remoto no
se ejecutaron en este trabajo.
