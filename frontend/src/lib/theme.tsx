import { useEffect } from "react";
import { useUi } from "@/stores/ui";
import { useAuth } from "@/stores/auth";

/** Rehydrates persisted stores on the client and applies the theme class. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUi((s) => s.theme);

  useEffect(() => {
    void useUi.persist.rehydrate();
    void useAuth.persist.rehydrate();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return <>{children}</>;
}

/** Hook to get and set the current theme. */
export const useTheme = () => {
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  return { theme, setTheme };
};
