import { Menu } from "lucide-react";
import { useRef, useState } from "react";
import { BookingButton } from "@/components/brand/BookingButton";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { navItems } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";

const sectionIds = navItems.map((item) => item.href.slice(1));

export function Header() {
  const [open, setOpen] = useState(false);
  // El Sheet bloquea el scroll mientras está abierto: se navega al cerrarse, no al pulsar.
  const pendingTarget = useRef<string | null>(null);
  const active = useActiveSection(sectionIds);

  function goToPendingTarget(event: Event) {
    const id = pendingTarget.current;
    pendingTarget.current = null;
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", `#${id}`);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  }

  return (
    <Surface asChild variant="bar">
      <header className="sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
          <a href="#inicio" className="inline-flex shrink-0">
            <Logo className="h-11 sm:h-12 md:h-14" />
          </a>

          <nav aria-label="Principal" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <TextLink
                    variant="nav"
                    href={item.href}
                    aria-current={active === item.href.slice(1) ? "location" : undefined}
                  >
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" onCloseAutoFocus={goToPendingTarget} className="w-drawer">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                  <SheetDescription className="sr-only">Secciones de la página</SheetDescription>
                </SheetHeader>
                <nav aria-label="Principal (móvil)" className="px-4">
                  <ul className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <TextLink
                          variant="menu"
                          href={item.href}
                          onClick={(event) => {
                            event.preventDefault();
                            pendingTarget.current = item.href.slice(1);
                            setOpen(false);
                          }}
                          aria-current={active === item.href.slice(1) ? "location" : undefined}
                        >
                          {item.label}
                        </TextLink>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto p-4">
                  <BookingButton origin="menu-movil" className="w-full" />
                </div>
              </SheetContent>
            </Sheet>

            <BookingButton origin="cabecera" label="Agenda" arrow={false} size="cta-xs" className="sm:hidden" />
            <BookingButton origin="cabecera" arrow={false} size="cta-sm" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>
    </Surface>
  );
}
