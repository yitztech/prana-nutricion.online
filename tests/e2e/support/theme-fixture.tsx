import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeToggle } from "../../../src/components/brand/ThemeToggle";
import { ThemeProvider } from "../../../src/providers/theme-provider";
import "../../../src/styles/index.css";

// Dos consumidores reales del mismo proveedor, sin añadir controles a la página pública.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <section aria-label="Primer control"><ThemeToggle /></section>
      <section aria-label="Segundo control"><ThemeToggle /></section>
    </ThemeProvider>
  </StrictMode>,
);
