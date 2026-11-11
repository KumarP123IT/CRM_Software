import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePref = "light" | "dark" | "system";

interface UiState {
  sidebarCollapsed: boolean;
  theme: ThemePref;
  paletteOpen: boolean;
  shortcutsOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (t: ThemePref) => void;
  setPaletteOpen: (o: boolean) => void;
  setShortcutsOpen: (o: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "system",
      paletteOpen: false,
      shortcutsOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
    }),
    {
      name: "konvo-ui",
      skipHydration: true,
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
      }),
    },
  ),
);
