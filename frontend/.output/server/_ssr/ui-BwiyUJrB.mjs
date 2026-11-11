import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BwiyUJrB.js
var useUi = create()(persist((set) => ({
	sidebarCollapsed: false,
	theme: "system",
	paletteOpen: false,
	shortcutsOpen: false,
	toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
	setTheme: (theme) => set({ theme }),
	setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
	setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen })
}), {
	name: "konvo-ui",
	skipHydration: true,
	partialize: (s) => ({
		sidebarCollapsed: s.sidebarCollapsed,
		theme: s.theme
	})
}));
//#endregion
export { useUi as t };
