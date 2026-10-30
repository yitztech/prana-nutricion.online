import { navItems } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white pb-24 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between lg:px-8">
        <img
          src="/img/logo-prana.webp"
          alt="Praná · Nutrición y Bienestar"
          width={640}
          height={213}
          loading="lazy"
          className="h-12 w-auto"
        />
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-primary">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/privacidad" className="hover:text-primary">Aviso de privacidad</a>
            </li>
            <li>
              <a href="/condiciones" className="hover:text-primary">Condiciones de uso</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Praná · Nutrición y Bienestar. Cuautla, Morelos.
      </p>
    </footer>
  );
}
