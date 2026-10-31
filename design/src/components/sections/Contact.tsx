import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { ContactItem } from "@/components/patterns/ContactItem";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Eyebrow, Heading, Script, Text } from "@/components/ui/typography";
import { contact, socialLinks } from "@/data/site";

export function Contact() {
  return (
    <Section id="contacto" aria-labelledby="contacto-titulo" className="pb-14 sm:pb-20">
      <Container size="narrow">
        <Surface variant="panel" className="grid items-start gap-8 p-6 sm:p-10 md:grid-cols-contact">
          <div>
            <Eyebrow>Visítanos en Cuautla</Eyebrow>
            <Heading id="contacto-titulo" className="mt-2">
              Tu cuidado <Script variant="inline">empieza aquí</Script>
            </Heading>
            <Text className="mt-4">
              Agenda tu valoración por WhatsApp. El equipo te ayuda a elegir el tratamiento y confirma
              contigo el día y la hora.
            </Text>
            <BookingButton origin="contacto" className="mt-6" />
            <Text variant="label" className="mt-8">
              Síguenos
            </Text>
            <SocialLinks links={socialLinks} className="mt-3" />
          </div>

          <address className="grid gap-3">
            <ContactItem icon={<MapPin />} title="Ubicación" href={contact.mapsUrl} external>
              {contact.address}
              <span className="sr-only"> (abre Google Maps)</span>
            </ContactItem>
            <ContactItem icon={<Phone />} title="Teléfono y WhatsApp" href={contact.phoneHref}>
              {contact.phoneLabel}
            </ContactItem>
            <ContactItem icon={<Mail />} title="Correo" href={`mailto:${contact.email}`}>
              <span className="break-all">{contact.email}</span>
            </ContactItem>
            <ContactItem icon={<Clock />} title="Horario">
              {contact.hours ?? "Consulta los horarios disponibles por WhatsApp."}
            </ContactItem>
          </address>
        </Surface>
      </Container>
    </Section>
  );
}
