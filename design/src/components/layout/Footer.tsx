import { SocialLinks } from "@/components/brand/SocialLinks";
import { useTreatmentDialog } from "@/components/patterns/TreatmentDialog";
import { Logo } from "@/components/ui/logo";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { Heading, Text } from "@/components/ui/typography";
import { contact, navItems } from "@/data/site";
import { categories } from "@/data/treatments";

export function Footer() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <Surface asChild variant="page">
      <footer className="border-t pb-24 md:pb-0">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-footer lg:px-8">
          <div>
            <Logo className="h-14" />
            <Text variant="small-muted" className="mt-3 max-w-xs">
              Tratamientos personalizados de belleza y bienestar en Cuautla, Morelos.
            </Text>
            <SocialLinks className="mt-4" />
          </div>

          <nav aria-labelledby="pie-navegacion">
            <Heading id="pie-navegacion" variant="label">
              Navegación
            </Heading>
            <Text asChild variant="small">
              <ul className="mt-3 space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <TextLink href={item.href}>{item.label}</TextLink>
                  </li>
                ))}
              </ul>
            </Text>
          </nav>

          <div>
            <Heading variant="label">Tratamientos</Heading>
            <Text asChild variant="small">
              <ul className="mt-3 space-y-1">
                {categories.map((c) => (
                  <li key={c.id}>
                    <TextLink asChild>
                      <button type="button" onClick={() => openTreatment({ categoryId: c.id })}>
                        {c.title}
                      </button>
                    </TextLink>
                  </li>
                ))}
              </ul>
            </Text>
          </div>

          <div>
            <Heading variant="label">Contacto</Heading>
            <Text asChild variant="small">
              <ul className="mt-3 space-y-1">
                <li>{contact.address}</li>
                <li>
                  <TextLink href={contact.phoneHref}>{contact.phoneLabel}</TextLink>
                </li>
                <li>
                  <TextLink href={`mailto:${contact.email}`} className="break-all">
                    {contact.email}
                  </TextLink>
                </li>
              </ul>
            </Text>
          </div>
        </div>
        <div className="border-t">
          <Text asChild variant="note">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
              <p>© {new Date().getFullYear()} Praná · Nutrición y Bienestar.</p>
              <ul className="flex gap-4">
                <li>
                  <TextLink href="/privacidad">Aviso de privacidad</TextLink>
                </li>
                <li>
                  <TextLink href="/condiciones">Condiciones de uso</TextLink>
                </li>
              </ul>
            </div>
          </Text>
        </div>
      </footer>
    </Surface>
  );
}
