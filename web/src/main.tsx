import { createRoot, hydrateRoot } from "react-dom/client";
import { Root } from "@/Root";
import "@/styles/index.css";
import type { SiteContent } from "@/types";

const container = document.getElementById("root")!;
const embedded = document.getElementById("prana-datos")?.textContent;

if (embedded) {
  // La ruta con la que se generó: el 404 se sirve en cualquier dirección y debe hidratar igual.
  const { path, content } = JSON.parse(embedded) as { path: string; content: SiteContent };
  hydrateRoot(container, <Root content={content} pathname={path} />);
} else if (import.meta.env.DEV) {
  // `npm run dev`: sin generar, con el contenido inicial y renderizado en el cliente.
  const { seedContent } = await import("#shared/seed/index.ts");
  createRoot(container).render(<Root content={seedContent()} pathname={window.location.pathname} />);
}
