import { createContext, useContext } from "react";
import type { SiteContent } from "@/types";

/** Contenido de la página y la ruta que se dibuja. `today` empieza en la fecha de generación. */
export type ContentValue = Omit<SiteContent, "generatedOn"> & { today: string; pathname: string };

export const ContentContext = createContext<ContentValue | null>(null);

/** Todos los componentes leen el contenido de un único ContentProvider. */
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent necesita ContentProvider");
  return context;
}
