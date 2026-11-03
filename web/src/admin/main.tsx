/** Entrada del panel del editor (admin.prana-nutricion.online). Se ejecuta solo en el navegador. */
// Primero: prepara la CSP (nonce de estilos y zod sin eval) antes de que se ejecute ninguna librería.
import "@/lib/csp";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import { App } from "./App";
import { RouterProvider } from "./lib/router";
import { SessionProvider } from "./lib/session";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </RouterProvider>
  </StrictMode>,
);
