import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-BsqHVsio.mjs";
import { i as Guarded, n as EmptyState, s as PageHeader, t as Card } from "./shared-DuLMoHHa.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ComingSoon-C2PjoBP4.js
var import_jsx_runtime = require_jsx_runtime();
/** Polished placeholder for sections not built yet. */
function ComingSoon({ title, description, icon, emptyTitle, emptyText, cta, perm }) {
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		onClick: () => toast("This part is coming in the next update"),
		children: cta
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title,
			description
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon,
			title: emptyTitle,
			description: emptyText,
			action: perm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guarded, {
				perm,
				children: button
			}) : button
		}) })]
	});
}
//#endregion
export { ComingSoon as t };
