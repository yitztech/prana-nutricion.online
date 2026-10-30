import { BookingLink } from "@/components/booking-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ServiceCard({ title, service, image, children }) {
  return (
    <Card as="article" variant="service" className="group">
      <CardContent className="p-0">
        <div className="h-52 overflow-hidden rounded-xl lg:h-56">{image}</div>
      </CardContent>
      <CardHeader className="gap-2 px-0">
        <CardTitle as="h3">{title}</CardTitle>
        <CardDescription as="p">{children}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto px-0 pt-1">
        <BookingLink
          service={service}
          placement="service"
          variant="service"
          size="service"
        >
          Agendar valoración
        </BookingLink>
      </CardFooter>
    </Card>
  );
}
