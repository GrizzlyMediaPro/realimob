"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "system" | "light" | "dark";

function applyThemeClass(resolvedTheme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // La mount, citește tema salvată și aplică imediat
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // Aplică tema ori de câte ori se schimbă
  useEffect(() => {
    if (!mounted) return;

    // Salvează preferința
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      // Aplică tema curentă a sistemului
      applyThemeClass(getSystemTheme());

      // Ascultă schimbările de sistem
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyThemeClass(getSystemTheme());
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyThemeClass(theme);
    }
  }, [theme, mounted]);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return { theme, changeTheme, mounted };
}
