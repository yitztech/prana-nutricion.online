import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ServiceCard({ title, service, image, icon, children }) {
  return (
    <Card as="article" variant="service" className="group">
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden">
          {image}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </CardContent>
      <CardHeader className="px-8 pt-2">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-xs">
          {icon}
        </div>
        <CardTitle as="h3">{title}</CardTitle>
        <CardDescription as="p">{children}</CardDescription>
      </CardHeader>
      <CardFooter className="px-8 pb-8">
        <Button asChild variant="service" size="link">
          <a href="#contacto" data-servicio={service}>
            Saber más <span className="sr-only">sobre {title}</span>
            <svg className="icono" data-icon="inline-end" aria-hidden="true">
              <use href="/assets/iconos.svg#arrow-right" />
            </svg>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
