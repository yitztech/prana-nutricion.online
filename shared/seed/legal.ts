import type { LegalDocument, LegalSlug, RichBlock, RichInline, RichListItem, RichParagraph } from "../content.ts";

/**
 * Textos genéricos iniciales, adaptados de la web anterior. Se editan desde el admin y necesitan la
 * razón social y una revisión legal antes de darse por definitivos (WEB-03).
 */
const text = (value: string): RichInline => ({ type: "text", text: value });
const bold = (value: string): RichInline => ({ type: "text", text: value, marks: [{ type: "bold" }] });
const link = (value: string, href: string): RichInline => ({ type: "text", text: value, marks: [{ type: "link", attrs: { href } }] });
const p = (...content: (string | RichInline)[]): RichParagraph => ({
  type: "paragraph",
  content: content.map((part) => (typeof part === "string" ? text(part) : part)),
});
const h2 = (value: string): RichBlock => ({ type: "heading", attrs: { level: 2 }, content: [text(value)] });
const li = (...content: (string | RichInline)[]): RichListItem => ({ type: "listItem", content: [p(...content)] });
const ul = (...items: RichListItem[]): RichBlock => ({ type: "bulletList", content: items });

const EMAIL = "indira_ms@outlook.com";

export const legalSeed: Record<LegalSlug, Omit<LegalDocument, "updatedOn">> = {
  privacidad: {
    slug: "privacidad",
    title: "Aviso de privacidad",
    body: {
      type: "doc",
      content: [
        h2("Responsable"),
        p("Praná: Nutrición y Bienestar, con domicilio en Calle Guadalupe Victoria #668, Colonia Manantiales, Cuautla, Morelos, México, es responsable del tratamiento de los datos personales que nos proporciones, de acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares."),
        h2("Qué datos tratamos y para qué"),
        ul(
          li(bold("Formulario «Envíanos un mensaje»"), ": nombre, teléfono, servicio de interés y el mensaje que escribas. Este sitio no los guarda ni los envía a ningún servidor: al pulsar «Preparar mensaje en WhatsApp» se abre WhatsApp con el texto ya escrito, y solo nos llega si tú lo envías. Los usamos para responderte, agendar tu valoración y darte seguimiento."),
          li(bold("Mensajes por WhatsApp, teléfono o correo"), ": los datos que nos compartas al contactarnos, con las mismas finalidades."),
          li(bold("Estadísticas de visitas"), ": contamos las visitas de forma agregada (página vista, sitio de procedencia, tipo de navegador y dispositivo, y país aproximado) con una herramienta que no usa cookies ni identifica a las personas. Sirven para saber qué contenido interesa y mejorar el sitio."),
        ),
        p("No te pedimos datos de salud a través de este sitio. Si en la consulta compartes información sobre tu salud, la trataremos solo para prestarte el servicio y con tu consentimiento expreso."),
        h2("Con quién se comparten"),
        p("No vendemos ni cedemos tus datos. Los mensajes por WhatsApp los procesa WhatsApp (Meta) según sus propias condiciones. El sitio y sus estadísticas se alojan con un proveedor tecnológico que actúa por nuestra cuenta y no usa los datos para fines propios."),
        h2("Tus derechos (ARCO)"),
        p("Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento, así como revocar tu consentimiento, escribiendo a ", link(EMAIL, `mailto:${EMAIL}`), " con tu nombre, un medio para responderte y la descripción de lo que solicitas. Te responderemos en los plazos que marca la ley."),
        h2("Cambios a este aviso"),
        p("Publicaremos cualquier cambio en esta misma página, con su fecha de actualización."),
      ],
    },
  },
  condiciones: {
    slug: "condiciones",
    title: "Condiciones de uso",
    body: {
      type: "doc",
      content: [
        h2("Sobre este sitio"),
        p("Este sitio de Praná: Nutrición y Bienestar (Cuautla, Morelos, México) da a conocer nuestros tratamientos y promociones, y te permite contactarnos para agendar una valoración. Al usarlo aceptas estas condiciones."),
        h2("La información no sustituye una consulta"),
        p("El contenido es informativo y general. No sustituye la valoración personal de un profesional: cada plan y cada tratamiento se definen en consulta, y los resultados varían en cada persona."),
        h2("Citas y promociones"),
        p("Enviar un mensaje no confirma una cita: te confirmaremos la fecha y la hora por WhatsApp o por teléfono. Las promociones son válidas en las fechas y condiciones publicadas en cada una; la clínica confirma su disponibilidad al agendar."),
        h2("Propiedad intelectual"),
        p("Los textos, imágenes, logotipos y el diseño del sitio son de Praná: Nutrición y Bienestar o se usan con licencia, y no pueden copiarse ni reutilizarse sin autorización."),
        h2("Enlaces a otros sitios"),
        p("Los enlaces a WhatsApp, redes sociales y mapas llevan a servicios de terceros, con sus propias condiciones y políticas de privacidad."),
        h2("Privacidad"),
        p("Cómo tratamos tus datos se explica en el ", link("aviso de privacidad", "/privacidad"), "."),
        h2("Ley aplicable"),
        p("Estas condiciones se rigen por las leyes de México. Podemos actualizarlas; la versión vigente es la publicada en esta página."),
      ],
    },
  },
};
