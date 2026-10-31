import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { categories } from "./src/features/treatments/data/catalog.ts";
import { benefits, benefitPageDescription } from "./src/features/benefits/data/benefits.ts";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
);

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "treatment-pages",
    apply: "build",
    async writeBundle(options) {
      // Cada URL tiene su index.html: la recarga no depende del fallback de una SPA.
      const outDir = options.dir ?? "dist";
      const template = await readFile(path.join(outDir, "index.html"), "utf8");
      const pages = [
        ...categories.map((category) => ({ dir: `tratamientos/${category.id}`, title: category.title, description: category.description })),
        ...benefits.map((benefit) => ({ dir: `beneficios/${benefit.id}`, title: benefit.title, description: benefitPageDescription })),
      ];
      await Promise.all(pages.map(async (page) => {
        const title = escapeHtml(`${page.title} · Praná en Cuautla`);
        const description = escapeHtml(page.description);
        const html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*/, `$1${description}`)
          .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, `$1${title}`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${description}`)
          .replace(/<link\b[^>]*rel="preload"[^>]*>/g, "");
        const dir = path.join(outDir, page.dir);
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, "index.html"), html);
      }));
    },
  }],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});
