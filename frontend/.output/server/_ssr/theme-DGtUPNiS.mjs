import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useUi } from "./ui-BwiyUJrB.mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as useAuth } from "./auth-DdXLipCd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-DGtUPNiS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Rehydrates persisted stores on the client and applies the theme class. */
function ThemeProvider({ children }) {
	const theme = useUi((s) => s.theme);
	(0, import_react.useEffect)(() => {
		useUi.persist.rehydrate();
		useAuth.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const apply = () => {
			const dark = theme === "dark" || theme === "system" && mq.matches;
			document.documentElement.classList.toggle("dark", dark);
		};
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/** Hook to get and set the current theme. */
var useTheme = () => {
	return {
		theme: useUi((s) => s.theme),
		setTheme: useUi((s) => s.setTheme)
	};
};
//#endregion
export { useTheme as n, ThemeProvider as t };
