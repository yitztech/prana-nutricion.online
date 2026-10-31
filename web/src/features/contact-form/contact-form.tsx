import { useMemo } from "react";
import { useContent } from "@/hooks/use-content";
import { ContactFormView } from "./components/ContactFormView";
import { contactLimits } from "./model/message";
import { useContactForm } from "./model/use-contact-form";

const GENERAL = "Asesoría general";

/** Formulario opcional: los tratamientos del catálogo, agrupados por categoría. */
export function ContactForm() {
  const { categories } = useContent();
  const groups = useMemo(
    () => categories.map((category) => ({ label: category.title, options: category.treatments.map((t) => t.name) })),
    [categories],
  );
  const services = useMemo(() => [GENERAL, ...groups.flatMap((group) => group.options)], [groups]);
  const form = useContactForm(services);
  return (
    <ContactFormView
      values={form.values}
      errors={form.errors}
      status={form.status}
      continueUrl={form.continueUrl}
      limits={contactLimits}
      general={GENERAL}
      groups={groups}
      fieldRefs={form.fieldRefs}
      continueRef={form.continueRef}
      onChange={form.change}
      onServiceChange={form.changeService}
      onPaste={form.paste}
      onSubmit={form.submit}
    />
  );
}
