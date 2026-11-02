-- Up Migration
-- Cuentas de administración sin recuperación por correo: las crea y restablece la plataforma
-- (app/src/cli.ts admin:asegurar, desde Ansible). Una contraseña que conoce alguien más (la inicial o
-- una restablecida) obliga a elegir otra al entrar. Columna con valor constante: no reescribe la tabla.
-- Los enlaces de recuperación pendientes dejan de servir; la tabla se retira en un despliegue posterior,
-- para que la imagen anterior siga arrancando si hay que volver a ella (§27).
SET lock_timeout = '5s';
SET statement_timeout = '15s';
ALTER TABLE admin_users ADD COLUMN must_change_password boolean NOT NULL DEFAULT false;
DELETE FROM password_reset_tokens;

-- Down Migration
SET lock_timeout = '5s';
SET statement_timeout = '15s';
-- Solo al deshacer la migración, con la imagen anterior, que no usa la columna.
-- squawk-ignore ban-drop-column
ALTER TABLE admin_users DROP COLUMN must_change_password;
