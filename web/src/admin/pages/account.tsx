/**
 * Cuenta: cambiar la contraseña. Mantiene esta sesión y cierra las demás. Con una contraseña puesta por la
 * plataforma (mustChangePassword), es la única pantalla disponible hasta elegir una propia.
 */
import { useRef, useState } from "react";
import { passwordPolicy } from "#shared/limits.ts";
import { passwordChangeSchema } from "#shared/schemas.ts";
import { FieldGroup } from "@/components/ui/field";
import { api } from "../lib/api";
import { check, ClientErrors, useSubmit } from "../lib/form";
import { useSession } from "../lib/session";
import { PasswordField } from "../components/fields";
import { Notice, PageTitle, Panel, SubmitButton } from "../components/layout";

export function AccountPage() {
  const { state, passwordChanged } = useSession();
  const required = state.status === "signed-in" && state.user.mustChangePassword;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  const email = state.status === "signed-in" ? state.user.email : "";
  return (
    <>
      <PageTitle description={`Entras como ${email}.`}>Tu cuenta</PageTitle>
      {required ? (
        <Notice tone="info">
          Antes de editar el sitio, cambia la contraseña que te dieron por una que solo conozcas tú.
        </Notice>
      ) : null}
      <Panel title="Cambiar la contraseña" className="max-w-xl">
        <form
          ref={form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setDone(false);
            void run(async () => {
              const input = check(passwordChangeSchema, { currentPassword: current, newPassword: next });
              if (repeat !== next) throw new ClientErrors({ repeat: "Las contraseñas no coinciden." });
              await api("POST", "/api/auth/password", { body: input });
              setCurrent("");
              setNext("");
              setRepeat("");
              setDone(true);
              passwordChanged();
            }, form.current);
          }}
        >
          <FieldGroup>
            {done ? <Notice tone="success">Contraseña cambiada. Se cerraron las sesiones abiertas en otros dispositivos.</Notice> : null}
            <Notice tone="error">{message}</Notice>
            <PasswordField label="Contraseña actual" autoComplete="current-password" required max={passwordPolicy.maxLength}
              value={current} onChange={setCurrent} error={errors.currentPassword} />
            <PasswordField label="Contraseña nueva" autoComplete="new-password" required max={passwordPolicy.maxLength}
              description={`Al menos ${passwordPolicy.minLength} caracteres. Mejor una frase de varias palabras que no tengan que ver contigo ni con la clínica, o la que te proponga tu gestor de contraseñas.`} value={next} onChange={setNext} error={errors.newPassword} />
            <PasswordField label="Repite la contraseña nueva" autoComplete="new-password" required max={passwordPolicy.maxLength}
              value={repeat} onChange={setRepeat} error={errors.repeat} />
            <SubmitButton busy={busy}>Cambiar la contraseña</SubmitButton>
          </FieldGroup>
        </form>
      </Panel>
    </>
  );
}
