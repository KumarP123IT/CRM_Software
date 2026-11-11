import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-BsqHVsio.mjs";
import { t as useAuth } from "./auth-DdXLipCd.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as api } from "./api-YYcBxaWJ.mjs";
import { n as Label, t as Input } from "./label-vKCGTnBa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-D5VAnhui.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const signIn = useAuth((s) => s.signIn);
	const [email, setEmail] = (0, import_react.useState)("priya@chaipointcafe.in");
	const [password, setPassword] = (0, import_react.useState)("password");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const r = await api.auth.login({
				email,
				password
			});
			signIn(r.user, r.token);
			await navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't sign in");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Welcome back"
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
						onChange: (e) => setEmail(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pw",
						children: "Password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pw",
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					loading,
					disabled: !email || password.length < 6,
					children: "Sign in"
				})
			]
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
export { Login as component };
