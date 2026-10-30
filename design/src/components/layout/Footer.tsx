import { useTreatmentDialog } from "@/components/home/TreatmentDialog";
import { SocialLinks } from "@/components/SocialLinks";
import { contact, navItems } from "@/data/site";
import { categories } from "@/data/treatments";

const linkClass = "inline-block rounded-sm py-1 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export function Footer() {
  const { openTreatment } = useTreatmentDialog();

  return (
    <footer className="border-t bg-white pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:px-8">
        <div>
          <img
            src="/img/logo-prana.webp"
            alt="Praná · Nutrición y Bienestar"
            width={640}
            height={213}
            loading="lazy"
            className="h-14 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Tratamientos personalizados de belleza y bienestar en Cuautla, Morelos.
          </p>
          <SocialLinks className="mt-4" />
        </div>

        <nav aria-labelledby="pie-navegacion">
          <h2 id="pie-navegacion" className="font-sans text-sm font-semibold">Navegación</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold">Tratamientos</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => openTreatment({ categoryId: c.id })} className={`${linkClass} text-left`}>
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold">Contacto</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{contact.address}</li>
            <li><a href={contact.phoneHref} className={linkClass}>{contact.phoneLabel}</a></li>
            <li><a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>{contact.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Praná · Nutrición y Bienestar.</p>
          <ul className="flex gap-4">
            <li><a href="/privacidad" className={linkClass}>Aviso de privacidad</a></li>
            <li><a href="/condiciones" className={linkClass}>Condiciones de uso</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
