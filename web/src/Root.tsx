import { StrictMode } from "react";
import App from "@/App";
import { ContentProvider } from "@/providers/content-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { SiteContent } from "@/types";

/** Lo mismo en el servidor (al generar) y en el navegador (al hidratar). */
export function Root({ content, pathname }: { content: SiteContent; pathname: string }) {
  return (
    <StrictMode>
      <ContentProvider content={content} pathname={pathname}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ContentProvider>
    </StrictMode>
  );
}
