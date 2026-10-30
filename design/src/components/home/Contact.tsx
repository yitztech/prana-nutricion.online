import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { BookingButton } from "@/components/BookingButton";
import { SocialLinks } from "@/components/SocialLinks";
import { contact } from "@/data/site";

const itemClass =
  "flex gap-3 rounded-2xl bg-white/80 p-4 text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

function ContactItem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <>
      <span className="mt-0.5 shrink-0 text-primary [&_svg]:size-5">{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        {children}
      </span>
    </>
  );
}

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="bg-background pb-14 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 rounded-3xl bg-prana-suave p-6 shadow-soft sm:p-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-foreground/80 uppercase">Visítanos en Cuautla</p>
            <h2 id="contacto-titulo" className="mt-2 text-3xl font-semibold sm:text-4xl">
              Tu cuidado <span className="font-script text-5xl font-normal text-[#d81b6a]">empieza aquí</span>
            </h2>
            <p className="mt-4 text-foreground/85">
              Agenda tu valoración por WhatsApp. El equipo te ayuda a elegir el tratamiento y confirma
              contigo el día y la hora.
            </p>
            <BookingButton origin="contacto" className="mt-6 h-12 px-7 text-base" />
            <p className="mt-8 text-sm font-semibold">Síguenos</p>
            <SocialLinks className="mt-3" />
          </div>

          <address className="grid gap-3 not-italic">
            <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${itemClass} hover:bg-white`}>
              <ContactItem icon={<MapPin />} title="Ubicación">
                {contact.address}
                <span className="sr-only"> (abre Google Maps)</span>
              </ContactItem>
            </a>
            <a href={contact.phoneHref} className={`${itemClass} hover:bg-white`}>
              <ContactItem icon={<Phone />} title="Teléfono y WhatsApp">
                {contact.phoneLabel}
              </ContactItem>
            </a>
            <a href={`mailto:${contact.email}`} className={`${itemClass} hover:bg-white`}>
              <ContactItem icon={<Mail />} title="Correo">
                <span className="break-all">{contact.email}</span>
              </ContactItem>
            </a>
            <div className={itemClass}>
              <ContactItem icon={<Clock />} title="Horario">
                {contact.hours ?? "Consulta los horarios disponibles por WhatsApp."}
              </ContactItem>
            </div>
          </address>
        </div>
      </div>
    </section>
  );
}
