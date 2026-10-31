import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type FormEvent } from "react";
import {
  contactLimits,
  contactMessages,
  filterField,
  filterMessage,
  pasteExceeds,
  validateContact,
  whatsappUrl,
  type ContactField,
  type ContactValues,
} from "./message";

/** `filter`: un carácter descartado, el aviso se queda. `validation`: se retira al corregir el campo. */
type FieldError = { text: string; origin: "filter" | "validation" };

export function useContactForm(services: readonly string[]) {
  const [values, setValues] = useState<ContactValues>({ name: "", phone: "", service: services[0] ?? "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<ContactField, FieldError>>>({});
  const [status, setStatus] = useState("");
  const [continueUrl, setContinueUrl] = useState<string | null>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const continueRef = useRef<HTMLAnchorElement | null>(null);

  // Un enlace preparado antes de editar ya no representaría lo que hay en los campos.
  const invalidateMessage = useCallback(() => {
    setContinueUrl(null);
    setStatus("");
  }, []);

  const change = useCallback((field: ContactField, raw: string) => {
    invalidateMessage();
    const { value, rejected } = filterField(field, raw);
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (rejected && filterMessage[field]) return { ...current, [field]: { text: filterMessage[field]!, origin: "filter" } };
      if (current[field]?.origin === "validation" && value.trim()) return { ...current, [field]: undefined };
      return current;
    });
  }, [invalidateMessage]);

  const changeService = useCallback((service: string) => {
    invalidateMessage();
    setValues((current) => ({ ...current, service }));
  }, [invalidateMessage]);

  // Lo pegado de más no se recorta en silencio: el navegador aplica maxlength y aquí se avisa.
  const paste = useCallback((field: ContactField, event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const pasted = event.clipboardData?.getData("text") ?? "";
    const max = contactLimits[field];
    const selection = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    if (pasteExceeds(target.value, selection, pasted, max)) {
      setTimeout(() => setErrors((current) => ({ ...current, [field]: { text: contactMessages.pasteTooLong(max), origin: "filter" } })));
    }
  }, []);

  // Las reservas de un tratamiento también lo dejan elegido en este formulario opcional.
  useEffect(() => {
    const select = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-servicio]");
      const service = link?.dataset.servicio;
      if (service && services.includes(service)) changeService(service);
    };
    document.addEventListener("click", select);
    return () => document.removeEventListener("click", select);
  }, [services, changeService]);

  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, data } = validateContact(values);
    setErrors(Object.fromEntries(Object.entries(found).map(([field, text]) => [field, { text, origin: "validation" }])));
    if (!data) {
      setStatus(contactMessages.review);
      const first = (["name", "phone", "message"] as const).find((field) => found[field]);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }
    const url = whatsappUrl(data);
    if (url === continueUrl) {
      continueRef.current?.focus();
      return;
    }
    setContinueUrl(url);
    setStatus(contactMessages.ready);
    // Con noopener, null también puede ser una apertura correcta: los datos se conservan siempre.
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setStatus(contactMessages.openFailed);
    }
  }, [values, continueUrl]);

  return {
    values,
    errors: Object.fromEntries(Object.entries(errors).map(([field, error]) => [field, error?.text])) as Partial<Record<ContactField, string>>,
    status,
    continueUrl,
    fieldRefs,
    continueRef,
    change,
    changeService,
    paste,
    submit,
  };
}
