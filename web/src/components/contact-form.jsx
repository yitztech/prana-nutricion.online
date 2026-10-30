import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ContactForm() {
  return (
    <form id="whatsapp-form" noValidate>
      <FieldGroup>
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel htmlFor="wa-nombre">{"Nombre completo"}</FieldLabel>
            <Input
              type="text"
              id="wa-nombre"
              name="nombre"
              required
              maxLength="50"
              autoComplete="name"
              aria-describedby="wa-nombre-error"
              placeholder="Tu nombre"
            />
            <p
              id="wa-nombre-error"
              className="text-sm text-destructive"
              hidden
              aria-live="polite"
            ></p>
          </Field>
          <Field>
            <FieldLabel htmlFor="wa-telefono">{"Teléfono"}</FieldLabel>
            <Input
              type="tel"
              id="wa-telefono"
              name="telefono"
              required
              maxLength="20"
              inputMode="tel"
              autoComplete="tel"
              aria-describedby="wa-telefono-error"
              placeholder="(123) 456-7890"
            />
            <p
              id="wa-telefono-error"
              className="text-sm text-destructive"
              hidden
              aria-live="polite"
            ></p>
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="wa-servicio">{"Servicio de Interés"}</FieldLabel>
          <NativeSelect id="wa-servicio" name="servicio" required>
            <NativeSelectOption value="Nutrición Moldeadora">
              {"Nutrición Moldeadora"}
            </NativeSelectOption>
            <NativeSelectOption value="Cuidado de la Piel">
              {"Cuidado de la Piel"}
            </NativeSelectOption>
            <NativeSelectOption value="Recuperación Postoperatoria">
              {"Recuperación Postoperatoria"}
            </NativeSelectOption>
            <NativeSelectOption value="Asesoría General">
              {"Asesoría General"}
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="wa-mensaje">{"Mensaje"}</FieldLabel>
          <Textarea
            rows="4"
            id="wa-mensaje"
            name="mensaje"
            required
            maxLength="2000"
            aria-describedby="wa-mensaje-contador wa-mensaje-error"
            placeholder="¿Cómo podemos ayudarte a alcanzar tus metas?"
          ></Textarea>
          <div className="mt-2 flex justify-between gap-4 text-sm">
            <p
              id="wa-mensaje-error"
              className="text-sm text-destructive"
              hidden
              aria-live="polite"
            ></p>
            <p id="wa-mensaje-contador" className="ml-auto text-gray-500">
              {"0 / 2000"}
            </p>
          </div>
        </Field>
        <Button
          type="submit"
          className="w-full"
          variant="charcoal"
          size="submit"
        >
          {
            "\n                            Preparar mensaje en WhatsApp\n                        "
          }
        </Button>
        <p
          id="wa-estado"
          role="status"
          className="text-sm text-gray-600 text-center"
        ></p>
        <a
          id="wa-continuar"
          target="_blank"
          rel="noopener noreferrer"
          hidden
          className="block text-sm font-medium text-charcoal underline underline-offset-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
        >
          {"Continuar en WhatsApp"}
        </a>
        <p className="text-xs text-gray-500 text-center">
          {
            "Al enviar, se abre WhatsApp con tu mensaje. Consulta\n                            nuestro "
          }
          <a href="/privacidad" className="underline hover:text-rose-ink">
            {"aviso de privacidad"}
          </a>
          {"."}
        </p>
      </FieldGroup>
    </form>
  );
}
