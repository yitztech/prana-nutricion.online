import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { boundaryViolations, localDependencies } from "./boundaries.ts";

const root = join(import.meta.dirname, "..");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

test("el código respeta las capas y las entradas públicas de las funcionalidades", () => {
  const errors = sourceFiles(root).flatMap((file) =>
    boundaryViolations(relative(root, file).replaceAll("\\", "/"), readFileSync(file, "utf8")),
  );
  assert.deepEqual(errors, []);
});

test("bloquea dependencias inversas incluso con rutas relativas y reexportaciones", () => {
  assert.equal(boundaryViolations("components/ui/example.tsx", 'export { Logo } from "../brand/ui/logo";').length, 1);
  assert.equal(boundaryViolations("lib/example.ts", 'import type { Category } from "../features/treatments";').length, 1);
  assert.equal(boundaryViolations("components/brand/ui/example.tsx", 'import "../../patterns/CategoryCard";').length, 1);
  assert.equal(boundaryViolations("unknown/example.ts", 'import "@/data/site";').length, 1);
});

test("solo la propia funcionalidad accede a sus detalles internos", () => {
  assert.equal(boundaryViolations("components/patterns/example.tsx", 'import "@/features/treatments/model/selection";').length, 1);
  assert.equal(boundaryViolations("features/other/index.ts", 'export * from "../treatments/data/catalog";').length, 1);
  assert.deepEqual(boundaryViolations("features/other/index.ts", 'export * from "../treatments";'), []);
  assert.deepEqual(boundaryViolations("features/treatments/index.ts", 'export * from "./data/catalog";'), []);
});

test("las vistas de tratamientos no importan su catálogo ni su estado", () => {
  assert.equal(boundaryViolations("features/treatments/components/View.tsx", 'import "../data/catalog";').length, 1);
  assert.equal(boundaryViolations("features/treatments/components/View.tsx", 'import "../model/use-treatment-selection";').length, 1);
});

test("analiza imports dinámicos y de tipos sin confundir comentarios con dependencias", () => {
  assert.deepEqual(localDependencies("components/ui/example.tsx", `
    // import "@/components/sections/Hero";
    const description = 'import "@/data/site"';
    const feature = import("@/features/treatments");
    type Data = import("../../types").Category;
  `), ["features/treatments", "types"]);
  assert.equal(boundaryViolations("components/ui/example.tsx", 'import("@/features/treatments");').length, 1);
});
