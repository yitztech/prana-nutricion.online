/** Entrar, pedir un enlace para restablecer la contraseña y elegir una nueva desde ese enlace. */
import { useMemo, useRef, useState, type ReactNode } from "react";
import { limits, passwordPolicy } from "#shared/limits.ts";
import { loginSchema, passwordResetRequestSchema, passwordResetSchema } from "#shared/schemas.ts";
import { Logo } from "@/components/brand/ui/logo";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { api } from "../lib/api";
import { check, ClientErrors, useSubmit } from "../lib/form";
import { Link, useRouter } from "../lib/router";
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
          <TextLink asChild variant="inline" className="w-fit"><Link to="/recuperar">¿Olvidaste tu contraseña?</Link></TextLink>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  return (
    <AuthCard title="Restablecer la contraseña" description="Te enviaremos un enlace, válido durante una hora, para elegir una contraseña nueva.">
      {sent ? (
        <FieldGroup>
          <Notice tone="success">{sent}</Notice>
          <TextLink asChild variant="inline" className="w-fit"><Link to="/entrar">Volver a entrar</Link></TextLink>
        </FieldGroup>
      ) : (
        <form
          ref={form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const input = check(passwordResetRequestSchema, { email });
              const { detail } = await api<{ detail: string }>("POST", "/api/auth/password-reset", { body: input, quiet401: true });
              setSent(detail);
            }, form.current);
          }}
        >
          <FieldGroup>
            <Notice tone="error">{message}</Notice>
            <TextField label="Correo" type="email" autoComplete="username" inputMode="email" required max={limits.admin.email}
              value={email} onChange={setEmail} error={errors.email} />
            <SubmitButton busy={busy} busyLabel="Enviando…">Enviar el enlace</SubmitButton>
            <TextLink asChild variant="inline" className="w-fit"><Link to="/entrar">Volver a entrar</Link></TextLink>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { navigate } = useRouter();
  // El token viaja en el fragmento (#token=…): no llega al servidor al abrir el enlace.
  const token = useMemo(() => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "", []);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();

  if (!token) {
    return (
      <AuthCard title="Enlace no válido" description="El enlace está incompleto o ya no sirve.">
        <Button asChild size="lg"><Link to="/recuperar">Pedir un enlace nuevo</Link></Button>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Elige una contraseña nueva" description={`Al menos ${passwordPolicy.minLength} caracteres. Al guardarla se cierran las sesiones abiertas.`}>
      {done ? (
        <FieldGroup>
          <Notice tone="success">Listo: tu contraseña cambió. Ya puedes entrar con ella.</Notice>
          <Button size="lg" onClick={() => navigate("/entrar", { replace: true })}>Entrar</Button>
        </FieldGroup>
      ) : (
        <form
          ref={form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const input = check(passwordResetSchema, { token, password });
              if (repeat !== password) throw new ClientErrors({ repeat: "Las contraseñas no coinciden." });
              await api("POST", "/api/auth/password-reset/confirm", { body: input, quiet401: true });
              // El token ya no sirve: se quita de la barra de direcciones y del historial.
              window.history.replaceState(null, "", window.location.pathname);
              setDone(true);
            }, form.current);
          }}
        >
          <FieldGroup>
            <Notice tone="error">{errors.token ?? message}</Notice>
            {errors.token ? <TextLink asChild variant="inline" className="w-fit"><Link to="/recuperar">Pedir un enlace nuevo</Link></TextLink> : null}
            <PasswordField label="Contraseña nueva" autoComplete="new-password" required max={passwordPolicy.maxLength}
              value={password} onChange={setPassword} error={errors.password} />
            <PasswordField label="Repite la contraseña" autoComplete="new-password" required max={passwordPolicy.maxLength}
              value={repeat} onChange={setRepeat} error={errors.repeat} />
            <SubmitButton busy={busy}>Guardar la contraseña</SubmitButton>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
