import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/service-card";

export default function Page() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full focus:shadow-md"
      >
        {"Saltar\n        al contenido"}
      </a>

      <nav
        id="navegacion"
        aria-label="Principal"
        className="bg-transparent fixed w-full z-50 transition-all duration-300 py-4 px-6 md:px-12 lg:px-24"
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <a
            href="/"
            className="font-serif text-2xl tracking-wider text-charcoal font-semibold flex items-center gap-2"
          >
            <span className="text-rose">
              <svg className="icono" aria-hidden="true">
                <use href="/assets/iconos.svg#leaf"></use>
              </svg>
            </span>
            {"\n                Prana & Nutrición\n            "}
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#inicio" className="hover:text-rose-ink transition-colors">
              {"Inicio"}
            </a>
            <a
              href="#servicios"
              className="hover:text-rose-ink transition-colors"
            >
              {"Servicios"}
            </a>
            <a
              href="#nosotros"
              className="hover:text-rose-ink transition-colors"
            >
              {"Filosofía"}
            </a>
            <a
              href="#contacto"
              className="hover:text-rose-ink transition-colors"
            >
              {"Contacto"}
            </a>
            <Button asChild variant="default" size="default">
              <a href="#contacto">{"Agendar\n                    Cita"}</a>
            </Button>
          </div>

          <Button
            type="button"
            id="menu-boton"
            aria-expanded="false"
            aria-controls="menu-movil"
            aria-label="Abrir menú"
            className="md:hidden"
            variant="menu"
            size="icon"
          >
            <svg className="icono" data-menu-icono="abrir" aria-hidden="true">
              <use href="/assets/iconos.svg#bars"></use>
            </svg>
            <svg
              className="icono"
              data-menu-icono="cerrar"
              aria-hidden="true"
              hidden
            >
              <use href="/assets/iconos.svg#xmark"></use>
            </svg>
          </Button>
        </div>

        <div
          id="menu-movil"
          hidden
          className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-6 flex flex-col flex flex-col gap-4 text-center glass-effect"
        >
          <a href="#inicio" className="block text-lg hover:text-rose-ink">
            {"Inicio"}
          </a>
          <a href="#servicios" className="block text-lg hover:text-rose-ink">
            {"Servicios"}
          </a>
          <a href="#nosotros" className="block text-lg hover:text-rose-ink">
            {"Filosofía"}
          </a>
          <a href="#contacto" className="block text-lg hover:text-rose-ink">
            {"Contacto"}
          </a>
        </div>
      </nav>
      <main id="contenido">
        <section
          id="inicio"
          className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/img/hero-1024.webp"
              srcSet="/assets/img/hero-640.webp 640w, /assets/img/hero-1024.webp 1024w"
              sizes="100vw"
              width="1024"
              height="1024"
              fetchPriority="high"
              alt="Mujer radiante en spa"
              className="w-full h-full object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-r from-champagne via-champagne/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex w-full">
            <div className="max-w-2xl">
              <span className="text-roseGold-ink font-semibold tracking-widest text-sm uppercase mb-4 block">
                {"Clínica de\n                    Belleza Integral"}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight md:leading-none mb-6">
                {"\n                    Realza tu belleza "}
                <br />
                <span className="text-rose-ink italic">
                  {"desde el interior"}
                </span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg font-light leading-relaxed">
                {
                  "\n                    Nutrición especializada y tratamientos estéticos para mujeres que invierten en sí mismas. Transforma\n                    tu figura, cuida tu piel y acelera tu recuperación postoperatoria.\n                "
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="default" size="lg">
                  <a href="#contacto">
                    {
                      "\n                        Descubre tu mejor versión\n                    "
                    }
                  </a>
                </Button>
                <a
                  href="#servicios"
                  className="bg-white/80 backdrop-blur-sm text-charcoal border border-rose/30 text-center px-8 py-3 rounded-full hover:bg-white transition-all duration-300 text-lg"
                >
                  {
                    "\n                        Nuestros Tratamientos\n                    "
                  }
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="py-24 bg-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blush rounded-full mix-blend-multiply blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif mb-4">
                {"Servicios Exclusivos"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {
                  "Enfoque personalizado que fusiona la ciencia de la nutrición\n                    con el arte de la estética femenina."
                }
              </p>
              <div className="w-24 h-1 bg-linear-to-r from-rose to-gold mx-auto mt-6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <ServiceCard
                title={"Nutrición Moldeadora"}
                service={"Nutrición Moldeadora"}
                image={
                  <img
                    src="/assets/img/nutrition-640.webp"
                    srcSet="/assets/img/nutrition-640.webp 640w, /assets/img/nutrition-1024.webp 1024w"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    alt="Nutrición Especializada"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                }
                icon={
                  <svg
                    className="icono"
                    aria-hidden="true"
                    data-icon="inline-start"
                  >
                    <use href="/assets/iconos.svg#apple-whole"></use>
                  </svg>
                }
              >
                {
                  "Diseñamos planes alimenticios enfocados en mejorar tu\n                            figura física, reducir medidas y nutrir tu cuerpo con alimentos que promueven la vitalidad y\n                            belleza."
                }
              </ServiceCard>

              <ServiceCard
                title={"Cuidado de la Piel"}
                service={"Cuidado de la Piel"}
                image={
                  <img
                    src="/assets/img/skincare-640.webp"
                    srcSet="/assets/img/skincare-640.webp 640w, /assets/img/skincare-1024.webp 1024w"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    alt="Cuidado de la piel"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                }
                icon={
                  <svg
                    className="icono"
                    aria-hidden="true"
                    data-icon="inline-start"
                  >
                    <use href="/assets/iconos.svg#wand-magic-sparkles"></use>
                  </svg>
                }
              >
                {
                  "Tratamientos y nutrición específica para devolverle el\n                            brillo, firmeza e hidratación a tu piel. Porque una piel hermosa comienza con la nutrición\n                            adecuada."
                }
              </ServiceCard>

              <ServiceCard
                title={"Recuperación Postoperatoria"}
                service={"Recuperación Postoperatoria"}
                image={
                  <img
                    src="/assets/img/postop-640.webp"
                    srcSet="/assets/img/postop-640.webp 640w, /assets/img/postop-1024.webp 1024w"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    alt="Recuperación Postoperatoria"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                }
                icon={
                  <svg
                    className="icono"
                    aria-hidden="true"
                    data-icon="inline-start"
                  >
                    <use href="/assets/iconos.svg#spa"></use>
                  </svg>
                }
              >
                {
                  "Acelera tu proceso de sanación tras cirugías estéticas.\n                            Consultas orientadas a reducir inflamación, prevenir fibrosis y optimizar tus resultados.\n                        "
                }
              </ServiceCard>
            </div>
          </div>
        </section>

        <section id="nosotros" className="py-24 bg-blush/30 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-roseGold rounded-3xl rotate-3 scale-105 opacity-20"></div>
              <img
                src="/assets/img/hero-1024.webp"
                srcSet="/assets/img/hero-640.webp 640w, /assets/img/hero-1024.webp 1024w"
                sizes="(min-width: 768px) 50vw, 100vw"
                width="1024"
                height="1024"
                loading="lazy"
                decoding="async"
                alt="Filosofía Prana y Nutrición"
                className="rounded-3xl shadow-xl relative z-10 w-full object-cover h-[500px]"
              />

              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-full shadow-xl z-20 flex flex-col items-center justify-center w-32 h-32 text-center">
                <span className="text-3xl text-rose-ink mb-1">
                  <svg className="icono" aria-hidden="true">
                    <use href="/assets/iconos.svg#gem"></use>
                  </svg>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  {"Calidad"}
                  <br />
                  {"Premium"}
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-roseGold-ink font-semibold tracking-widest text-sm uppercase mb-4 block">
                {"Nuestra\n                    Filosofía"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight md:leading-none">
                {
                  "El balance perfecto entre energía vital y\n                    nutrición"
                }
              </h2>
              <p className="text-gray-700 font-light mb-6 text-lg leading-relaxed">
                <strong>{"Prana"}</strong>
                {
                  " representa la energía vital. Creemos que la verdadera belleza proviene de un\n                    interior sano y balanceado.\n                "
                }
              </p>
              <p className="text-gray-700 font-light mb-8 text-lg leading-relaxed">
                {
                  "\n                    Nuestro espacio está diseñado para mujeres que aman verse hermosas, que entienden que su cuerpo es\n                    su templo y deciden invertir en él con los mejores profesionales, tratamientos e ingredientes.\n                "
                }
              </p>
              <ul className="flex flex-col gap-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="icono text-rose-ink" aria-hidden="true">
                    <use href="/assets/iconos.svg#check"></use>
                  </svg>
                  {" Planes 100% personalizados\n                    "}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="icono text-rose-ink" aria-hidden="true">
                    <use href="/assets/iconos.svg#check"></use>
                  </svg>
                  {" Acompañamiento empático y constante\n                    "}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="icono text-rose-ink" aria-hidden="true">
                    <use href="/assets/iconos.svg#check"></use>
                  </svg>
                  {
                    " Resultados sostenibles que resaltan tu belleza\n                    "
                  }
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-label="Testimonio"
          className="py-24 bg-charcoal text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 patron-cruces"></div>
          <figure className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <svg
              className="icono text-4xl text-roseGold mb-6 opacity-50"
              aria-hidden="true"
            >
              <use href="/assets/iconos.svg#quote-left"></use>
            </svg>
            <blockquote className="text-3xl md:text-5xl font-serif mb-8 leading-snug md:leading-none">
              {
                '\n                "Prana me ayudó a sanar desde adentro. Mi piel nunca se vio tan radiante y mi recuperación de la cirugía\n                fue increíblemente rápida y sin complicaciones."\n            '
              }
            </blockquote>
            <figcaption className="flex items-center justify-center gap-4">
              <div
                aria-hidden="true"
                className="w-12 h-12 bg-roseGold rounded-full flex items-center justify-center text-xl font-serif text-charcoal"
              >
                {"\n                    V"}
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">{"Valeria M."}</p>
                <p className="text-sm text-gray-400">
                  {"Paciente Postoperatoria"}
                </p>
              </div>
            </figcaption>
          </figure>
        </section>

        <section id="contacto" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
            <div className="bg-champagne rounded-[3rem] overflow-hidden shadow-xl flex flex-col md:flex-row">
              <div className="w-full md:w-5/12 bg-rose p-10 md:p-16 text-charcoal flex flex-col justify-between">
                <div>
                  <h2 className="text-4xl font-serif mb-4">
                    {"Inicia tu transformación"}
                  </h2>
                  <p className="font-light mb-10">
                    {
                      "Agenda tu consulta de valoración y permítenos crear un\n                            plan a tu medida."
                    }
                  </p>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <svg
                        className="icono mt-1 text-charcoal text-xl"
                        aria-hidden="true"
                      >
                        <use href="/assets/iconos.svg#location-dot"></use>
                      </svg>
                      <div>
                        <h3 className="font-semibold">{"Ubicación"}</h3>
                        <p className="font-light text-sm">
                          <a
                            href="https://maps.app.goo.gl/UYqR1ZagqVEr13GM6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {
                              "\n                                            Calle Guadalupe Victoria #668"
                            }
                            <br />
                            {
                              "\n                                            Colonia Manantiales, Cuautla, Morelos\n                                        "
                            }
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <svg
                        className="icono mt-1 text-charcoal text-xl"
                        aria-hidden="true"
                      >
                        <use href="/assets/iconos.svg#phone"></use>
                      </svg>
                      <div>
                        <h3 className="font-semibold">
                          {"Teléfono / WhatsApp"}
                        </h3>
                        <p className="font-light text-sm">
                          <a
                            href="https://wa.me/527772095094"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {"(+52) 777-209-5094"}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <svg
                        className="icono mt-1 text-charcoal text-xl"
                        aria-hidden="true"
                      >
                        <use href="/assets/iconos.svg#envelope"></use>
                      </svg>
                      <div>
                        <h3 className="font-semibold">{"Email"}</h3>
                        <p className="font-light text-sm">
                          <a
                            href="mailto:indira_ms@outlook.com"
                            className="hover:underline"
                          >
                            {"indira_ms@outlook.com"}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex gap-4">
                  <a
                    href="https://www.instagram.com/prana_cabinaspa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-rose-ink transition-colors"
                  >
                    <svg className="icono" aria-hidden="true">
                      <use href="/assets/iconos.svg#instagram"></use>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/clinicaspanutricionybienestar"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-rose-ink transition-colors"
                  >
                    <svg className="icono" aria-hidden="true">
                      <use href="/assets/iconos.svg#facebook-f"></use>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@indira_prana"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-rose-ink transition-colors"
                  >
                    <svg className="icono" aria-hidden="true">
                      <use href="/assets/iconos.svg#tiktok"></use>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-7/12 p-10 md:p-16 bg-white">
                <h3 className="text-2xl font-serif mb-8 text-charcoal">
                  {"Envíanos un mensaje"}
                </h3>

                <form id="whatsapp-form" className="" noValidate>
                  <FieldGroup>
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel htmlFor="wa-nombre">
                          {"Nombre completo"}
                        </FieldLabel>
                        <Input
                          type="text"
                          id="wa-nombre"
                          name="nombre"
                          required
                          maxLength="50"
                          autoComplete="name"
                          aria-describedby="wa-nombre-error"
                          placeholder="Tu nombre"
                        />
                        <p
                          id="wa-nombre-error"
                          className="text-sm text-destructive"
                          hidden
                          aria-live="polite"
                        ></p>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="wa-telefono">
                          {"Teléfono"}
                        </FieldLabel>
                        <Input
                          type="tel"
                          id="wa-telefono"
                          name="telefono"
                          required
                          maxLength="20"
                          inputMode="tel"
                          autoComplete="tel"
                          aria-describedby="wa-telefono-error"
                          placeholder="(123) 456-7890"
                        />
                        <p
                          id="wa-telefono-error"
                          className="text-sm text-destructive"
                          hidden
                          aria-live="polite"
                        ></p>
                      </Field>
                    </FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="wa-servicio">
                        {"Servicio de Interés"}
                      </FieldLabel>
                      <NativeSelect id="wa-servicio" name="servicio" required>
                        <NativeSelectOption value="Nutrición Moldeadora">
                          {"Nutrición Moldeadora"}
                        </NativeSelectOption>
                        <NativeSelectOption value="Cuidado de la Piel">
                          {"Cuidado de la Piel"}
                        </NativeSelectOption>
                        <NativeSelectOption value="Recuperación Postoperatoria">
                          {"Recuperación Postoperatoria"}
                        </NativeSelectOption>
                        <NativeSelectOption value="Asesoría General">
                          {"Asesoría General"}
                        </NativeSelectOption>
                      </NativeSelect>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="wa-mensaje">{"Mensaje"}</FieldLabel>
                      <Textarea
                        rows="4"
                        id="wa-mensaje"
                        name="mensaje"
                        required
                        maxLength="2000"
                        aria-describedby="wa-mensaje-contador wa-mensaje-error"
                        placeholder="¿Cómo podemos ayudarte a alcanzar tus metas?"
                      ></Textarea>
                      <div className="mt-2 flex justify-between gap-4 text-sm">
                        <p
                          id="wa-mensaje-error"
                          className="text-sm text-destructive"
                          hidden
                          aria-live="polite"
                        ></p>
                        <p
                          id="wa-mensaje-contador"
                          className="ml-auto text-gray-500"
                        >
                          {"0 / 2000"}
                        </p>
                      </div>
                    </Field>
                    <Button
                      type="submit"
                      className="w-full"
                      variant="charcoal"
                      size="submit"
                    >
                      {
                        "\n                            Agendar Valoración\n                        "
                      }
                    </Button>
                    <p
                      id="wa-estado"
                      role="status"
                      className="text-sm text-gray-600 text-center"
                    ></p>
                    <a
                      id="wa-continuar"
                      target="_blank"
                      rel="noopener noreferrer"
                      hidden
                      className="block text-sm font-medium text-charcoal underline underline-offset-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
                    >
                      {"Continuar en WhatsApp"}
                    </a>
                    <p className="text-xs text-gray-500 text-center">
                      {
                        "Al enviar, se abre WhatsApp con tu mensaje. Consulta\n                            nuestro "
                      }
                      <a
                        href="/privacidad"
                        className="underline hover:text-rose-ink"
                      >
                        {"aviso de privacidad"}
                      </a>
                      {"."}
                    </p>
                  </FieldGroup>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-charcoal pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a
              href="/"
              className="font-serif text-2xl tracking-wider text-white font-semibold flex items-center gap-2"
            >
              <span className="text-rose">
                <svg className="icono" aria-hidden="true">
                  <use href="/assets/iconos.svg#leaf"></use>
                </svg>
              </span>
              {"\n                    Prana & Nutrición\n                "}
            </a>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-gray-400 text-sm">
              <a href="#inicio" className="hover:text-rose transition-colors">
                {"Inicio"}
              </a>
              <a
                href="#servicios"
                className="hover:text-rose transition-colors"
              >
                {"Servicios"}
              </a>
              <a href="#contacto" className="hover:text-rose transition-colors">
                {"Contacto"}
              </a>
              <a
                href="/privacidad"
                className="hover:text-rose transition-colors"
              >
                {"Aviso de privacidad"}
              </a>
              <a
                href="/condiciones"
                className="hover:text-rose transition-colors"
              >
                {"Condiciones de uso"}
              </a>
            </div>
          </div>
          <Separator className="my-8" decorative></Separator>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
            <p>{"© 2026 Prana & Nutrición. Todos los derechos reservados."}</p>
            <p>{"Diseño exclusivo para ti."}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
