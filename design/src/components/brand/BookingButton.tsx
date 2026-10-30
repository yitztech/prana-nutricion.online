import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";
import { WhatsAppIcon } from "@/components/brand/BrandIcons";
import { Button } from "@/components/ui/button";
import { bookingUrl } from "@/lib/booking";

type BookingButtonProps = Omit<ComponentProps<typeof Button>, "asChild" | "children" | "variant"> & {
  treatment?: string;
  origin: string;
  label?: string;
  arrow?: boolean;
  /** Icono de WhatsApp delante del texto, para la barra móvil. */
  icon?: boolean;
};

/** Enlace nativo a WhatsApp con el mensaje preparado; funciona sin JavaScript. */
export function BookingButton({
  treatment,
  origin,
  label = "Agenda tu valoración",
  arrow = true,
  icon = false,
  size = "cta",
  ...props
}: BookingButtonProps) {
  return (
    <Button asChild variant="cta" size={size} {...props}>
      <a
        href={bookingUrl(treatment)}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="reserva-whatsapp"
        data-umami-event-origen={origin}
        data-umami-event-servicio={treatment ?? "general"}
      >
        {icon && <WhatsAppIcon className="size-5" />}
        {label}
        {arrow && <ArrowRight className="size-4" />}
        <span className="sr-only"> (abre WhatsApp)</span>
      </a>
    </Button>
  );
}
