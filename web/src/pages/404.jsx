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
            {"Página no encontrada"}
          </h1>
          <p>{"La página que buscas no existe o cambió de dirección."}</p>
          <p>
            <a href="/">{"Volver al inicio"}</a>
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
