import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY, ThemeContext, type Theme } from "@/hooks/use-theme";

function parseTheme(value: string | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

function storedTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // El HTML generado empieza en claro; al montar se aplica la elección (public/theme.js ya pintó la clase).
  const [theme, setTheme] = useState<Theme>("light");
  const current = useRef(theme);
  // La elección dura toda la visita aunque el almacenamiento esté bloqueado.
  const preference = useRef<Theme | null>(null);

  const apply = useCallback((next: Theme) => {
    current.current = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  }, []);

  useEffect(() => {
    preference.current = storedTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (!preference.current) apply(media.matches ? "dark" : "light");
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== localStorage) return;
      } catch {
        return;
      }
      preference.current = parseTheme(event.newValue);
      apply(preference.current ?? (media.matches ? "dark" : "light"));
    };
    apply(preference.current ?? (media.matches ? "dark" : "light"));
    media.addEventListener("change", followSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", followSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, [apply]);

  const toggle = useCallback(() => {
    const next = current.current === "dark" ? "light" : "dark";
    preference.current = next;
    apply(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // La interfaz comparte la elección incluso sin persistencia.
    }
  }, [apply]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}
