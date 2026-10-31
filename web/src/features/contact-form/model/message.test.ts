import assert from "node:assert/strict";
import { test } from "node:test";
import { contactMessages, filterField, pasteExceeds, validateContact, whatsappUrl } from "./message.ts";

const valid = { name: "  Ana   María ", phone: "+52 777 123 4567", service: "Carboxiterapia", message: "Hola & #1" };

test("descarta lo que no admite cada campo", () => {
  assert.deepEqual(filterField("name", "Ana123 Ma_ría"), { value: "Ana María", rejected: true });
  assert.deepEqual(filterField("phone", "777abc209#5094"), { value: "7772095094", rejected: true });
  assert.deepEqual(filterField("name", "José O’Neill-Peña Jr."), { value: "José O’Neill-Peña Jr.", rejected: false });
  assert.deepEqual(filterField("message", "<b>1</b>"), { value: "<b>1</b>", rejected: false });
});

test("valida obligatorios, formato y dígitos del teléfono", () => {
  assert.deepEqual(validateContact({ name: " ", phone: "", service: "x", message: " " }).errors, {
    name: contactMessages.nameRequired,
    phone: contactMessages.phoneRequired,
    message: contactMessages.messageRequired,
  });
  assert.equal(validateContact({ ...valid, phone: "777 12" }).errors.phone, contactMessages.phoneDigits);
  assert.equal(validateContact({ ...valid, phone: "1234567890123456" }).errors.phone, contactMessages.phoneDigits);
  assert.equal(validateContact({ ...valid, name: "-Ana" }).errors.name, contactMessages.nameCharacters);
  assert.equal(validateContact({ ...valid, message: "a".repeat(2001) }).errors.message, "Máximo 2000 caracteres.");
});

test("normaliza espacios y prepara el mensaje sin perder símbolos", () => {
  const { data } = validateContact(valid);
  assert.equal(data?.name, "Ana María");
  const url = new URL(whatsappUrl(data!));
  assert.equal(url.origin + url.pathname, "https://wa.me/527772095094");
  const text = url.searchParams.get("text")!;
  assert.match(text, /\*Nombre:\* Ana María/);
  assert.match(text, /\*Mensaje:\* Hola & #1/);
});

test("el pegado cuenta la selección que reemplaza", () => {
  assert.equal(pasteExceeds("a".repeat(50), 10, "María", 50), false);
  assert.equal(pasteExceeds("", 0, "a".repeat(51), 50), true);
});
