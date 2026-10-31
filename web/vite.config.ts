import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Dos builds desde la raíz del repositorio (npm run build):
 * - cliente (dist/client): plantilla del sitio, JS y CSS con huella, imágenes y el admin (/admin/).
 * - servidor (dist/server/entry-server.js): React sin dependencias externas, que el servicio importa
 *   para generar el HTML estático de cada página con el contenido de la base de datos.
 */
export default defineConfig(({ isSsrBuild }) => ({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  ssr: { noExternal: true },
  build: {
    outDir: isSsrBuild ? "dist/server" : "dist/client",
    emptyOutDir: true,
    copyPublicDir: !isSsrBuild,
    // Sin hidratación parcial ni CDN: un CSS y un JS por entrada, servidos desde el propio dominio.
    rolldownOptions: isSsrBuild
      ? {}
      : {
          input: {
            sitio: path.resolve(import.meta.dirname, "index.html"),
            admin: path.resolve(import.meta.dirname, "admin/index.html"),
          },
        },
  },
  server: {
    // `npm run dev` con el servicio en marcha (docker compose): el admin habla con su API.
    proxy: { "/api": process.env.VITE_API_URL ?? "http://127.0.0.1:8091" },
  },
}));
