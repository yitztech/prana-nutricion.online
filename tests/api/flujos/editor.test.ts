import assert from "node:assert/strict";
import { after, describe, test } from "node:test";
import { ADMIN, cerrar, conSesion, correoPara, documento, limpiarIntentos, nuevaCuenta, Cliente } from "../support/cliente.ts";
import { categoria, esperarAusencia, esperarPagina, formulario, foto, promocion } from "../support/contenido.ts";

after(cerrar);

describe("sesión", () => {
  test("iniciar sesión, consultar la sesión y cerrarla", async () => {
    const cuenta = await nuevaCuenta();
    const { cliente } = await conSesion(cuenta);
    const sesion = await cliente.get("/api/auth/session");
    assert.equal(sesion.status, 200);
    assert.equal(sesion.body.user.email, cuenta.email);
    const token = cliente.sesion;
    assert.equal((await cliente.post("/api/auth/logout")).status, 204);
    // La sesión cerrada ya no sirve aunque alguien conserve la cookie.
    const viejo = new Cliente();
    viejo.sesion = token;
    assert.equal((await viejo.get("/api/auth/session")).status, 401);
  });

  test("restablecer la contraseña por correo cierra las sesiones abiertas y avisa", async () => {
    const cuenta = await nuevaCuenta();
    const { cliente: abierta } = await conSesion(cuenta);
    const anonimo = new Cliente();
    assert.equal((await anonimo.post("/api/auth/password-reset", { email: cuenta.email })).status, 202);
    const correo = await correoPara(cuenta.email, /Restablece/);
    const token = /#token=([A-Za-z0-9_-]{43})/.exec(correo.Text)?.[1];
    assert.ok(token, "el enlace lleva el token en el fragmento");
    // El enlace lleva al dominio del editor, nunca al sitio público.
    assert.ok(correo.Text.includes(`${ADMIN}/restablecer#token=${token}`), correo.Text);
    const nueva = "una contraseña nueva y larga";
    assert.equal((await anonimo.post("/api/auth/password-reset/confirm", { token, password: nueva })).status, 204);
    assert.equal((await abierta.get("/api/auth/session")).status, 401, "la sesión anterior se cerró");
    // El enlace no sirve dos veces.
    const repetido = await anonimo.post("/api/auth/password-reset/confirm", { token, password: nueva });
    assert.equal(repetido.status, 422);
    assert.equal(repetido.body.errors[0].field, "token");
    await conSesion({ ...cuenta, password: nueva });
    const aviso = await correoPara(cuenta.email, /cambió/);
    assert.ok(aviso.Text.includes(`${ADMIN}/`), "el aviso apunta al editor");
    assert.doesNotMatch(aviso.Text, /\/admin\//);
    await limpiarIntentos(cuenta.email);
  });

  test("cambiar la contraseña mantiene esta sesión y cierra las demás", async () => {
    const cuenta = await nuevaCuenta();
    const { cliente: esta } = await conSesion(cuenta);
    const { cliente: otra } = await conSesion(cuenta);
    const r = await esta.post("/api/auth/password", { currentPassword: cuenta.password, newPassword: "otra contraseña bien larga" });
    assert.equal(r.status, 204);
    assert.equal((await esta.get("/api/auth/session")).status, 200);
    assert.equal((await otra.get("/api/auth/session")).status, 401);
  });
});

describe("contenido publicado", () => {
  test("editar el aviso de privacidad lo publica en /privacidad y guarda la versión", async () => {
    const { cliente } = await conSesion();
    const actual = (await cliente.get("/api/admin/legal/privacidad")).body;
    const marca = `Texto de prueba ${crypto.randomUUID()}`;
    const r = await cliente.put("/api/admin/legal/privacidad", { title: actual.title, body: documento(marca) });
    assert.equal(r.status, 200);
    assert.ok(r.body.versions.length >= 1);
    await esperarPagina("/privacidad", marca);
    // Se restaura el texto para no dejar el sitio con contenido de prueba.
    await cliente.put("/api/admin/legal/privacidad", { title: actual.title, body: actual.body });
  });

  test("alta, edición, orden y baja de un tratamiento se reflejan en su categoría", async () => {
    const { cliente } = await conSesion();
    const cat = await categoria(cliente);
    const nombre = `Prueba ${crypto.randomUUID().slice(0, 8)}`;
    const alta = await cliente.post(`/api/admin/categories/${cat.id}/treatments`, { name: nombre, icon: "cavitacion", description: "Descripción de prueba." });
    assert.equal(alta.status, 201);
    assert.match(alta.headers.get("location") ?? "", /^\/api\/admin\/treatments\/[0-9a-f-]{36}$/);
    const pagina = `/tratamientos/${cat.id}/`;
    await esperarPagina(pagina, nombre);

    const editado = `${nombre} editado`;
    assert.equal((await cliente.put(`/api/admin/treatments/${alta.body.id}`, { name: editado, icon: "cavitacion", description: "Otra descripción." })).status, 200);
    await esperarPagina(pagina, editado);

    const ids = (await categoria(cliente)).treatments.map((t) => t.id);
    const orden = [alta.body.id, ...ids.filter((id) => id !== alta.body.id)];
    const reordenado = await cliente.put(`/api/admin/categories/${cat.id}/treatments/order`, { ids: orden });
    assert.equal(reordenado.status, 200);
    assert.equal(reordenado.body.treatments[0].id, alta.body.id);
    // Se deja el orden original antes de borrar.
    await cliente.put(`/api/admin/categories/${cat.id}/treatments/order`, { ids: [...ids.filter((id) => id !== alta.body.id), alta.body.id] });

    assert.equal((await cliente.delete(`/api/admin/treatments/${alta.body.id}`)).status, 204);
    await esperarAusencia(pagina, editado);
  });

  test("una promoción con imagen subida aparece en la portada y desaparece al borrarla", async () => {
    const { cliente } = await conSesion();
    const subida = await cliente.pedir("POST", "/api/admin/uploads", { form: formulario(await foto()) });
    assert.equal(subida.status, 201, subida.text);
    assert.match(subida.body.srcSet, /-640\.webp 640w, .*-1024\.webp 1024w, .*-1536\.webp 1536w$/);
    const imagen = await fetch(new URL(subida.body.src, process.env.E2E_BASE_URL ?? "http://127.0.0.1:8091"));
    assert.equal(imagen.status, 200);
    assert.equal(imagen.headers.get("content-type"), "image/webp");
    assert.equal(imagen.headers.get("x-content-type-options"), "nosniff");

    const datos = promocion({ image: { uploadId: subida.body.id } });
    const alta = await cliente.post("/api/admin/promotions", datos);
    assert.equal(alta.status, 201, alta.text);
    const portada = await esperarPagina("/", datos.name);
    assert.ok(portada.includes(subida.body.src), "la portada usa la imagen subida");

    assert.equal((await cliente.delete(`/api/admin/promotions/${alta.body.id}`)).status, 204);
    await esperarAusencia("/", datos.name);
  });

  test("la lista de promociones se pagina con cursor", async () => {
    const { cliente } = await conSesion();
    const primera = await cliente.get("/api/admin/promotions?limit=1");
    assert.equal(primera.status, 200);
    assert.equal(primera.body.items.length, 1);
    if (primera.body.nextCursor) {
      const segunda = await cliente.get(`/api/admin/promotions?limit=1&cursor=${primera.body.nextCursor}`);
      assert.equal(segunda.status, 200);
      assert.notEqual(segunda.body.items[0].id, primera.body.items[0].id);
    }
  });

  test("publicar a mano deja constancia del estado", async () => {
    const { cliente } = await conSesion();
    const r = await cliente.post("/api/admin/site/publish");
    assert.equal(r.status, 202);
    assert.ok(["pending", "published"].includes(r.body.publication.status));
  });
});
