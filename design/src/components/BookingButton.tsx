import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { bookingUrl } from "@/lib/booking";
import { cn } from "@/lib/utils";

type BookingButtonProps = Omit<ComponentProps<typeof Button>, "asChild" | "children"> & {
  treatment?: string;
  origin: string;
  label?: string;
  arrow?: boolean;
};

/** Enlace nativo a WhatsApp con el mensaje preparado; funciona sin JavaScript. */
export function BookingButton({
  treatment,
  origin,
  label = "Agenda tu valoración",
  arrow = true,
  className,
  ...props
}: BookingButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "bg-prana-boton rounded-full font-semibold text-white shadow-soft hover:brightness-110",
        className,
      )}
      {...props}
    >
      <a
        href={bookingUrl(treatment)}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="reserva-whatsapp"
        data-umami-event-origen={origin}
        data-umami-event-servicio={treatment ?? "general"}
      >
        <WhatsAppIcon className="size-4" />
        {label}
        {arrow && <ArrowRight className="size-4" />}
        <span className="sr-only"> (abre WhatsApp)</span>
      </a>
    </Button>
  );
}
