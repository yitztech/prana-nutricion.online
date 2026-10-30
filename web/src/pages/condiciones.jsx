export default function Page() {
  return (
    <>
      <header className="py-6 px-6 md:px-12 lg:px-24 bg-white shadow-xs">
        <div className="max-w-3xl mx-auto">
          <a
            href="/"
            className="font-serif text-2xl tracking-wider text-charcoal font-semibold inline-flex items-center gap-2"
          >
            <span className="text-rose">
              <svg className="icono" aria-hidden="true">
                <use href="/assets/iconos.svg#leaf"></use>
              </svg>
            </span>
            {"\n                Prana & Nutrición\n            "}
          </a>
        </div>
      </header>
      <main className="py-16 px-6 md:px-12 lg:px-24">
        <article className="max-w-3xl mx-auto text-gray-700 leading-relaxed flex flex-col gap-6 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-charcoal [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_a]:underline [&_a:hover]:text-rose">
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal">
            {"Condiciones de uso"}
          </h1>
          <p className="text-sm text-gray-600">
            {"Última actualización: 20 de octubre de 2026"}
          </p>
          <h2>{"Sobre este sitio"}</h2>
          <p>
            {
              "Este sitio de Prana & Nutrición (Cuautla, Morelos, México) da a conocer nuestros servicios de\n                nutrición, cuidado de la piel y recuperación postoperatoria, y te permite contactarnos para agendar una\n                valoración. Al usarlo aceptas estas condiciones."
            }
          </p>
          <h2>{"La información no sustituye una consulta"}</h2>
          <p>
            {
              "El contenido es informativo y general. No sustituye la valoración personal de un profesional: cada\n                plan y cada tratamiento se definen en consulta, y los resultados dependen de cada persona."
            }
          </p>
          <h2>{"Citas"}</h2>
          <p>
            {
              "Enviar el formulario o un mensaje no confirma una cita: te confirmaremos la fecha y la hora por WhatsApp\n                o por teléfono."
            }
          </p>
          <h2>{"Propiedad intelectual"}</h2>
          <p>
            {
              "Los textos, imágenes, logotipos y el diseño del sitio son de Prana & Nutrición o se usan con\n                licencia, y no pueden copiarse ni reutilizarse sin autorización. Los iconos son de Font Awesome Free\n                (licencia CC BY 4.0)."
            }
          </p>
          <h2>{"Enlaces a otros sitios"}</h2>
          <p>
            {
              "Los enlaces a WhatsApp, redes sociales y mapas llevan a servicios de terceros, con sus propias\n                condiciones y políticas de privacidad."
            }
          </p>
          <h2>{"Privacidad"}</h2>
          <p>
            {"Cómo tratamos tus datos se explica en el "}
            <a href="/privacidad">{"aviso de privacidad"}</a>
            {"."}
          </p>
          <h2>{"Ley aplicable"}</h2>
          <p>
            {
              "Estas condiciones se rigen por las leyes de México. Podemos actualizarlas; la versión vigente es la\n                publicada en esta página."
            }
          </p>
        </article>
      </main>
      <footer className="bg-charcoal py-8 px-6 text-gray-400 text-sm">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-between gap-4">
          <p>{"© 2026 Prana & Nutrición"}</p>
          <nav aria-label="Legal" className="flex gap-6">
            <a href="/" className="hover:text-rose">
              {"Inicio"}
            </a>
            <a href="/privacidad" className="hover:text-rose">
              {"Aviso de privacidad"}
            </a>
            <a href="/condiciones" className="hover:text-rose">
              {"Condiciones de uso"}
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
