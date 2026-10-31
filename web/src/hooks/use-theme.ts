import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
/** public/theme.js utiliza la misma clave antes de pintar. */
export const THEME_STORAGE_KEY = "prana-tema";
export const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

/** Todos los controles leen el estado de un único ThemeProvider. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme necesita ThemeProvider");
  return context;
}
