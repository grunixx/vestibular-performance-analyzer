"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type SimuTheme = "white" | "night" | "blue" | "purple";

export interface ThemeOption {
  id: SimuTheme;
  name: string;
  description: string;
  swatches: [string, string];
}

const THEME_STORAGE_KEY = "simuai-theme";

const themeOptions: ThemeOption[] = [
  {
    id: "white",
    name: "White",
    description: "Limpo e acadêmico",
    swatches: ["#f8fbff", "#1b4f72"]
  },
  {
    id: "night",
    name: "Night",
    description: "Tech e confortável",
    swatches: ["#0f172a", "#38bdf8"]
  },
  {
    id: "blue",
    name: "Blue",
    description: "Confiável e institucional",
    swatches: ["#eff6ff", "#1d4ed8"]
  },
  {
    id: "purple",
    name: "Purple",
    description: "Identidade SIMU.AI",
    swatches: ["#f5f3ff", "#7c3aed"]
  }
];

interface ThemeContextValue {
  theme: SimuTheme;
  setTheme: (theme: SimuTheme) => void;
  options: ThemeOption[];
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: SimuTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setThemeState] = useState<SimuTheme>("white");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as SimuTheme | null;
    const validTheme = themeOptions.some((option) => option.id === saved);
    const initialTheme = validTheme && saved ? saved : "white";

    applyTheme(initialTheme);
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  const setTheme = (nextTheme: SimuTheme): void => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      options: themeOptions,
      mounted
    }),
    [theme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
