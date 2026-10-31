/** Piezas comunes de las pantallas del panel: título, avisos, botones de envío y confirmaciones. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Surface } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Título de la pantalla. Recibe el foco al llegar, para que el lector de pantalla anuncie el cambio. */
export function PageTitle({ children, description, actions }: { children: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <Heading as="h1" ref={ref} tabIndex={-1} variant="page">
          {children}
        </Heading>
        {description ? <Text variant="muted" className="max-w-2xl">{description}</Text> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Aviso de éxito o error junto al formulario; se anuncia sin mover el foco. */
export function Notice({ tone, children, className }: { tone: "success" | "error" | "info"; children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <Alert role={tone === "error" ? "alert" : "status"} variant={tone === "error" ? "destructive" : tone} className={className}>
      {children}
    </Alert>
  );
}

export function SubmitButton({ busy, children, busyLabel = "Guardando…", ...props }: React.ComponentProps<typeof Button> & { busy: boolean; busyLabel?: string }) {
  return (
    <Button type="submit" size="lg" disabled={busy || props.disabled} aria-disabled={busy || undefined} {...props}>
      {busy ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
      {busy ? busyLabel : children}
    </Button>
  );
}

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <Text role="status" variant="muted" className="flex items-center gap-2">
      <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
      {label}
    </Text>
  );
}

export function Panel({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <Surface asChild variant="card" className={cn("p-5 md:p-6", className)}>
      <section aria-label={title}>
        {title ? <Heading variant="block" className="mb-4">{title}</Heading> : null}
        {children}
      </section>
    </Surface>
  );
}

/** Botón que pide confirmación antes de una acción que no se puede deshacer. */
export function ConfirmButton({ label, title, description, confirmLabel, onConfirm, variant = "destructive", size = "default" }: {
  label: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => { setError(null); setOpen(true); }}>
        {label}
      </Button>
      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Notice tone="error">{error}</Notice>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await onConfirm();
                  setOpen(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
