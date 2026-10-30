import { Phone } from "lucide-react";
import { BookingButton } from "@/components/booking-button";
import { Button } from "@/components/ui/button";
import { PHONE_HREF } from "@/lib/booking";

/** Barra fija en móvil: llamar o escribir por WhatsApp. Respeta el área segura inferior. */
export function MobileActionBar() {
  return (
    <aside aria-label="Contacto rápido" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <Button
          asChild
          variant="outline"
          className="h-12 rounded-full border-2 border-primary bg-white text-base font-semibold text-primary hover:bg-secondary hover:text-primary"
        >
          <a href={PHONE_HREF}>
            <Phone className="size-5" />
            Llamar
          </a>
        </Button>
        <BookingButton origin="barra-movil" label="WhatsApp" arrow={false} className="h-12 text-base [&_svg]:size-5" />
      </div>
    </aside>
  );
}
