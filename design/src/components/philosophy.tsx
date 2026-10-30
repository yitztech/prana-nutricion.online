import { ArrowRight } from "lucide-react";
import { PranaIcon } from "@/components/prana-icon";
import { Button } from "@/components/ui/button";
import { pillars } from "@/data/content";

const srcSet = "/img/filosofia-960.webp 960w, /img/filosofia-1440.webp 1440w, /img/filosofia-1971.webp 1971w";

export function Philosophy() {
  return (
    <section id="nosotros" aria-labelledby="nosotros-titulo" className="relative isolate overflow-hidden bg-prana-suave">
      <img
        src="/img/filosofia-1440.webp"
        srcSet={srcSet}
        sizes="(min-width: 1024px) 80vw, 100vw"
        alt=""
        width={1971}
        height={798}
        loading="lazy"
        decoding="async"
        className="absolute inset-y-0 left-0 -z-10 hidden h-full w-full object-cover object-[75%_center] [mask-image:linear-gradient(to_right,black_75%,transparent)] md:block lg:w-[80%] lg:object-right"
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
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#fff8fb]/90 via-[#fff8fb]/50 to-transparent md:block lg:via-transparent lg:to-transparent lg:from-[#fff8fb]/70"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_20rem] lg:px-8">
        <div className="max-w-md text-center md:text-left">
          <h2 id="nosotros-titulo" className="text-3xl leading-tight font-semibold sm:text-4xl">
            Más que estética,
            <span className="block font-script text-5xl font-normal text-primary sm:text-6xl">
              bienestar integral
            </span>
          </h2>
          <p className="mt-5 leading-relaxed text-foreground/85">
            En Praná creemos en una belleza que nace del equilibrio. Por eso, combinamos tecnología,
            experiencia y un trato humano para ayudarte a sentirte bien por dentro y por fuera.
          </p>
          <Button
            asChild
            className="bg-prana-boton mt-7 h-11 rounded-full px-6 font-semibold text-white shadow-soft hover:brightness-110"
          >
            <a href="#contacto">
              Conoce nuestra filosofía
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {pillars.map((item) => (
            <li
              key={item.icon}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-soft backdrop-blur-sm"
            >
              <PranaIcon name={item.icon} size={48} className="size-11" />
              <span className="text-sm leading-snug font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
