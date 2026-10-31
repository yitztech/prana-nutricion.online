import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { limits } from "#shared/limits.ts";
import { ADMIN, BASE, cerrar, Cliente, conSesion, documento, type Respuesta } from "../support/cliente.ts";
import { categoria, formulario, foto, promocion } from "../support/contenido.ts";

let cliente: Cliente;
before(async () => { ({ cliente } = await conSesion()); });
after(cerrar);

/** Problem Details (§22): tipo de contenido, código estable, requestId y nada interno. */
function problema(r: Respuesta, status: number, code: string) {
  assert.equal(r.status, status, r.text);
  assert.match(r.headers.get("content-type") ?? "", /^application\/problem\+json/);
  assert.equal(r.body.status, status);
  assert.equal(r.body.code, code);
  assert.ok(r.body.title);
  assert.equal(r.body.requestId, r.headers.get("x-request-id"));
  assert.doesNotMatch(r.text, /at \w+ \(|node_modules|SELECT |pg_|\.ts:\d+/);
}

function campo(r: Respuesta, field: string, code: string) {
  problema(r, 422, "validation_failed");
  const error = r.body.errors.find((e: { field: string }) => e.field === field);
  assert.ok(error, `sin error para ${field}: ${r.text}`);
  assert.equal(error.code, code);
  assert.ok(error.message);
}

describe("salud y versión (§20)", () => {
  for (const [dominio, base] of [["sitio", BASE], ["editor", ADMIN]]) {
    test(`/api/health responde ok sin datos internos (${dominio})`, async () => {
      const r = await new Cliente(base).get("/api/health");
      assert.equal(r.status, 200);
      assert.deepEqual(r.body, { status: "ok" });
    });

    test(`/version.json da la revisión (${dominio})`, async () => {
      const r = await new Cliente(base).get("/version.json");
      assert.equal(r.status, 200);
      assert.equal(typeof r.body.revision, "string");
    });
  }

  test("una ruta de la API que no existe es un 404 con Problem Details", async () => {
    problema(await cliente.get("/api/no-existe"), 404, "not_found");
  });
});

describe("autenticación", () => {
  test("login: campos obligatorios, formato y desconocidos", async () => {
    const anonimo = new Cliente();
    campo(await anonimo.post("/api/auth/login", {}), "email", "required");
    campo(await anonimo.post("/api/auth/login", { email: "no-es-correo", password: "x" }), "email", "invalid_format");
    campo(await anonimo.post("/api/auth/login", { email: `${"a".repeat(250)}@b.mx`, password: "x" }), "email", "too_long");
    problema(await anonimo.post("/api/auth/login", { email: "a@b.mx", password: "x", admin: true }), 422, "validation_failed");
  });

  test("JSON mal formado es un 400", async () => {
    problema(await new Cliente().post("/api/auth/login", "{no es json"), 400, "bad_request");
  });

  test("restablecer: contraseña demasiado corta y token con formato inválido", async () => {
    const anonimo = new Cliente();
    campo(await anonimo.post("/api/auth/password-reset/confirm", { token: "a".repeat(43), password: "corta" }), "password", "out_of_range");
    campo(await anonimo.post("/api/auth/password-reset/confirm", { token: "x", password: "una contraseña larga" }), "token", "invalid_format");
  });
});

describe("documentos legales", () => {
  test("lista y lectura", async () => {
    const lista = await cliente.get("/api/admin/legal");
    assert.deepEqual(lista.body.items.map((i: { slug: string }) => i.slug), ["privacidad", "condiciones"]);
    const doc = await cliente.get("/api/admin/legal/condiciones");
    assert.equal(doc.status, 200);
    assert.equal(doc.body.body.type, "doc");
  });

  test("uno que no existe es un 404, nunca un 500", async () => {
    problema(await cliente.get("/api/admin/legal/otro"), 404, "not_found");
    problema(await cliente.put("/api/admin/legal/otro", { title: "x", body: documento("x") }), 404, "not_found");
  });

  test("título obligatorio y con límite; enlaces solo seguros; nodos desconocidos rechazados", async () => {
    campo(await cliente.put("/api/admin/legal/privacidad", { title: "  ", body: documento("x") }), "title", "required");
    campo(await cliente.put("/api/admin/legal/privacidad", { title: "x".repeat(limits.legal.title + 1), body: documento("x") }), "title", "too_long");
    const enlace = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "clic", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }],
    };
    const r = await cliente.put("/api/admin/legal/privacidad", { title: "Aviso", body: enlace });
    problema(r, 422, "validation_failed");
    assert.ok(r.body.errors.some((e: { field: string }) => e.field.startsWith("body")));
    const script = { type: "doc", content: [{ type: "script", content: [{ type: "text", text: "x" }] }] };
    problema(await cliente.put("/api/admin/legal/privacidad", { title: "Aviso", body: script }), 422, "validation_failed");
  });
});

describe("catálogo", () => {
  test("categoría inexistente o con formato inválido: 404", async () => {
    const cat = await categoria(cliente);
    const datos = { title: cat.title, description: cat.description, photoAlt: cat.photoAlt, cta: cat.cta, icon: cat.icon, benefits: cat.benefits };
    problema(await cliente.put("/api/admin/categories/no-existe", datos), 404, "not_found");
    problema(await cliente.put("/api/admin/categories/..%2F..%2Fetc", datos), 404, "not_found");
  });

  test("categoría: icono fuera de la lista y demasiados beneficios", async () => {
    const cat = await categoria(cliente);
    const datos = { title: cat.title, description: cat.description, photoAlt: cat.photoAlt, cta: cat.cta, icon: cat.icon, benefits: cat.benefits };
    campo(await cliente.put(`/api/admin/categories/${cat.id}`, { ...datos, icon: "../logo" }), "icon", "invalid_format");
    const r = await cliente.put(`/api/admin/categories/${cat.id}`, { ...datos, benefits: Array(7).fill("Beneficio") });
    problema(r, 422, "validation_failed");
  });

  test("tratamiento: id con formato inválido es 404; nombre obligatorio", async () => {
    const t = { name: "X", icon: "cavitacion", description: "Y" };
    problema(await cliente.put("/api/admin/treatments/123", t), 404, "not_found");
    problema(await cliente.put(`/api/admin/treatments/${crypto.randomUUID()}`, t), 404, "not_found");
    problema(await cliente.delete(`/api/admin/treatments/${crypto.randomUUID()}`), 404, "not_found");
    const cat = await categoria(cliente);
    campo(await cliente.post(`/api/admin/categories/${cat.id}/treatments`, { ...t, name: "" }), "name", "required");
  });

  test("tratamiento con un nombre repetido en la categoría: 422 en el nombre", async () => {
    const cat = await categoria(cliente);
    const existente = cat.treatments[0];
    campo(await cliente.post(`/api/admin/categories/${cat.id}/treatments`, { name: existente.name, icon: "cavitacion", description: "Y" }), "name", "slug_taken");
  });

  test("orden con ids ajenos a la categoría: conflicto", async () => {
    const cat = await categoria(cliente);
    const r = await cliente.put(`/api/admin/categories/${cat.id}/treatments/order`, { ids: [crypto.randomUUID()] });
    assert.ok([409, 422].includes(r.status), r.text);
  });
});

describe("promociones", () => {
  test("fin obligatorio en una activa, fin anterior al inicio y apartado mayor que el precio", async () => {
    campo(await cliente.post("/api/admin/promotions", promocion({ endsOn: null })), "endsOn", "required");
    campo(await cliente.post("/api/admin/promotions", promocion({ startsOn: "2099-12-31", endsOn: "2099-01-01" })), "endsOn", "out_of_range");
    campo(await cliente.post("/api/admin/promotions", promocion({ depositCents: 200_000 })), "depositCents", "out_of_range");
    campo(await cliente.post("/api/admin/promotions", promocion({ endsOn: "2099-02-30" })), "endsOn", "invalid_format");
  });

  test("dinero en centavos enteros", async () => {
    problema(await cliente.post("/api/admin/promotions", promocion({ priceCents: 1499.5 })), 422, "validation_failed");
  });

  test("una imagen que no es del sitio ni subida se rechaza", async () => {
    problema(await cliente.post("/api/admin/promotions", promocion({ image: { path: "https://otro.example/x.webp" } })), 422, "validation_failed");
    problema(await cliente.post("/api/admin/promotions", promocion({ image: { uploadId: crypto.randomUUID() } })), 422, "validation_failed");
  });

  test("id inexistente o inválido: 404; cursor y límite inválidos: 400", async () => {
    problema(await cliente.get(`/api/admin/promotions/${crypto.randomUUID()}`), 404, "not_found");
    problema(await cliente.get("/api/admin/promotions/abc"), 404, "not_found");
    problema(await cliente.get("/api/admin/promotions?cursor=basura"), 400, "invalid_cursor");
    problema(await cliente.get("/api/admin/promotions?limit=1000"), 400, "invalid_limit");
  });
});

describe("imágenes (§29)", () => {
  test("el formato admitido se describe", async () => {
    const r = await cliente.get("/api/admin/uploads/format");
    assert.match(r.body.help, /3:2/);
  });

  test("demasiado pequeña: 422 con las medidas", async () => {
    const r = await cliente.pedir("POST", "/api/admin/uploads", { form: formulario(await foto(1200, 800)) });
    campo(r, "file", "too_small");
    assert.match(r.body.errors[0].message, /1200 × 800/);
  });

  test("el tipo se comprueba por el contenido, no por el nombre ni el Content-Type", async () => {
    const texto = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");
    campo(await cliente.pedir("POST", "/api/admin/uploads", { form: formulario(texto, "foto.jpg", "image/jpeg") }), "file", "invalid_type");
  });

  test("sin archivo o con otro campo: 422; como JSON: 415", async () => {
    campo(await cliente.pedir("POST", "/api/admin/uploads", { form: formulario(await foto(), "promo.jpg", "image/jpeg", "otro") }), "file", "required");
    problema(await cliente.post("/api/admin/uploads", { file: "x" }), 415, "unsupported_media_type");
  });

  test("una PNG válida también se acepta y se convierte a WebP", async () => {
    const r = await cliente.pedir("POST", "/api/admin/uploads", { form: formulario(await foto(1536, 1024, "png"), "promo.png", "image/png") });
    assert.equal(r.status, 201, r.text);
    assert.match(r.body.src, /\.webp$/);
  });
});

describe("sitio publicado", () => {
  test("rutas públicas: portada, categorías, legales, robots y sitemap", async () => {
    const anonimo = new Cliente(BASE);
    for (const path of ["/", "/privacidad", "/condiciones", "/robots.txt", "/sitemap.xml"]) {
      assert.equal((await anonimo.get(path)).status, 200, path);
    }
    const cat = await categoria(cliente);
    assert.equal((await anonimo.get(`/tratamientos/${cat.id}/`)).status, 200);
  });

  test("una página que no existe es el 404 del sitio", async () => {
    const r = await new Cliente(BASE).get("/no-existe");
    assert.equal(r.status, 404);
    assert.match(r.text, /<html lang="es"/);
  });

  test("no se publican datos internos de la generación", async () => {
    assert.equal((await new Cliente(BASE).get("/release.json")).status, 404);
    assert.equal((await new Cliente(BASE).get("/uploads/../../etc/passwd")).status, 404);
  });

});

describe("dos dominios: sitio y editor", () => {
  test("el sitio público ya no sirve el editor: /admin es su página 404", async () => {
    for (const path of ["/admin", "/admin/", "/admin/restablecer", "/admin/index.html"]) {
      const r = await new Cliente(BASE).get(path);
      assert.equal(r.status, 404, path);
      assert.match(r.text, /<html lang="es"/, path);
      assert.doesNotMatch(r.text, /Editor del sitio/, path);
    }
  });

  test("el sitio público no expone la API del editor", async () => {
    const sitio = new Cliente(BASE);
    for (const [method, path] of [["GET", "/api/auth/session"], ["GET", "/api/admin/legal"], ["POST", "/api/auth/login"], ["POST", "/api/admin/uploads"]]) {
      const r = await sitio.pedir(method, path, { body: method === "POST" ? {} : undefined });
      assert.equal(r.status, 404, `${method} ${path}`);
      assert.match(r.headers.get("content-type") ?? "", /^application\/problem\+json/);
      assert.equal(r.body.code, "not_found");
      assert.equal(r.headers.get("cache-control"), "no-store");
    }
  });

  test("el editor se sirve en la raíz de su dominio, sin caché y fuera de los buscadores", async () => {
    for (const path of ["/", "/restablecer"]) {
      const r = await new Cliente(ADMIN).get(path);
      assert.equal(r.status, 200, path);
      assert.match(r.text, /Editor del sitio/, path);
      assert.equal(r.headers.get("cache-control"), "no-store", path);
      assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow", path);
    }
    const robots = await new Cliente(ADMIN).get("/robots.txt");
    assert.equal(robots.status, 200);
    assert.match(robots.text, /Disallow: \/\n/);
  });

  test("el editor carga sus recursos desde su propio dominio", async () => {
    const editor = new Cliente(ADMIN);
    const html = (await editor.get("/")).text;
    const recursos = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
    assert.ok(recursos.some((r) => r.startsWith("/assets/")), "sin JS ni CSS del build");
    for (const recurso of recursos) {
      const r = await editor.get(recurso);
      assert.equal(r.status, 200, recurso);
      assert.doesNotMatch(r.headers.get("content-type") ?? "", /text\/html/, `${recurso} no debe ser el panel`);
    }
  });
});
