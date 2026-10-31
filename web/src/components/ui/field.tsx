import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Agrupa campos con el espacio del formulario. `columns` los pone en dos columnas desde md. */
const fieldGroupVariants = cva("flex w-full flex-col gap-6", {
  variants: { columns: { one: "", two: "md:grid md:grid-cols-2" } },
  defaultVariants: { columns: "one" },
});

function FieldGroup({ className, columns, ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldGroupVariants>) {
  return <div data-slot="field-group" className={cn(fieldGroupVariants({ columns }), className)} {...props} />;
}

/** Un campo: etiqueta, control, ayuda y error. `invalid` tiñe la etiqueta. */
function Field({ className, invalid, ...props }: React.ComponentProps<"div"> & { invalid?: boolean }) {
  return (
    <div
      data-slot="field"
      data-invalid={invalid ? "true" : undefined}
      className={cn("group/field flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm leading-snug font-medium text-foreground group-data-[invalid=true]/field:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset data-slot="field-set" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return <legend data-slot="field-legend" className={cn("mb-2 text-base font-medium text-heading", className)} {...props} />;
}

/** Ayuda del campo (formato, límites). */
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

/** Error del campo. Se anuncia sin mover el foco; vacío, no ocupa espacio. */
function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      aria-live="polite"
      hidden={!children}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/** Contador de caracteres de los textos largos. */
function FieldCounter({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-counter" className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)} {...props} />;
}

/** Fila bajo el control: error a la izquierda, contador a la derecha. */
function FieldFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-footer" className={cn("flex justify-between gap-4", className)} {...props} />;
}

export { Field, FieldCounter, FieldDescription, FieldError, FieldFooter, FieldGroup, FieldLabel, FieldLegend, FieldSet };
