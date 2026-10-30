import { ArrowRight } from "lucide-react";
import { PranaIcon } from "@/components/PranaIcon";
import { Button } from "@/components/ui/button";
import { pillars } from "@/data/site";

const srcSet = "/img/filosofia-960.webp 960w, /img/filosofia-1440.webp 1440w, /img/filosofia-1971.webp 1971w";

export function Philosophy() {
  return (
    <section id="nosotros" aria-labelledby="nosotros-titulo" className="relative isolate overflow-hidden bg-prana-suave">
      <img
        src="/img/filosofia-1440.webp"
        srcSet={srcSet}
        sizes="(min-width: 1280px) 72rem, 100vw"
        alt=""
        width={1971}
        height={798}
        loading="lazy"
        decoding="async"
        className="absolute inset-y-0 left-0 -z-10 hidden h-full w-full object-cover object-[75%_center] [mask-image:linear-gradient(to_right,black_75%,transparent)] md:block xl:left-[max(0px,calc(50%-50rem))] xl:w-[min(calc(50vw+22rem),72rem)] xl:object-[right_top] xl:[mask-image:linear-gradient(to_right,transparent,black_10%,black_82%,transparent)]"
      />
      <img
        src="/img/fondo-1280.webp"
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover opacity-70 md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#fff8fb]/90 via-[#fff8fb]/50 to-transparent md:block xl:via-transparent xl:to-transparent xl:from-[#fff8fb]/70"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:py-14 xl:py-12 xl:grid-cols-[1fr_22rem] lg:px-8">
        <div className="mx-auto max-w-lg text-center md:mx-0 md:text-left">
          <h2 id="nosotros-titulo" className="text-[1.9rem] leading-tight font-bold text-[#24202f] sm:text-4xl xl:text-[2.6rem]">
            Más que estética,
            <span className="block font-script text-5xl leading-[1.2] font-normal text-[#d81b6a] sm:text-6xl">
              bienestar integral
            </span>
          </h2>
          <p className="mt-4 leading-relaxed text-foreground/90 lg:text-lg">
            En Praná creemos en una belleza que nace del equilibrio. Por eso, combinamos tecnología,
            experiencia y un trato humano para ayudarte a sentirte bien por dentro y por fuera.
          </p>
          <Button
            asChild
            className="bg-prana-boton mt-6 h-12 rounded-full px-7 text-base font-semibold text-white shadow-soft hover:brightness-110"
          >
            <a href="#contacto">
              Conoce nuestra filosofía
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {pillars.map((item) => (
            <li
              key={item.icon}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-soft backdrop-blur-sm"
            >
              <PranaIcon name={item.icon} size={48} className="size-11" />
              <span className="text-[0.95rem] leading-snug font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
