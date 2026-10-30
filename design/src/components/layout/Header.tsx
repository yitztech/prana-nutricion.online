import { Menu } from "lucide-react";
import { useRef, useState } from "react";
import { BookingButton } from "@/components/BookingButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

const sectionIds = navItems.map((item) => item.href.slice(1));

function Logo({ className }: { className?: string }) {
  return (
    <a href="#inicio" className={cn("inline-flex shrink-0 rounded-md", className)}>
      <img
        src="/img/logo-prana.webp"
        alt="Praná · Nutrición y Bienestar"
        width={640}
        height={213}
        className="h-11 w-auto mix-blend-multiply sm:h-12 md:h-14"
      />
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  // El Sheet bloquea el scroll mientras está abierto: se navega al cerrarse, no al pulsar.
  const pendingTarget = useRef<string | null>(null);

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
  const active = useActiveSection(sectionIds);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        <Logo />

        <nav aria-label="Principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const current = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-[0.95rem] font-medium text-foreground/85 transition-colors hover:text-primary",
                      "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity",
                      current && "text-primary after:opacity-100",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" onCloseAutoFocus={goToPendingTarget} className="w-[min(20rem,85vw)] bg-background">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl">Menú</SheetTitle>
                <SheetDescription className="sr-only">Secciones de la página</SheetDescription>
              </SheetHeader>
              <nav aria-label="Principal (móvil)" className="px-4">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={(event) => {
                          event.preventDefault();
                          pendingTarget.current = item.href.slice(1);
                          setOpen(false);
                        }}
                        aria-current={active === item.href.slice(1) ? "location" : undefined}
                        className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary aria-[current]:bg-secondary aria-[current]:text-primary"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto p-4">
                <BookingButton origin="menu-movil" className="h-11 w-full" />
              </div>
            </SheetContent>
          </Sheet>

          <BookingButton origin="cabecera" label="Agenda" arrow={false} size="sm" className="h-9 px-4 sm:hidden" />
          <BookingButton origin="cabecera" arrow={false} className="hidden h-11 px-5 text-[0.95rem] sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}
