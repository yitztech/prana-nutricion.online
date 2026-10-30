import { MapPin, Phone } from "lucide-react";
import { BookingButton } from "@/components/booking-button";
import { MAPS_URL, PHONE_HREF, PHONE_LABEL } from "@/lib/booking";

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-3xl bg-prana-suave p-6 shadow-soft sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-foreground/80 uppercase">Visítanos en Cuautla</p>
            <h2 id="contacto-titulo" className="mt-2 text-3xl font-semibold sm:text-4xl">
              Tu cuidado <span className="font-script text-5xl font-normal text-primary">empieza aquí</span>
            </h2>
            <p className="mt-4 text-foreground/85">
              Agenda tu valoración por WhatsApp. El equipo te ayuda a elegir el tratamiento y confirma
              contigo el día y la hora.
            </p>
            <BookingButton origin="contacto" className="mt-6 h-12 px-7 text-base" />
          </div>

          <address className="space-y-4 not-italic">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 rounded-2xl bg-white/80 p-4 transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-sm">
                <span className="block font-semibold">Ubicación</span>
                Calle Guadalupe Victoria #668, Colonia Manantiales, Cuautla, Morelos
                <span className="sr-only"> (abre Google Maps)</span>
              </span>
            </a>
            <a
              href={PHONE_HREF}
              className="flex gap-3 rounded-2xl bg-white/80 p-4 transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-sm">
                <span className="block font-semibold">Teléfono y WhatsApp</span>
                {PHONE_LABEL}
              </span>
            </a>
          </address>
        </div>
      </div>
    </section>
  );
}
