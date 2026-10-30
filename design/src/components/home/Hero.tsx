import { BookingButton } from "@/components/BookingButton";
import { PranaIcon } from "@/components/PranaIcon";
import { heroHighlights } from "@/data/site";

const heroSrcSet = "/img/hero-960.webp 960w, /img/hero-1440.webp 1440w, /img/hero-1971.webp 1971w";

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden bg-prana-suave md:flex md:flex-col md:justify-center lg:min-h-[min(35vw,58rem)]"
    >
      {/*
        Móvil: la mujer en un arco a la derecha y el texto encima, como en el mockup.
        Desde md: la fotografía es el fondo completo y el texto queda a la izquierda.
      */}
      <div className="absolute top-2 right-0 -z-10 h-64 w-[46%] overflow-hidden rounded-tl-[8rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent),linear-gradient(to_right,transparent,black_18%)] [mask-composite:intersect] sm:h-[24rem] sm:w-[48%] md:inset-0 md:h-auto md:w-auto md:rounded-none md:[mask-image:none]">
        <img
          src="/img/hero-1440.webp"
          srcSet={heroSrcSet}
          sizes="(min-width: 768px) 100vw, 60vw"
          alt="Mujer sonriente con los ojos cerrados, rodeada de flores rosas"
          width={1971}
          height={798}
          fetchPriority="high"
          className="size-full object-cover object-[95%_top] md:object-[70%_center] lg:object-[right_top]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#fff8fb]/95 via-[#fff8fb]/70 to-transparent md:block lg:from-[#fff8fb]/85 lg:via-[#fff8fb]/35 lg:via-25% lg:to-55%"
      />

      <p
        aria-hidden="true"
        className="pointer-events-none absolute top-[14%] right-[3%] hidden -rotate-6 text-center font-script text-4xl leading-snug text-[#b4557f] xl:block 2xl:text-5xl"
      >
        Empieza
        <br />
        cuando tú
        <br />
        decides ♡
      </p>

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-8 sm:px-6 md:pt-14 md:pb-12 lg:px-8 lg:pt-10 lg:pb-10">
        <div className="md:max-w-xl lg:max-w-2xl">
          <p className="text-[0.65rem] font-semibold tracking-[0.14em] whitespace-nowrap text-foreground/80 uppercase sm:text-xs sm:tracking-[0.25em]">
            Praná · Nutrición y bienestar
          </p>
          <h1
            id="hero-titulo"
            className="mt-2 text-[2.1rem] leading-none font-bold tracking-tight text-[#24202f] sm:text-5xl md:mt-3 md:text-6xl lg:text-7xl"
          >
            Tu bienestar
            <span className="-ml-1 block font-script text-[2.3rem] leading-[1.2] whitespace-nowrap font-normal tracking-normal text-[#d81b6a] sm:text-6xl md:text-7xl lg:-ml-3 lg:text-[5.6rem]">
              también se nota
            </span>
          </h1>
          <p className="mt-2 max-w-[62%] text-[0.85rem] leading-snug text-foreground/90 sm:max-w-[55%] sm:text-base md:mt-4 md:max-w-lg md:leading-relaxed md:text-lg lg:text-xl">
            Tratamientos personalizados para realzar tu belleza, mejorar tu bienestar y sentirte
            increíble contigo.
          </p>
        </div>
        <BookingButton origin="hero" className="mt-5 h-12 px-6 text-base md:mt-7 md:h-14 md:px-8 md:text-lg" />

        <ul className="mt-7 grid max-w-2xl grid-cols-3 gap-1.5 sm:gap-6 md:mt-10">
          {heroHighlights.map((item) => (
            <li key={item.icon} className="flex items-center gap-1.5 sm:gap-3">
              <span className="grid shrink-0 place-items-center rounded-full bg-white shadow-soft">
                <PranaIcon name={item.icon} size={64} className="size-9 sm:size-14 lg:size-16" />
              </span>
              <span className="text-xs leading-tight font-medium text-foreground/85 sm:text-sm md:text-base md:leading-snug">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
