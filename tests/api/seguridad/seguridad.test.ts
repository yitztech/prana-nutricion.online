import assert from "node:assert/strict";
import { after, describe, test } from "node:test";
import { BASE, cerrar, Cliente, COOKIE, conSesion, db, documento, limpiarIntentos, nuevaCuenta } from "../support/cliente.ts";
import { promocion } from "../support/contenido.ts";

after(cerrar);

const id = "00000000-0000-7000-8000-000000000000";
const privadas: [method: string, path: string, body?: unknown][] = [
  ["GET", "/api/auth/session"],
  ["POST", "/api/auth/password", { currentPassword: "x", newPassword: "y".repeat(12) }],
  ["GET", "/api/admin/legal"],
  ["GET", "/api/admin/legal/privacidad"],
  ["PUT", "/api/admin/legal/privacidad", { title: "x", body: documento("x") }],
  ["GET", "/api/admin/categories"],
  ["PUT", "/api/admin/categories/reductivos", {}],
  ["POST", "/api/admin/categories/reductivos/treatments", {}],
  ["PUT", "/api/admin/categories/reductivos/treatments/order", { ids: [id] }],
  ["PUT", `/api/admin/treatments/${id}`, {}],
  ["DELETE", `/api/admin/treatments/${id}`],
  ["GET", "/api/admin/promotions"],
  ["POST", "/api/admin/promotions", {}],
  ["GET", `/api/admin/promotions/${id}`],
  ["PUT", `/api/admin/promotions/${id}`, {}],
  ["DELETE", `/api/admin/promotions/${id}`],
  ["GET", "/api/admin/uploads/format"],
  ["POST", "/api/admin/uploads"],
  ["GET", "/api/admin/site"],
  ["POST", "/api/admin/site/publish"],
];

describe("sin sesión (§25)", () => {
  for (const [method, path, body] of privadas) {
    test(`${method} ${path} responde 401`, async () => {
      const r = await new Cliente().pedir(method, path, { body });
      assert.equal(r.status, 401, r.text);
      assert.equal(r.body.code, "unauthenticated");
    });
  }

  test("una cookie inventada no abre sesión", async () => {
    const intruso = new Cliente();
    intruso.sesion = "A".repeat(43);
    assert.equal((await intruso.get("/api/admin/legal")).status, 401);
    intruso.sesion = "' OR 1=1 --";
    assert.equal((await intruso.get("/api/admin/legal")).status, 401);
  });
});

describe("CSRF (§24)", () => {
  test("una escritura sin origen, de otro origen o sin la cabecera del editor: 403", async () => {
    const { cliente } = await conSesion();
    const body = { title: "Aviso", body: documento("x") };
    for (const opciones of [{ origin: null }, { origin: "https://evil.example" }, { origin: "null" }, { editor: false }]) {
      const r = await cliente.pedir("PUT", "/api/admin/legal/privacidad", { body, ...opciones });
      assert.equal(r.status, 403, JSON.stringify(opciones));
      assert.equal(r.body.code, "forbidden_origin");
    }
  });

  test("también el inicio de sesión exige el origen (login CSRF)", async () => {
    const cuenta = await nuevaCuenta();
    const r = await new Cliente().post("/api/auth/login", { email: cuenta.email, password: cuenta.password }, { origin: "https://evil.example" });
    assert.equal(r.status, 403);
  });
});

describe("cuentas", () => {
  test("una cuenta solo existe para el editor: no hay registro ni alta por la API", async () => {
    const r = await new Cliente().post("/api/auth/register", { email: "a@b.mx", password: "x".repeat(12) });
    assert.equal(r.status, 404);
  });

  test("no se escala por el cuerpo de la petición", async () => {
    const { cliente, cuenta } = await conSesion();
    const r = await cliente.post("/api/auth/password", { currentPassword: cuenta.password, newPassword: "x".repeat(12), userId: crypto.randomUUID() });
    assert.equal(r.status, 422);
    const p = await cliente.post("/api/admin/promotions", promocion({ id: crypto.randomUUID(), createdBy: crypto.randomUUID() }));
    assert.equal(p.status, 422);
  });

  test("una sesión no puede cambiar la contraseña de otra cuenta (IDOR)", async () => {
    const victima = await nuevaCuenta();
    const { cliente } = await conSesion();
    // La API no recibe a quién cambiar: siempre es la cuenta de la sesión. La víctima sigue entrando.
    await cliente.post("/api/auth/password", { currentPassword: victima.password, newPassword: "x".repeat(16) });
    await conSesion(victima);
  });
});

describe("inicio de sesión (§24)", () => {
  test("la misma respuesta exista o no la cuenta", async () => {
    const cuenta = await nuevaCuenta();
    const inexistente = `nadie-${crypto.randomUUID()}@ejemplo.mx`;
    const a = await new Cliente().post("/api/auth/login", { email: cuenta.email, password: "incorrecta" });
    const b = await new Cliente().post("/api/auth/login", { email: inexistente, password: "incorrecta" });
    assert.equal(a.status, 401);
    assert.equal(b.status, a.status);
    assert.equal(b.body.code, a.body.code);
    assert.equal(b.body.detail, a.body.detail);
    await limpiarIntentos(cuenta.email, inexistente);
  });

  test("la recuperación responde igual exista o no la cuenta", async () => {
    const cuenta = await nuevaCuenta();
    const inexistente = `nadie-${crypto.randomUUID()}@ejemplo.mx`;
    const a = await new Cliente().post("/api/auth/password-reset", { email: cuenta.email });
    const b = await new Cliente().post("/api/auth/password-reset", { email: inexistente });
    assert.equal(a.status, 202);
    assert.deepEqual(b.body, a.body);
    await limpiarIntentos(cuenta.email, inexistente);
  });

  test("tras 5 fallos la cuenta se bloquea con 429 y Retry-After, aunque la contraseña sea buena", async () => {
    const cuenta = await nuevaCuenta();
    try {
      for (let i = 0; i < 5; i++) assert.equal((await new Cliente().post("/api/auth/login", { email: cuenta.email, password: `mala-${i}` })).status, 401);
      const r = await new Cliente().post("/api/auth/login", { email: cuenta.email, password: cuenta.password });
      assert.equal(r.status, 429);
      assert.ok(Number(r.headers.get("retry-after")) > 0);
    } finally {
      await limpiarIntentos(cuenta.email);
    }
  });

  test("la cookie de sesión es HttpOnly, SameSite=Lax, Path=/ y no adivinable; cambia en cada inicio", async () => {
    const cuenta = await nuevaCuenta();
    const { cliente: primero } = await conSesion(cuenta);
    const cookie = primero.setCookies.find((c) => c.startsWith(`${COOKIE}=`))!;
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\//);
    assert.doesNotMatch(cookie, /Domain=/i);
    // Por https (producción) la cookie es __Host- y Secure; el entorno local va por http.
    if (BASE.startsWith("https:")) assert.match(cookie, /Secure/);
    assert.match(primero.sesion!, /^[A-Za-z0-9_-]{43}$/);
    const { cliente: segundo } = await conSesion(cuenta);
    assert.notEqual(segundo.sesion, primero.sesion);
  });

  test("la sesión caduca por inactividad", async () => {
    const { cliente, cuenta } = await conSesion();
    await db().query("UPDATE admin_sessions SET last_seen_at = now() - interval '3 hours' WHERE user_id = $1", [cuenta.id]);
    assert.equal((await cliente.get("/api/auth/session")).status, 401);
  });
});

describe("respuestas", () => {
  test("ninguna respuesta incluye hashes ni tokens", async () => {
    const { cliente } = await conSesion();
    for (const path of ["/api/auth/session", "/api/admin/legal/privacidad", "/api/admin/categories", "/api/admin/promotions"]) {
      const r = await cliente.get(path);
      assert.doesNotMatch(r.text, /\$argon2|password|token_hash|passwordHash/i, path);
    }
  });

  test("SQL y HTML se guardan y se muestran como texto", async () => {
    const { cliente } = await conSesion();
    const actual = (await cliente.get("/api/admin/legal/condiciones")).body;
    const malicioso = `<img src=x onerror=alert(1)> '); DROP TABLE promotions; -- ${crypto.randomUUID()}`;
    const r = await cliente.put("/api/admin/legal/condiciones", { title: actual.title, body: documento(malicioso) });
    assert.equal(r.status, 200);
    const limite = Date.now() + 20_000;
    let html = "";
    while (Date.now() < limite && !html.includes("DROP TABLE")) {
      html = await (await fetch(new URL("/condiciones", BASE))).text();
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), "el HTML llega escapado");
    assert.ok(!html.includes("<img src=x onerror"));
    assert.equal((await cliente.get("/api/admin/promotions")).status, 200, "la tabla sigue ahí");
    await cliente.put("/api/admin/legal/condiciones", { title: actual.title, body: actual.body });
  });

  test("cabeceras de seguridad en el sitio, la API y el editor", async () => {
    for (const path of ["/", "/api/health", "/admin/"]) {
      const r = await fetch(new URL(path, BASE));
      for (const h of ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy"]) {
        assert.ok(r.headers.get(h), `${path}: falta ${h}`);
      }
      // Una sola vez: el gateway las pone y oculta las del servicio de detrás
      assert.equal(r.headers.get("x-content-type-options"), "nosniff", `${path}: nosniff repetida`);
      assert.equal(r.headers.get("x-frame-options"), "DENY", `${path}: X-Frame-Options repetida`);
    }
    const api = await fetch(new URL("/api/health", BASE));
    assert.equal(api.headers.get("cache-control"), "no-store");
    assert.ok(api.headers.get("x-request-id"));
    const admin = await fetch(new URL("/admin/", BASE));
    assert.doesNotMatch(admin.headers.get("content-security-policy") ?? "", /stats\./, "el editor no carga analítica");
  });

  test("el gateway no deja elegir el X-Request-ID", async () => {
    const r = await fetch(new URL("/api/health", BASE), { headers: { "x-request-id": "elegido-por-el-cliente" } });
    assert.notEqual(r.headers.get("x-request-id"), "elegido-por-el-cliente");
  });
});

describe("cuerpos y archivos (§23, §29)", () => {
  test("un JSON de más de 1 MB: 413", async () => {
    const { cliente } = await conSesion();
    const r = await cliente.put("/api/admin/legal/privacidad", { title: "x", body: documento("x".repeat(1_100_000)) });
    assert.equal(r.status, 413);
  });

  test("una imagen de más de 8 MB: 413", async () => {
    const { cliente } = await conSesion();
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(8 * 1024 * 1024 + 10)], { type: "image/jpeg" }), "grande.jpg");
    const r = await cliente.pedir("POST", "/api/admin/uploads", { form });
    assert.equal(r.status, 413);
  });
});
