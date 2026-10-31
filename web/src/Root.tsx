import { StrictMode, useEffect } from "react";
import App from "@/App";
import { ContentProvider } from "@/providers/content-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { SiteContent } from "@/types";

/** Marca `<html data-hidratado>` cuando React ya atiende la página: las pruebas lo esperan antes de interactuar. */
function HydrationMark() {
  useEffect(() => {
    document.documentElement.dataset.hidratado = "";
  }, []);
  return null;
}

/** Lo mismo en el servidor (al generar) y en el navegador (al hidratar). */
export function Root({ content, pathname }: { content: SiteContent; pathname: string }) {
  return (
    <StrictMode>
      <ContentProvider content={content} pathname={pathname}>
        <ThemeProvider>
          <App />
          <HydrationMark />
        </ThemeProvider>
      </ContentProvider>
    </StrictMode>
  );
}
