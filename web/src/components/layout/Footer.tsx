import { SocialLinks } from "@/components/brand/SocialLinks";
import { Logo } from "@/components/brand/ui/logo";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { Heading, Text } from "@/components/ui/typography";
import { contact, navItemHref, navItems, socialLinks } from "@/data/site";
import { treatmentCategoryHref } from "@/features/treatments";
import { useContent } from "@/hooks/use-content";

export function Footer({ home = true }: { home?: boolean }) {
  const { categories } = useContent();
  return (
    <Surface asChild variant="page">
      <footer className="border-t pb-24 md:pb-0">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-footer lg:px-8">
          <div>
            <Logo className="h-14" />
            <Text variant="small-muted" className="mt-3 max-w-xs">
              Tratamientos personalizados de belleza y bienestar en Cuautla, Morelos.
            </Text>
            <SocialLinks links={socialLinks} className="mt-4" />
          </div>

          <nav aria-labelledby="pie-navegacion">
            <Heading id="pie-navegacion" variant="label">
              Navegación
            </Heading>
            <Text asChild variant="small">
              <ul className="mt-3 space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <TextLink href={navItemHref(item.href, home)}>{item.label}</TextLink>
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
                    <TextLink href={treatmentCategoryHref(c.id)}>{c.title}</TextLink>
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
