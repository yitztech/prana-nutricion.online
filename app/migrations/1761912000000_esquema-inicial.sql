-- Up Migration
-- Crea tablas vacías: sus índices no bloquean a nadie y la migración de vuelta borra lo que crea.
-- squawk-ignore-file require-concurrent-index-creation, ban-drop-table, require-lock-timeout, require-statement-timeout
-- Esquema inicial del editor del sitio. Los límites de longitud son los de shared/limits.ts
-- (tests/db/limites.test.ts los compara). Fechas en timestamptz (UTC) y dinero en centavos de MXN.

-- ── Cuentas del admin ──────────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  email varchar(254) NOT NULL,
  name varchar(50) NOT NULL,
  password_hash text NOT NULL,
  password_changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_email_lower CHECK (email = lower(email)),
  CONSTRAINT admin_users_hash_argon2id CHECK (password_hash LIKE '$argon2id$%')
);
CREATE UNIQUE INDEX admin_users_email_key ON admin_users (email);

-- Sesiones: solo el hash SHA-256 del identificador; caducidad por inactividad y absoluta.
CREATE TABLE admin_sessions (
  token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash) = 32),
  user_id uuid NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX admin_sessions_user_id_idx ON admin_sessions (user_id);
CREATE INDEX admin_sessions_expires_at_idx ON admin_sessions (expires_at);

CREATE TABLE password_reset_tokens (
  token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash) = 32),
  user_id uuid NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  CHECK (expires_at <= created_at + interval '1 hour')
);
CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);

-- Intentos fallidos de inicio de sesión y solicitudes de recuperación, para limitar por IP real y por
-- cuenta (§24). `subject` es el correo escrito, exista o no la cuenta: el bloqueo no revela cuáles existen.
CREATE TABLE auth_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind varchar(20) NOT NULL CHECK (kind IN ('login', 'password_reset')),
  ip inet NOT NULL,
  subject varchar(254),
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_attempts_ip_idx ON auth_attempts (kind, ip, attempted_at);
CREATE INDEX auth_attempts_subject_idx ON auth_attempts (kind, subject, attempted_at);

-- Acciones de administración: quién, qué y cuándo (§25).
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  user_id uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  entity varchar(50) NOT NULL,
  entity_id varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_at_idx ON audit_log (created_at DESC);
CREATE INDEX audit_log_user_id_idx ON audit_log (user_id);

-- ── Imágenes subidas ───────────────────────────────────────────────────────────
-- El archivo está en el volumen `uploads` con un nombre que genera el servidor: <id>-<ancho>.webp
CREATE TABLE uploads (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  purpose varchar(20) NOT NULL CHECK (purpose IN ('promocion')),
  width integer NOT NULL CHECK (width > 0),
  height integer NOT NULL CHECK (height > 0),
  widths integer[] NOT NULL CHECK (cardinality(widths) BETWEEN 1 AND 5),
  bytes integer NOT NULL CHECK (bytes > 0),
  created_by uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Documentos legales ─────────────────────────────────────────────────────────
CREATE TABLE legal_documents (
  slug varchar(20) PRIMARY KEY CHECK (slug IN ('privacidad', 'condiciones')),
  title varchar(150) NOT NULL CHECK (char_length(btrim(title)) > 0),
  body jsonb NOT NULL CHECK (jsonb_typeof(body) = 'object' AND body ->> 'type' = 'doc'),
  published_on date NOT NULL,
  updated_by uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cada publicación queda guardada: se puede consultar o recuperar una versión anterior.
CREATE TABLE legal_document_versions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  slug varchar(20) NOT NULL REFERENCES legal_documents (slug) ON DELETE CASCADE,
  title varchar(150) NOT NULL,
  body jsonb NOT NULL,
  published_on date NOT NULL,
  created_by uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX legal_document_versions_slug_idx ON legal_document_versions (slug, created_at DESC);

-- ── Catálogo ──────────────────────────────────────────────────────────────────
-- Las cuatro categorías tienen página propia (/tratamientos/<id>/) y foto fija: se editan sus textos.
CREATE TABLE categories (
  id varchar(50) PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position smallint NOT NULL CHECK (position >= 0),
  title varchar(60) NOT NULL CHECK (char_length(btrim(title)) > 0),
  description varchar(300) NOT NULL,
  photo varchar(100) NOT NULL,
  photo_alt varchar(255) NOT NULL,
  icon varchar(50) NOT NULL,
  cta varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE category_benefits (
  category_id varchar(50) NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 5),
  text varchar(200) NOT NULL CHECK (char_length(btrim(text)) > 0),
  PRIMARY KEY (category_id, position)
);

-- El slug forma la URL del apartado (/tratamientos/<categoría>/#<slug>): no cambia al renombrar.
CREATE TABLE treatments (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  category_id varchar(50) NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  slug varchar(80) NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name varchar(60) NOT NULL CHECK (char_length(btrim(name)) > 0),
  icon varchar(50) NOT NULL,
  description varchar(600) NOT NULL CHECK (char_length(btrim(description)) > 0),
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 29),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT treatments_category_slug_key UNIQUE (category_id, slug)
);

-- ── Promociones ───────────────────────────────────────────────────────────────
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  slug varchar(80) NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status varchar(10) NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  position smallint NOT NULL DEFAULT 0 CHECK (position >= 0),
  name varchar(80) NOT NULL CHECK (char_length(btrim(name)) > 0),
  campaign varchar(60),
  tagline varchar(80),
  description varchar(400) NOT NULL,
  price_cents integer CHECK (price_cents BETWEEN 0 AND 100000000),
  deposit_cents integer CHECK (deposit_cents BETWEEN 0 AND 100000000),
  reservation_note varchar(200),
  discount_percent smallint CHECK (discount_percent BETWEEN 1 AND 100),
  starts_on date,
  ends_on date,
  image_upload_id uuid REFERENCES uploads (id) ON DELETE RESTRICT,
  image_path varchar(255) CHECK (image_path ~ '^/img/[a-z0-9-]+\.webp$'),
  image_alt varchar(255) NOT NULL,
  cta_label varchar(40),
  cta_treatment varchar(200),
  period_label varchar(60),
  offer_label varchar(40),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotions_slug_key UNIQUE (slug),
  CONSTRAINT promotions_one_image CHECK (num_nonnulls(image_upload_id, image_path) = 1),
  -- Una vigente o inactiva tiene fecha de fin y botón; una archivada no se puede contratar.
  CONSTRAINT promotions_offer_fields CHECK (status = 'archived' OR (ends_on IS NOT NULL AND cta_label IS NOT NULL)),
  CONSTRAINT promotions_period CHECK (starts_on IS NULL OR ends_on IS NULL OR starts_on <= ends_on)
);
CREATE INDEX promotions_status_idx ON promotions (status, position);
CREATE INDEX promotions_image_upload_id_idx ON promotions (image_upload_id);

CREATE TABLE promotion_includes (
  promotion_id uuid NOT NULL REFERENCES promotions (id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 7),
  quantity smallint CHECK (quantity BETWEEN 1 AND 99),
  label varchar(80) NOT NULL CHECK (char_length(btrim(label)) > 0),
  icon varchar(50) NOT NULL,
  free boolean NOT NULL DEFAULT false,
  PRIMARY KEY (promotion_id, position)
);

CREATE TABLE promotion_discounts (
  promotion_id uuid NOT NULL REFERENCES promotions (id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 7),
  label varchar(80) NOT NULL CHECK (char_length(btrim(label)) > 0),
  percent smallint NOT NULL CHECK (percent BETWEEN 1 AND 100),
  PRIMARY KEY (promotion_id, position)
);

CREATE TABLE promotion_treatments (
  promotion_id uuid NOT NULL REFERENCES promotions (id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES treatments (id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 9),
  PRIMARY KEY (promotion_id, treatment_id)
);
CREATE INDEX promotion_treatments_treatment_id_idx ON promotion_treatments (treatment_id);

-- ── Publicaciones del sitio ───────────────────────────────────────────────────
-- Cada cambio pide regenerar el HTML; el admin muestra cuándo terminó y si falló.
CREATE TABLE site_publications (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  reason varchar(50) NOT NULL,
  requested_by uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  error varchar(500)
);
CREATE INDEX site_publications_requested_at_idx ON site_publications (requested_at DESC);

-- Down Migration
DROP TABLE site_publications;
DROP TABLE promotion_treatments;
DROP TABLE promotion_discounts;
DROP TABLE promotion_includes;
DROP TABLE promotions;
DROP TABLE treatments;
DROP TABLE category_benefits;
DROP TABLE categories;
DROP TABLE legal_document_versions;
DROP TABLE legal_documents;
DROP TABLE uploads;
DROP TABLE audit_log;
DROP TABLE auth_attempts;
DROP TABLE password_reset_tokens;
DROP TABLE admin_sessions;
DROP TABLE admin_users;
