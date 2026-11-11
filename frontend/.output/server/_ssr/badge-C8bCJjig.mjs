import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./button-BsqHVsio.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:size-3", {
	variants: { variant: {
		default: "bg-primary-soft text-primary",
		solid: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		success: "bg-success-soft text-success",
		whatsapp: "bg-success-soft text-success",
		warning: "bg-warning-soft text-warning",
		destructive: "bg-destructive-soft text-destructive",
		info: "bg-info-soft text-info",
		outline: "border-border text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
