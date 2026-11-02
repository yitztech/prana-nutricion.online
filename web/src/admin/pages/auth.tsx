/**
 * Entrar al editor. Es un panel de administración: no hay recuperación de contraseña por correo. Si se
 * olvida, la restablece quien administra el sitio desde la plataforma (admin:asegurar --restablecer).
 */
import { useRef, useState, type ReactNode } from "react";
import { limits, passwordPolicy } from "#shared/limits.ts";
import { loginSchema } from "#shared/schemas.ts";
import { Logo } from "@/components/brand/ui/logo";
import { FieldGroup } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { check, useSubmit } from "../lib/form";
import { useSession } from "../lib/session";
import { PasswordField, TextField } from "../components/fields";
import { Notice, PageTitle, SubmitButton } from "../components/layout";

function AuthCard({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <Surface asChild variant="backdrop" className="flex min-h-dvh items-center justify-center px-4 py-10">
      <main id="contenido">
        <Surface variant="auth" className="w-full max-w-md p-6 sm:p-8">
          <Logo className="mx-auto mb-6 h-16" />
          <PageTitle description={description}>{title}</PageTitle>
          {children}
        </Surface>
      </main>
    </Surface>
  );
}

export function LoginPage({ expired }: { expired: boolean }) {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  return (
    <AuthCard title="Editor del sitio" description="Entra con tu correo para editar el contenido de prana-nutricion.online.">
      <form
        ref={form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const input = check(loginSchema, { email, password });
            await signIn(input.email, input.password);
          }, form.current);
        }}
      >
        <FieldGroup>
          {expired && !message ? <Notice tone="info">Tu sesión terminó. Vuelve a entrar para seguir editando.</Notice> : null}
          <Notice tone="error">{message}</Notice>
          <TextField label="Correo" type="email" autoComplete="username" inputMode="email" required max={limits.admin.email}
            value={email} onChange={setEmail} error={errors.email} />
          <PasswordField label="Contraseña" autoComplete="current-password" required max={passwordPolicy.maxLength}
            value={password} onChange={setPassword} error={errors.password} />
          <SubmitButton busy={busy} busyLabel="Entrando…">Entrar</SubmitButton>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
