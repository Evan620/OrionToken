import { useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  // Initialize theme based on system preference or local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemTheme) {
      setTheme(systemTheme);
    }
  }, [systemTheme, setTheme]);

  // Sync theme changes with localStorage
  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
      
      // Update <html> class for immediate styling effect
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    systemTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    isSystem: theme === "system",
  };
}
