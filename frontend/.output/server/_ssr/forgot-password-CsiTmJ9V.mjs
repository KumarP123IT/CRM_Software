import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { cn as CircleAlert, rn as Clock } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BsqHVsio.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as api } from "./api-YYcBxaWJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Label, t as Input } from "./label-vKCGTnBa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-CsiTmJ9V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPassword() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const [cooldown, setCooldown] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (cooldown > 0) {
			const timer = setTimeout(() => setCooldown(cooldown - 1), 1e3);
			return () => clearTimeout(timer);
		}
	}, [cooldown]);
	const submit = async (e) => {
		e.preventDefault();
		if (cooldown > 0) {
			toast.error(`Please wait ${cooldown} seconds before requesting another email`);
			return;
		}
		setLoading(true);
		setError("");
		try {
			await api.auth.forgotPassword({ email });
			setSent(true);
			setCooldown(60);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't send reset email");
		} finally {
			setLoading(false);
		}
	};
	const handleResend = () => {
		const syntheticEvent = new Event("submit", { cancelable: true });
		Object.assign(syntheticEvent, { preventDefault: () => {} });
		submit(syntheticEvent);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: submit,
			className: "mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6",
			children: sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Check your email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						"We sent a password reset link to ",
						email,
						". Click the link to set a new password."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 p-4 rounded-lg bg-muted/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mb-2",
						children: "Didn't receive it?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleResend,
						disabled: cooldown > 0,
						className: "w-full",
						children: cooldown > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 mr-2" }),
							"Resend in ",
							cooldown,
							"s"
						] }) : "Resend email"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: () => navigate({ to: "/login" }),
					className: "w-full",
					children: "Back to sign in"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Reset your password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Enter your email and we'll send you a reset link."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "email",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email",
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					role: "alert",
					className: "text-sm text-destructive flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), error]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					loading,
					disabled: !email,
					className: "w-full",
					children: "Send reset link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => navigate({ to: "/login" }),
					className: "w-full",
					children: "Back to sign in"
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-panel hidden flex-col justify-center gap-4 p-12 lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-bold",
					children: "One inbox for your whole team."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Reply faster on WhatsApp." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Never lose a lead." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Message everyone in one tap." })
			]
		})]
	});
}
//#endregion
export { ForgotPassword as component };
