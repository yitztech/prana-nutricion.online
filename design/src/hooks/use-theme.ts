import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** Clave en localStorage; public/theme.js la lee antes de pintar para no parpadear. */
export const THEME_STORAGE_KEY = "prana-tema";

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)");

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Tema actual: el elegido por la persona o, si no eligió, el del sistema. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  useEffect(() => {
    const media = systemDark();
    const follow = () => {
      if (storedTheme()) return;
      const next = media.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Sin almacenamiento (modo privado): el cambio dura lo que la visita.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
