import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as Slot, m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { yt as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BsqHVsio.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BASE_URL = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_API_BASE_URL"] ?? "/api";
var tokenGetter = () => null;
/** Auth store registers how to read the current token. */
function setTokenGetter(fn) {
	tokenGetter = fn;
}
var HttpError = class extends Error {
	status;
	code;
	constructor(e) {
		super(e.message);
		this.status = e.status;
		this.code = e.code;
	}
};
function normalize(status, body) {
	if (body && typeof body === "object") {
		const b = body;
		const message = typeof b.message === "string" ? b.message : typeof b.error === "string" ? b.error : "Something went wrong";
		return new HttpError({
			status,
			code: typeof b.code === "string" ? b.code : `http_${status}`,
			message
		});
	}
	if (status === 0) return new HttpError({
		status,
		code: "network",
		message: "You seem to be offline."
	});
	return new HttpError({
		status,
		code: `http_${status}`,
		message: "Something went wrong"
	});
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function http(path, opts = {}) {
	const { method = "GET", body, query, signal } = opts;
	const retries = opts.retries ?? (method === "GET" ? 2 : 0);
	const url = new URL(BASE_URL + path, typeof window !== "undefined" ? window.location.origin : "http://localhost");
	if (query) {
		for (const [k, v] of Object.entries(query)) if (v !== void 0) url.searchParams.set(k, String(v));
	}
	const headers = { Accept: "application/json" };
	if (body !== void 0) headers["Content-Type"] = "application/json";
	const token = tokenGetter();
	if (token) headers["Authorization"] = `Bearer ${token}`;
	for (let attempt = 0;; attempt++) try {
		const res = await fetch(url, {
			method,
			headers,
			...body === void 0 ? {} : { body: JSON.stringify(body) },
			...signal ? { signal } : {}
		});
		const text = await res.text();
		const data = text ? JSON.parse(text) : void 0;
		if (!res.ok) {
			const err = normalize(res.status, data);
			if (res.status >= 500 && attempt < retries) {
				await sleep(300 * 2 ** attempt);
				continue;
			}
			throw err;
		}
		return data;
	} catch (e) {
		if (e instanceof HttpError) throw e;
		if (attempt < retries) {
			await sleep(300 * 2 ** attempt);
			continue;
		}
		throw normalize(0, void 0);
	}
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover active:bg-primary-pressed",
			destructive: "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90",
			danger: "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90",
			outline: "border border-input bg-card shadow-soft hover:bg-accent hover:text-accent-foreground",
			secondary: "border border-border bg-card text-foreground shadow-soft hover:bg-secondary",
			ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
			soft: "bg-primary-soft text-primary hover:bg-primary-soft/70",
			link: "text-primary underline-offset-4 hover:underline",
			panel: "bg-card/15 text-[inherit] border border-current/20 backdrop-blur hover:bg-card/25"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 px-3 text-sm",
			lg: "h-11 px-6 text-md",
			icon: "h-10 w-10",
			"icon-sm": "h-8 w-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	if (asChild) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Comp, {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		disabled: disabled || loading,
		"aria-busy": loading || void 0,
		...props,
		children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "animate-spin",
			"aria-hidden": true
		}), children]
	});
});
Button.displayName = "Button";
//#endregion
export { setTokenGetter as a, http as i, HttpError as n, cn as r, Button as t };
