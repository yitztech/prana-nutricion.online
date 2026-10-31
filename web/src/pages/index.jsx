import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/service-card";
import { BookingLink } from "@/components/booking-link";
import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icon";
import { Catalog } from "@/components/catalog";

const services = [
  {
    title: "Nutrición moldeadora",
    service: "Nutrición Moldeadora",
    image: "nutrition",
    alt: "Alimentos para un plan de nutrición personalizado",
    description:
      "Planes de alimentación que se adaptan a tu estilo de vida y a tus objetivos.",
  },
  {
    title: "Cuidado de la piel",
    service: "Cuidado de la Piel",
    image: "skincare",
    alt: "Cuidado de la piel",
    description:
      "Tratamientos estéticos y nutrición específica para cuidar tu piel.",
  },
  {
    title: "Recuperación postoperatoria",
    service: "Recuperación Postoperatoria",
    image: "postop",
    alt: "Espacio de tratamientos y recuperación postoperatoria",
    description:
      "Acompañamiento nutricional y estético durante tu recuperación.",
  },
];
const navigation = [
  ["#servicios", "Tratamientos"],
  ["#como-agendar", "Cómo agendar"],
  ["#contacto", "Ubicación"],
];

function Brand({ footer = false }) {
  return (
    <a href="/" className={footer ? "brand brand-footer" : "brand"}>
      <Icon name="leaf" />
      Prana & Nutrición
    </a>
  );
}

export default function Page() {
  return (
    <div className="landing bg-background text-foreground">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Saltar al contenido
      </a>
      <nav
        id="navegacion"
        aria-label="Principal"
        className="site-nav sticky top-0 z-40 bg-background/95"
      >
        <div className="page-container flex min-h-20 items-center justify-between gap-4">
          <Brand />
          <div className="hidden items-center gap-7 text-sm lg:flex">
            {navigation.map(([href, label]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
            <BookingLink placement="header" size="booking-header" />
          </div>
          <Button
            type="button"
            id="menu-boton"
            aria-expanded="false"
            aria-controls="menu-movil"
            aria-label="Abrir menú"
            className="lg:hidden"
            variant="menu"
            size="icon-lg"
          >
            <Icon name="bars" data-menu-icono="abrir" />
            <Icon name="xmark" data-menu-icono="cerrar" hidden />
          </Button>
        </div>
        <div
          id="menu-movil"
          hidden
          className="absolute left-0 top-full w-full border-b border-border bg-background px-6 py-5 shadow-sm lg:hidden"
        >
          <div className="flex flex-col gap-2">
            {navigation.map(([href, label]) => (
              <a key={href} href={href} className="nav-link py-3">
                {label}
              </a>
            ))}
            <BookingLink placement="menu" className="mt-2" />
          </div>
        </div>
      </nav>
      <main id="contenido">
        <section
          id="inicio"
          aria-labelledby="inicio-titulo"
          className="hero-section"
        >
          <div className="hero-grid page-container">
            <div className="hero-copy">
              <p className="section-kicker">Clínica de belleza integral</p>
              <h1 id="inicio-titulo">
                Cuida tu figura y tu piel con un plan para ti.
              </h1>
              <p className="hero-description">
                Nutrición y tratamientos estéticos en Cuautla, Morelos.
                Empecemos con una valoración personalizada.
              </p>
              <div className="hero-actions flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <BookingLink placement="hero" />
                <Button
                  asChild
                  variant="service"
                  size="service"
                  className="hidden sm:inline-flex"
                >
                  <a href="#servicios">
                    Conocer tratamientos
                    <Icon name="arrow-right" data-icon="inline-end" />
                  </a>
                </Button>
              </div>
              <p className="booking-note">
                <Icon name="phone" />
                Por WhatsApp. Confirmamos contigo día y hora.
              </p>
            </div>
            <img
              src="/assets/img/hero-1024.webp"
              srcSet="/assets/img/hero-640.webp 640w, /assets/img/hero-1024.webp 1024w"
              sizes="(min-width: 768px) 50vw, 100vw"
              width="1024"
              height="1024"
              fetchPriority="high"
              alt="Ambiente de bienestar en Prana y Nutrición"
              className="hero-image"
            />
          </div>
        </section>
        <section
          id="servicios"
          aria-labelledby="servicios-titulo"
          className="page-container treatments-section"
        >
          <div className="section-heading">
            <p className="section-kicker">Nuestros tratamientos</p>
            <h2 id="servicios-titulo">¿Qué te gustaría cuidar?</h2>
            <p>Un primer paso para encontrar el cuidado que va contigo.</p>
          </div>
          <div className="grid gap-9 md:grid-cols-3 lg:gap-10">
            {services.map((item) => (
              <ServiceCard
                key={item.image}
                title={item.title}
                service={item.service}
                image={
                  <img
                    src={`/assets/img/${item.image}-640.webp`}
                    srcSet={`/assets/img/${item.image}-640.webp 640w, /assets/img/${item.image}-1024.webp 1024w`}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    alt={item.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                }
              >
                {item.description}
              </ServiceCard>
            ))}
          </div>
        </section>
        <Catalog />
        <section
          id="como-agendar"
          aria-labelledby="agendar-titulo"
          className="page-container pb-16 lg:pb-20"
        >
          <div className="booking-process">
            <div>
              <p className="section-kicker">Así de fácil empiezas</p>
              <h2 id="agendar-titulo">Tu próxima valoración, a un paso.</h2>
            </div>
            <ol className="booking-steps">
              <li>
                <span className="step-number">1</span>
                <div>
                  <Icon name="leaf" />
                  <h3>Elige tu tratamiento</h3>
                  <p>
                    Selecciona el servicio que deseas. Si tienes dudas,
                    cuéntanos qué buscas.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div>
                  <Icon name="phone" />
                  <h3>Escríbenos por WhatsApp</h3>
                  <p>
                    Abre el mensaje preparado y envíalo para consultar horarios.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div>
                  <Icon name="check" />
                  <h3>Confirmamos tu cita</h3>
                  <p>
                    Acordamos contigo el día y la hora según disponibilidad.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section
          id="nosotros"
          aria-labelledby="nosotros-titulo"
          className="about-section"
        >
          <div className="page-container grid items-center gap-8 md:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <p className="section-kicker">Nuestra filosofía</p>
              <h2 id="nosotros-titulo">Un espacio para cuidar de ti.</h2>
            </div>
            <div className="flex flex-col items-start gap-5">
              <p>
                En Prana & Nutrición creemos en un cuidado personal que empieza
                por escucharte. Tu valoración es el momento de hablar de tus
                objetivos y encontrar un plan a tu medida.
              </p>
              <BookingLink placement="about" />
            </div>
          </div>
        </section>
        <section
          id="contacto"
          aria-labelledby="contacto-titulo"
          className="page-container contact-section"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="section-kicker">Visítanos en Cuautla</p>
              <h2 id="contacto-titulo">Tu cuidado empieza aquí.</h2>
              <p className="mt-5 text-muted-foreground">
                Agenda tu valoración por WhatsApp. El equipo te ayudará a elegir
                el servicio y confirmar tu cita.
              </p>
              <BookingLink placement="contact" className="mt-6" />
              <dl className="contact-details">
                <div>
                  <dt>
                    <Icon name="location-dot" />
                    Ubicación
                  </dt>
                  <dd>
                    <a
                      href="https://maps.app.goo.gl/UYqR1ZagqVEr13GM6"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Calle Guadalupe Victoria #668
                      <br />
                      Colonia Manantiales, Cuautla, Morelos
                      <Icon name="arrow-right" className="ml-2" />
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="phone" />
                    Teléfono / WhatsApp
                  </dt>
                  <dd>
                    <a href="tel:+527772095094">(+52) 777-209-5094</a>
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="envelope" />
                    Email
                  </dt>
                  <dd>
                    <a href="mailto:indira_ms@outlook.com">
                      indira_ms@outlook.com
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="icon-lg">
                  <a
                    href="https://www.instagram.com/prana_cabinaspa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Icon name="instagram" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon-lg">
                  <a
                    href="https://www.facebook.com/clinicaspanutricionybienestar"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Icon name="facebook-f" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon-lg">
                  <a
                    href="https://www.tiktok.com/@indira_prana"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                  >
                    <Icon name="tiktok" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="contact-form-panel">
              <h3 className="font-serif text-3xl">¿Prefieres contarnos más?</h3>
              <p className="mb-7 mt-3 text-muted-foreground">
                Puedes preparar un mensaje con tus datos. También se enviará por
                WhatsApp.
              </p>
              <ContactForm />
            </div>
          </div>
        </section>
        <section
          id="preguntas"
          aria-labelledby="preguntas-titulo"
          className="page-container faq-section"
        >
          <div className="section-heading">
            <h2 id="preguntas-titulo">Antes de agendar</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <details>
              <summary>¿Mi cita queda reservada al pulsar el botón?</summary>
              <p>
                No todavía. El botón abre WhatsApp con un mensaje preparado.
                Envíalo y el equipo confirmará contigo el día y la hora según
                disponibilidad.
              </p>
            </details>
            <details>
              <summary>¿Y si no sé qué tratamiento elegir?</summary>
              <p>
                Usa «Agendar mi valoración» y cuéntanos qué te gustaría cuidar.
                Te ayudaremos a elegir el siguiente paso.
              </p>
            </details>
            <details>
              <summary>¿Necesito completar el formulario?</summary>
              <p>
                No. Puedes agendar directamente por WhatsApp. El formulario es
                una alternativa para preparar un mensaje con más información.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <Brand footer />
            <div className="flex flex-wrap gap-x-6 gap-y-4 text-sm">
              <a href="#servicios">Tratamientos</a>
              <a href="#contacto">Ubicación</a>
              <a href="/privacidad">Aviso de privacidad</a>
              <a href="/condiciones">Condiciones de uso</a>
            </div>
          </div>
          <Separator className="my-8" decorative />
          <p className="text-sm">
            © 2026 Prana & Nutrición. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      <aside
        aria-label="Agenda por WhatsApp"
        className="mobile-booking md:hidden"
      >
        <BookingLink placement="mobile" className="w-full">
          Agendar por WhatsApp
        </BookingLink>
      </aside>
    </div>
  );
}
