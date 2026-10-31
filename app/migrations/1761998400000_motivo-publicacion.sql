-- Up Migration
-- El motivo de una publicación lo compone el servidor («tratamiento-borrado:<uuid>», «tratamiento:<slug>»)
-- y llega a 92 caracteres: varchar(50) se quedaba corto. Pasa al límite de texto corto de §6.3
-- (shared/limits.ts, publication.reason). Ampliar un varchar no reescribe la tabla; el bloqueo es
-- breve y la tabla, pequeña. node-pg-migrate ejecuta cada migración en una transacción.
SET lock_timeout = '5s';
SET statement_timeout = '15s';
-- squawk-ignore changing-column-type
ALTER TABLE site_publications ALTER COLUMN reason TYPE varchar(255);

-- Down Migration
SET lock_timeout = '5s';
SET statement_timeout = '15s';
-- squawk-ignore changing-column-type
ALTER TABLE site_publications ALTER COLUMN reason TYPE varchar(50) USING left(reason, 50);
