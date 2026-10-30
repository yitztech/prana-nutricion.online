import type { ReactNode } from "react";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";

type ContactItemProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /** Si hay enlace, todo el elemento es pulsable. */
  href?: string;
  external?: boolean;
};

/** Dato de contacto con icono y título; enlace si se puede abrir (mapa, teléfono, correo). */
export function ContactItem({ icon, title, children, href, external = false }: ContactItemProps) {
  const content = (
    <>
      {icon}
      <Text asChild variant="small">
        <span>
          <Text asChild variant="label">
            <span className="block">{title}</span>
          </Text>
          {children}
        </span>
      </Text>
    </>
  );

  return (
    <Surface asChild variant="item">
      {href ? (
        <a href={href} className="flex gap-3 p-4" {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
          {content}
        </a>
      ) : (
        <div className="flex gap-3 p-4">{content}</div>
      )}
    </Surface>
  );
}
