import { Phone } from "lucide-react";
import { BookingButton } from "@/components/brand/BookingButton";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { contact } from "@/data/site";

/** Barra fija en móvil: llamar o escribir por WhatsApp. Respeta el área segura inferior. */
export function MobileActionBar() {
  return (
    <Surface asChild variant="bar">
      <aside aria-label="Contacto rápido" className="fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-safe md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="cta-outline" size="cta" className="px-4">
            <a href={contact.phoneHref}>
              <Phone className="size-5" />
              Llamar
            </a>
          </Button>
          <BookingButton origin="barra-movil" label="WhatsApp" arrow={false} icon className="px-4" />
        </div>
      </aside>
    </Surface>
  );
}
