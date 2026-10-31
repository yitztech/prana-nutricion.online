import type { ClipboardEvent, FormEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldCounter, FieldError, FieldFooter, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { TextLink } from "@/components/ui/text-link";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/typography";

type FormField = "name" | "phone" | "message";
type Values = { name: string; phone: string; service: string; message: string };

export type ServiceGroup = { label: string; options: string[] };

type ContactFormViewProps = {
  values: Values;
  errors: Partial<Record<FormField, string>>;
  status: string;
  continueUrl: string | null;
  limits: { name: number; phone: number; message: number };
  general: string;
  groups: ServiceGroup[];
  fieldRefs: RefObject<Partial<Record<FormField, HTMLInputElement | HTMLTextAreaElement | null>>>;
  continueRef: RefObject<HTMLAnchorElement | null>;
  onChange: (field: FormField, value: string) => void;
  onServiceChange: (service: string) => void;
  onPaste: (field: FormField, event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

/** Prepara un mensaje de WhatsApp. No envía nada al servidor. */
export function ContactFormView({
  values, errors, status, continueUrl, limits, general, groups, fieldRefs, continueRef,
  onChange, onServiceChange, onPaste, onSubmit,
}: ContactFormViewProps) {
  const describedBy = (field: FormField, extra?: string) => [extra, errors[field] ? `wa-${ids[field]}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <form id="whatsapp-form" noValidate onSubmit={onSubmit} aria-labelledby="formulario-titulo">
      <FieldGroup>
        <FieldGroup columns="two">
          <Field invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="wa-nombre">Nombre completo</FieldLabel>
            <Input
              ref={(el) => { fieldRefs.current.name = el; }}
              id="wa-nombre"
              name="nombre"
              type="text"
              required
              maxLength={limits.name}
              autoComplete="name"
              placeholder="Tu nombre"
              value={values.name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              onChange={(event) => onChange("name", event.target.value)}
              onPaste={(event) => onPaste("name", event)}
            />
            <FieldError id="wa-nombre-error">{errors.name}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="wa-telefono">Teléfono</FieldLabel>
            <Input
              ref={(el) => { fieldRefs.current.phone = el; }}
              id="wa-telefono"
              name="telefono"
              type="tel"
              inputMode="tel"
              required
              maxLength={limits.phone}
              autoComplete="tel"
              placeholder="777 123 4567"
              value={values.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy("phone")}
              onChange={(event) => onChange("phone", event.target.value)}
              onPaste={(event) => onPaste("phone", event)}
            />
            <FieldError id="wa-telefono-error">{errors.phone}</FieldError>
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="wa-servicio">Servicio de Interés</FieldLabel>
          <NativeSelect id="wa-servicio" name="servicio" value={values.service} onChange={(event) => onServiceChange(event.target.value)}>
            <NativeSelectOption value={general}>{general}</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOptGroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <NativeSelectOption key={option} value={option}>{option}</NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        </Field>
        <Field invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="wa-mensaje">Mensaje</FieldLabel>
          <Textarea
            ref={(el) => { fieldRefs.current.message = el; }}
            id="wa-mensaje"
            name="mensaje"
            rows={4}
            required
            maxLength={limits.message}
            placeholder="¿Cómo podemos ayudarte a alcanzar tus metas?"
            value={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message", "wa-mensaje-contador")}
            onChange={(event) => onChange("message", event.target.value)}
            onPaste={(event) => onPaste("message", event)}
          />
          <FieldFooter>
            <FieldError id="wa-mensaje-error">{errors.message}</FieldError>
            <FieldCounter id="wa-mensaje-contador">{`${values.message.length} / ${limits.message}`}</FieldCounter>
          </FieldFooter>
        </Field>
        <Button type="submit" variant="default" size="lg" className="w-full">
          Preparar mensaje en WhatsApp
        </Button>
        <Text asChild variant="small" className="text-center">
          <p id="wa-estado" role="status">{status}</p>
        </Text>
        {continueUrl && (
          <TextLink
            ref={continueRef}
            id="wa-continuar"
            href={continueUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="inline"
            className="mx-auto"
          >
            Continuar en WhatsApp
          </TextLink>
        )}
        <Text variant="note" className="text-center">
          Al preparar el mensaje se abre WhatsApp con tu texto; este sitio no lo guarda. Consulta nuestro{" "}
          <TextLink variant="inline" href="/privacidad">aviso de privacidad</TextLink>.
        </Text>
      </FieldGroup>
    </form>
  );
}

const ids: Record<FormField, string> = { name: "nombre", phone: "telefono", message: "mensaje" };
