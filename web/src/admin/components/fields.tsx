/**
 * Campos del panel sobre los componentes de shadcn/ui: etiqueta asociada, ayuda, error accesible,
 * `maxlength` con el límite compartido (§6.3), contador en los textos largos y aviso al pegar de más.
 */
import { useId, useState, type ReactNode } from "react";
import { iconNames, type IconName } from "#shared/icons.ts";
import { charLength } from "#shared/limits.ts";
import { Field, FieldCounter, FieldDescription, FieldError, FieldFooter, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Surface } from "@/components/ui/surface";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/typography";

type Common = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  description?: ReactNode;
  /** Máximo de caracteres (shared/limits.ts). */
  max?: number;
  required?: boolean;
  /** Caracteres que no admite el campo (§6.2): se descartan al escribir o pegar. */
  reject?: RegExp;
  rejectMessage?: string;
  name?: string;
  className?: string;
};

type TextProps = Common & {
  multiline?: false;
  type?: "text" | "email" | "password" | "date" | "url";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  prefix?: string;
};
type AreaProps = Common & { multiline: true; rows?: number; placeholder?: string };

export function TextField(props: TextProps | AreaProps) {
  const id = useId();
  const [notice, setNotice] = useState<string | null>(null);
  const { label, value, onChange, error, description, max, required, reject, rejectMessage, name } = props;
  const describedBy = [description ? `${id}-ayuda` : null, `${id}-error`, max && props.multiline ? `${id}-contador` : null].filter(Boolean).join(" ");
  const showCounter = Boolean(max && props.multiline);

  const accept = (raw: string) => {
    let next = raw;
    if (reject) {
      const clean = raw.replace(reject, "");
      if (clean !== raw) setNotice(rejectMessage ?? "Se quitaron caracteres que este campo no admite.");
      next = clean;
    }
    onChange(next);
  };
  const onPaste = (event: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!max) return;
    const target = event.currentTarget;
    const pasted = event.clipboardData.getData("text");
    const selected = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    if (charLength(target.value) - selected + charLength(pasted) > max) {
      setNotice(`El texto pegado supera el máximo de ${max} caracteres; se cortó al final.`);
    }
  };

  const shared = {
    id,
    name,
    value,
    required,
    maxLength: max,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onPaste,
  } as const;

  return (
    <Field invalid={Boolean(error)} className={props.className}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? null : <Text asChild variant="muted"><span> (opcional)</span></Text>}
      </FieldLabel>
      {description ? <FieldDescription id={`${id}-ayuda`}>{description}</FieldDescription> : null}
      {props.multiline ? (
        <Textarea {...shared} rows={props.rows ?? 4} placeholder={props.placeholder} onChange={(e) => accept(e.target.value)} />
      ) : (
        <div className="flex items-center gap-2">
          {props.prefix ? <Text asChild variant="muted"><span aria-hidden="true">{props.prefix}</span></Text> : null}
          <Input
            {...shared}
            type={props.type ?? "text"}
            autoComplete={props.autoComplete}
            inputMode={props.inputMode}
            placeholder={props.placeholder}
            onChange={(e) => accept(e.target.value)}
          />
        </div>
      )}
      <FieldFooter>
        <FieldError id={`${id}-error`}>{error ?? notice ?? undefined}</FieldError>
        {showCounter ? (
          <FieldCounter id={`${id}-contador`}>
            {charLength(value)} / {max}
          </FieldCounter>
        ) : null}
      </FieldFooter>
    </Field>
  );
}

export function PasswordField(props: Omit<TextProps, "type"> & { autoComplete: "current-password" | "new-password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <TextField {...props} type={visible ? "text" : "password"} />
      <Text asChild variant="small-muted">
        <label className="flex w-fit items-center gap-2">
          <input type="checkbox" className="size-4 accent-primary" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Mostrar la contraseña
        </label>
      </Text>
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options, error, description, required = true }: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  error?: string;
  description?: ReactNode;
  required?: boolean;
}) {
  const id = useId();
  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription id={`${id}-ayuda`}>{description}</FieldDescription> : null}
      <NativeSelect
        id={id}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${description ? `${id}-ayuda ` : ""}${id}-error`}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  );
}

/** «moldea-tu-figura» → «Moldea tu figura». */
export const iconLabel = (name: string) => name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const iconOptions = iconNames.map((value) => ({ value, label: iconLabel(value) }));

export function IconField({ value, onChange, error, label = "Icono" }: { value: IconName; onChange: (value: IconName) => void; error?: string; label?: string }) {
  return (
    <div className="flex items-end gap-3">
      <IconImage name={value} size={48} />
      <div className="min-w-0 flex-1">
        <SelectField label={label} value={value} onChange={onChange} options={iconOptions} error={error} />
      </div>
    </div>
  );
}

export function CheckboxField({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (value: boolean) => void; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" className="mt-0.5 size-5 accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-ayuda` : undefined} />
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description ? <FieldDescription id={`${id}-ayuda`}>{description}</FieldDescription> : null}
      </div>
    </div>
  );
}

/** Icono de Praná (web/public/img/iconos) sobre su círculo; decorativo. */
export function IconImage({ name, size }: { name: IconName; size: 40 | 48 }) {
  return (
    <Surface asChild variant="icon" className={size === 48 ? "size-12 shrink-0 p-1" : "size-10 shrink-0 p-1"}>
      <img src={`/img/iconos/${name}.webp`} alt="" width={size} height={size} />
    </Surface>
  );
}
