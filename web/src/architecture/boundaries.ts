import { posix } from "node:path";
import { parseSync, Visitor, type ESTree } from "vite";

/** Dependencias locales permitidas; los paquetes externos los comprueban TypeScript y el lockfile. */
const allowed: Record<string, readonly string[]> = {
  main: ["Root", "types", "styles"],
  "entry-server": ["Root", "site", "types"],
  Root: ["App", "providers", "types"],
  App: ["features", "layout", "sections", "ui", "providers", "hooks", "site"],
  site: ["site", "features", "data", "lib", "types"],
  admin: ["admin", "patterns", "brand", "brand-ui", "ui", "hooks", "lib", "types", "styles"],
  architecture: ["architecture"],
  ui: ["ui", "lib", "styles"],
  "brand-ui": ["brand-ui", "ui", "lib", "styles", "types"],
  brand: ["brand", "brand-ui", "ui", "hooks", "lib", "types"],
  patterns: ["patterns", "brand", "brand-ui", "ui", "features", "data", "hooks", "lib", "types"],
  sections: ["patterns", "brand", "brand-ui", "ui", "features", "data", "hooks", "lib", "types"],
  layout: ["patterns", "brand", "brand-ui", "ui", "features", "data", "hooks", "lib", "types"],
  features: ["features", "brand", "brand-ui", "ui", "hooks", "lib", "types"],
  providers: ["hooks", "lib", "types"],
  hooks: ["hooks", "lib", "types"],
  data: ["data", "lib", "types"],
  lib: ["lib", "styles", "types"],
  styles: ["styles"],
  types: ["types"],
};

function layer(path: string) {
  if (path.startsWith("components/brand/ui/")) return "brand-ui";
  if (path.startsWith("components/")) return path.split("/")[1];
  return path.split("/")[0].replace(/\.tsx?$/, "");
}

export function localDependencies(file: string, source: string) {
  const dependencies: string[] = [];
  const parsed = parseSync(file, source);
  if (parsed.errors.length) throw new Error(`${file}: ${parsed.errors.map((error) => error.message).join("; ")}`);
  const add = (node: ESTree.Node | null | undefined) => {
    if (node?.type !== "Literal" || typeof node.value !== "string") return;
    const specifier = node.value;
    if (specifier.startsWith("@/")) dependencies.push(posix.normalize(specifier.slice(2)));
    else if (specifier.startsWith(".")) dependencies.push(posix.normalize(posix.join(posix.dirname(file), specifier)));
  };
  new Visitor({
    ImportDeclaration: (node) => add(node.source),
    ExportNamedDeclaration: (node) => add(node.source),
    ExportAllDeclaration: (node) => add(node.source),
    ImportExpression: (node) => add(node.source),
    TSImportType: (node) => add(node.source),
    TSExternalModuleReference: (node) => add(node.expression),
    CallExpression: (node) => {
      if (node.callee.type === "Identifier" && node.callee.name === "require") add(node.arguments[0]);
    },
  }).visit(parsed.program);
  return dependencies;
}

export function boundaryViolations(file: string, source: string) {
  const from = layer(file);
  const feature = file.startsWith("features/") ? file.split("/")[1] : null;
  return localDependencies(file, source).flatMap((target) => {
    if (target.startsWith("../")) return [`${file} → ${target}: fuera de src/`];
    const to = layer(target);
    const errors: string[] = [];
    if (!allowed[from]?.includes(to)) errors.push(`${file} → ${target}: ${from} no depende de ${to}`);
    if (to === "features") {
      const parts = target.split("/");
      const sameFeature = feature === parts[1];
      const publicEntry = parts.length === 2 || (parts.length === 3 && /^index(?:\.tsx?)?$/.test(parts[2]));
      if (!sameFeature && !publicEntry) errors.push(`${file} → ${target}: usar la entrada pública de la funcionalidad`);
      // Las vistas reciben datos y acciones por props; el proveedor coordina estado y catálogo.
      if (sameFeature && file.startsWith(`features/${feature}/components/`) &&
        (parts[2] !== "components")) errors.push(`${file} → ${target}: la vista no accede al estado ni al catálogo`);
    }
    return errors;
  });
}
