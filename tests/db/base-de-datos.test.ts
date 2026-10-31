import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { after, before, describe, test } from "node:test";
import { limits, listLimits } from "#shared/limits.ts";
import { seedContent } from "#shared/seed/index.ts";
import { hashPassword } from "../../app/src/auth/passwords.ts";
import { createSession } from "../../app/src/auth/sessions.ts";
import { ConflictError, createTreatment } from "../../app/src/content/repository.ts";
import { transaction } from "../../app/src/db.ts";
import { MIGRATIONS_DIR } from "../../app/src/migrate.ts";
import { createTempDatabase, type TempDatabase } from "./support.ts";

let db: TempDatabase;
before(async () => { db = await createTempDatabase(); });
after(async () => { await db?.drop(); });

const rejects = async (promise: Promise<unknown>, code: string) => {
  await assert.rejects(promise, (error: unknown) => (error as { code?: string }).code === code);
};

async function newUser(email = `${crypto.randomUUID()}@ejemplo.mx`) {
  const { rows: [row] } = await db.app.query<{ id: string }>(
    "INSERT INTO admin_users (email, name, password_hash) VALUES ($1, 'Ana', $2) RETURNING id", [email, await hashPassword("una contraseña larga")]);
  return row.id;
}

describe("migraciones", () => {
  test("se aplican en orden desde una base vacía y quedan registradas", async () => {
    const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
    const { rows } = await db.app.query<{ name: string }>("SELECT name FROM pgmigrations ORDER BY run_on, id");
    assert.deepEqual(rows.map((r) => `${r.name}.sql`), files);
  });

  test("la segunda ejecución no cambia nada y no duplica el contenido inicial", async () => {
    const { migrate } = await import("../../app/src/migrate.ts");
    const messages: string[] = [];
    await migrate(db.config, (m) => messages.push(m));
    assert.deepEqual(messages, ["Migraciones al día."]);
    const { rows: [{ count }] } = await db.app.query<{ count: number }>("SELECT count(*)::int AS count FROM categories");
    assert.equal(count, seedContent("2026-10-31").categories.length);
  });

  test("carga el contenido inicial: categorías, tratamientos, promociones y documentos legales", async () => {
    const seed = seedContent("2026-10-31");
    const treatments = seed.categories.reduce((n, c) => n + c.treatments.length, 0);
    const { rows: [counts] } = await db.app.query(
      `SELECT (SELECT count(*)::int FROM treatments) AS treatments,
              (SELECT count(*)::int FROM legal_documents) AS legal,
              (SELECT count(*)::int FROM promotions) AS promotions`);
    assert.equal(counts.treatments, treatments);
    assert.equal(counts.legal, 2);
    assert.equal(counts.promotions, seed.promotions.length + seed.archivedPromotions.length);
  });
});

describe("rol de la app", () => {
  test("sin superusuario ni privilegios de administración", async () => {
    const { rows: [role] } = await db.admin.query(
      "SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname = $1", [db.config.APP_DB_USER]);
    assert.deepEqual(role, { rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolreplication: false, rolbypassrls: false });
  });

  test("en la práctica no crea roles ni bases, no lee pg_authid ni ejecuta programas", async () => {
    await rejects(db.app.query("CREATE ROLE intruso"), "42501");
    await rejects(db.app.query("CREATE DATABASE intrusa"), "42501");
    await rejects(db.app.query("SELECT rolpassword FROM pg_authid"), "42501");
    await rejects(db.app.query("COPY (SELECT 1) TO PROGRAM 'id'"), "42501");
    await rejects(db.app.query("CREATE TABLE public.intrusa (id int)"), "42501");
  });
});

describe("longitudes (§6.3, las mismas que shared/limits.ts)", () => {
  const expected: [limit: string, table: string, column: string][] = [
    ["admin.email", "admin_users", "email"],
    ["admin.name", "admin_users", "name"],
    ["legal.title", "legal_documents", "title"],
    ["legal.title", "legal_document_versions", "title"],
    ["category.title", "categories", "title"],
    ["category.description", "categories", "description"],
    ["category.photoAlt", "categories", "photo_alt"],
    ["category.cta", "categories", "cta"],
    ["category.benefit", "category_benefits", "text"],
    ["treatment.slug", "treatments", "slug"],
    ["treatment.name", "treatments", "name"],
    ["treatment.description", "treatments", "description"],
    ["promotion.slug", "promotions", "slug"],
    ["promotion.name", "promotions", "name"],
    ["promotion.campaign", "promotions", "campaign"],
    ["promotion.tagline", "promotions", "tagline"],
    ["promotion.description", "promotions", "description"],
    ["promotion.reservationNote", "promotions", "reservation_note"],
    ["promotion.imageAlt", "promotions", "image_alt"],
    ["promotion.ctaLabel", "promotions", "cta_label"],
    ["promotion.ctaTreatment", "promotions", "cta_treatment"],
    ["promotion.periodLabel", "promotions", "period_label"],
    ["promotion.offerLabel", "promotions", "offer_label"],
    ["promotion.includeLabel", "promotion_includes", "label"],
    ["promotion.discountLabel", "promotion_discounts", "label"],
  ];
  // Excepciones: la contraseña se guarda como hash; los textos del formulario de contacto no se guardan
  // (viajan en el mensaje de WhatsApp); el cuerpo legal es JSON y su límite lo aplica el esquema.
  const withoutColumn = ["admin.password", "contact.name", "contact.phone", "contact.message", "legal.text", "legal.nodes", "legal.href"];

  test("cada límite tiene su columna con el mismo máximo", async () => {
    const { rows } = await db.app.query<{ table_name: string; column_name: string; max: number }>(
      `SELECT table_name, column_name, character_maximum_length AS max FROM information_schema.columns
        WHERE table_schema = 'prana' AND character_maximum_length IS NOT NULL`);
    const actual = new Map(rows.map((r) => [`${r.table_name}.${r.column_name}`, r.max]));
    const value = (key: string) => key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], limits);
    for (const [key, table, column] of expected) assert.equal(actual.get(`${table}.${column}`), value(key), `${table}.${column} ≠ ${key}`);
  });

  test("ningún límite de shared/limits queda sin columna ni sin excepción declarada", () => {
    const covered = new Set(expected.map(([key]) => key));
    for (const [group, values] of Object.entries(limits)) {
      for (const name of Object.keys(values)) {
        const key = `${group}.${name}`;
        assert.ok(withoutColumn.includes(key) || covered.has(key), `${key} sin columna ni excepción`);
      }
    }
  });

  test("ningún texto sin límite en las tablas de negocio", async () => {
    const { rows } = await db.app.query<{ column: string }>(
      `SELECT table_name || '.' || column_name AS column FROM information_schema.columns
        WHERE table_schema = 'prana' AND data_type = 'text'`);
    // Solo el hash de la contraseña (formato fijo de Argon2id) es text.
    assert.deepEqual(rows.map((r) => r.column), ["admin_users.password_hash"]);
  });

  test("la base rechaza un texto más largo que el máximo", async () => {
    await rejects(db.app.query("UPDATE categories SET title = $1 WHERE id = (SELECT min(id) FROM categories)", ["x".repeat(limits.category.title + 1)]), "22001");
  });
});

describe("secretos", () => {
  test("contraseñas solo como hash Argon2id", async () => {
    await rejects(db.app.query("INSERT INTO admin_users (email, name, password_hash) VALUES ('a@b.mx', 'A', 'secreto en claro')"), "23514");
    const id = await newUser();
    const { rows: [row] } = await db.app.query("SELECT password_hash FROM admin_users WHERE id = $1", [id]);
    assert.match(row.password_hash, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });

  test("sesiones y enlaces de restablecimiento guardan el hash (32 bytes), nunca el token", async () => {
    const id = await newUser();
    const token = await createSession(db.app, id);
    const { rows } = await db.app.query("SELECT token_hash FROM admin_sessions WHERE user_id = $1", [id]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].token_hash.length, 32);
    assert.notEqual(rows[0].token_hash.toString("base64url"), token);
    await rejects(db.app.query("INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now())", [Buffer.from(token), id]), "23514");
  });

  test("un enlace de restablecimiento no dura más de una hora", async () => {
    const id = await newUser();
    await rejects(db.app.query(
      "INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '2 hours')", [Buffer.alloc(32, 1), id]), "23514");
  });
});

describe("restricciones", () => {
  test("correo único y en minúsculas", async () => {
    await newUser("unica@ejemplo.mx");
    await rejects(newUser("unica@ejemplo.mx"), "23505");
    await rejects(newUser("Mayus@ejemplo.mx"), "23514");
  });

  test("slug único por categoría y por promoción; estados y periodos válidos", async () => {
    const { rows: [t] } = await db.app.query("SELECT category_id, slug FROM treatments LIMIT 1");
    await rejects(db.app.query(
      "INSERT INTO treatments (category_id, slug, name, icon, description, position) VALUES ($1, $2, 'X', 'cavitacion', 'Y', 29)", [t.category_id, t.slug]), "23505");
    const { rows: [p, other] } = await db.app.query("SELECT id, slug FROM promotions ORDER BY id LIMIT 2");
    await rejects(db.app.query("UPDATE promotions SET slug = $2 WHERE id = $1", [p.id, other.slug]), "23505");
    await rejects(db.app.query("UPDATE promotions SET status = 'borrador' WHERE id = $1", [p.id]), "23514");
    await rejects(db.app.query("UPDATE promotions SET starts_on = '2026-12-31', ends_on = '2026-01-01' WHERE id = $1", [p.id]), "23514");
    await rejects(db.app.query("UPDATE promotions SET image_path = '/img/../../etc/passwd' WHERE id = $1", [p.id]), "23514");
  });

  test("una promoción lleva exactamente una imagen (subida o del sitio)", async () => {
    const { rows: [p] } = await db.app.query("SELECT id FROM promotions WHERE image_path IS NOT NULL LIMIT 1");
    await rejects(db.app.query("UPDATE promotions SET image_path = NULL WHERE id = $1", [p.id]), "23514");
  });
});

describe("integridad referencial", () => {
  test("borrar una cuenta borra sus sesiones y enlaces, y conserva la auditoría sin autor", async () => {
    const id = await newUser();
    await createSession(db.app, id);
    await db.app.query("INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '1 hour')", [Buffer.alloc(32, 7), id]);
    await db.app.query("INSERT INTO audit_log (user_id, action, entity) VALUES ($1, 'login', 'admin_user')", [id]);
    await db.app.query("DELETE FROM admin_users WHERE id = $1", [id]);
    const { rows: [left] } = await db.app.query(
      `SELECT (SELECT count(*)::int FROM admin_sessions WHERE user_id = $1) AS sessions,
              (SELECT count(*)::int FROM password_reset_tokens WHERE user_id = $1) AS tokens,
              (SELECT count(*)::int FROM audit_log WHERE user_id IS NULL AND action = 'login') AS audit`, [id]);
    assert.deepEqual(left, { sessions: 0, tokens: 0, audit: 1 });
  });

  test("una imagen en uso no se puede borrar", async () => {
    const { rows: [upload] } = await db.app.query<{ id: string }>(
      "INSERT INTO uploads (purpose, width, height, widths, bytes) VALUES ('promocion', 1536, 1024, '{640,1024,1536}', 1000) RETURNING id");
    const { rows: [p] } = await db.app.query("SELECT id FROM promotions WHERE status = 'archived' LIMIT 1");
    await db.app.query("UPDATE promotions SET image_upload_id = $2, image_path = NULL WHERE id = $1", [p.id, upload.id]);
    await rejects(db.app.query("DELETE FROM uploads WHERE id = $1", [upload.id]), "23503");
  });

  test("borrar un tratamiento lo quita de las promociones que lo citan", async () => {
    const { rows: [link] } = await db.app.query("SELECT promotion_id, treatment_id FROM promotion_treatments LIMIT 1");
    if (!link) return;
    await db.app.query("DELETE FROM treatments WHERE id = $1", [link.treatment_id]);
    const { rowCount } = await db.app.query("SELECT 1 FROM promotion_treatments WHERE treatment_id = $1", [link.treatment_id]);
    assert.equal(rowCount, 0);
  });
});

describe("concurrencia", () => {
  test("dos altas simultáneas con el mismo nombre: una entra y la otra choca", async () => {
    const { rows: [c] } = await db.app.query<{ id: string }>("SELECT id FROM categories ORDER BY position LIMIT 1");
    const input = { name: `Tratamiento ${crypto.randomUUID().slice(0, 8)}`, icon: "cavitacion", description: "Descripción de prueba." } as const;
    const results = await Promise.allSettled([1, 2].map(() =>
      transaction(db.app, (client) => createTreatment(client, c.id, input, listLimits.treatmentsPerCategory))));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const failure = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    assert.ok(failure.reason instanceof ConflictError && failure.reason.code === "slug_taken");
    const { rows } = await db.app.query("SELECT position FROM treatments WHERE category_id = $1 ORDER BY position", [c.id]);
    assert.deepEqual(rows.map((r) => r.position), rows.map((_, i) => i), "posiciones seguidas, sin repetir");
  });
});

