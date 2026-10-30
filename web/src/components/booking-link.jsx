import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { bookingUrl } from "@/lib/booking";

export function BookingLink({
  service,
  placement,
  children = "Agendar mi valoración",
  variant = "booking",
  size = "booking",
  className,
}) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={bookingUrl(service)}
        target="_blank"
        rel="noopener noreferrer"
        data-reserva={placement}
        data-servicio={service}
        data-umami-event="reserva-whatsapp"
        data-umami-event-origen={placement}
        data-umami-event-servicio={service || "Valoración general"}
      >
        {placement === "mobile" && (
          <Icon name="phone" data-icon="inline-start" />
        )}
        {children}
        {placement !== "mobile" && (
          <Icon name="arrow-right" data-icon="inline-end" />
        )}
        {service && <span className="sr-only"> de {service}</span>}
      </a>
    </Button>
  );
}
