import { BookingButton } from "@/components/booking-button";
import { PranaIcon } from "@/components/prana-icon";
import { heroHighlights } from "@/data/content";

const heroSrcSet = "/img/hero-960.webp 960w, /img/hero-1440.webp 1440w, /img/hero-1971.webp 1971w";

export function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-prana-suave">
      {/* Móvil: la fotografía arriba, a sangre, y el texto debajo. Desde md: fondo completo. */}
      <div className="relative h-72 sm:h-96 md:absolute md:inset-0 md:h-auto">
        <img
          src="/img/hero-1440.webp"
          srcSet={heroSrcSet}
          sizes="100vw"
          alt="Mujer sonriente con los ojos cerrados, rodeada de flores rosas"
          width={1971}
          height={798}
          fetchPriority="high"
          className="size-full object-cover object-[82%_center] md:object-[70%_center] lg:object-right"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fce5ee] to-transparent md:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-[#fff8fb]/95 via-[#fff8fb]/70 to-transparent md:block lg:from-[#fff8fb]/85 lg:via-[#fff8fb]/35 lg:via-25% lg:to-55%"
        />
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-[43%] hidden -rotate-12 font-script text-4xl leading-tight text-rosa/80 xl:block"
      >
        Empieza
        <br />
        cuando tú
        <br />
        decides ♡
      </p>

      <div className="relative mx-auto max-w-7xl px-4 pt-2 pb-10 sm:px-6 md:pt-16 md:pb-12 lg:px-8 lg:pt-20 lg:pb-14">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-foreground/80 uppercase">
            Praná · Nutrición y bienestar
          </p>
          <h1 id="hero-titulo" className="mt-3 text-5xl leading-none font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Tu bienestar
            <span className="mt-1 block font-script text-6xl font-normal text-primary sm:text-7xl lg:text-8xl">
              también se nota
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/85 sm:text-lg">
            Tratamientos personalizados para realzar tu belleza, mejorar tu bienestar y sentirte
            increíble contigo.
          </p>
          <BookingButton origin="hero" className="mt-7 h-12 px-7 text-base" />
        </div>

        <ul className="mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:gap-6">
          {heroHighlights.map((item) => (
            <li key={item.icon} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <PranaIcon name={item.icon} size={56} className="size-11 sm:size-14" />
              <span className="text-xs leading-snug font-medium text-foreground/85 sm:text-sm">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
