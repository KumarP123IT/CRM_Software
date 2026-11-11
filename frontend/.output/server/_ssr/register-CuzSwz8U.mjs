import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { cn as CircleAlert, mn as Check, n as X } from "../_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./button-BsqHVsio.mjs";
import { t as useAuth } from "./auth-DdXLipCd.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as api } from "./api-YYcBxaWJ.mjs";
import { n as Label, t as Input } from "./label-vKCGTnBa.mjs";
import { t as Checkbox } from "./checkbox-DGGUYei4.mjs";
import { t as Progress } from "./progress-CYK5gA4w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-CuzSwz8U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Register() {
	const navigate = useNavigate();
	const signIn = useAuth((s) => s.signIn);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [business, setBusiness] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [slugAvailable, setSlugAvailable] = (0, import_react.useState)(null);
	const [slugChecking, setSlugChecking] = (0, import_react.useState)(false);
	const getPasswordStrength = (pwd) => {
		let strength = 0;
		if (pwd.length >= 8) strength += 1;
		if (pwd.length >= 12) strength += 1;
		if (/[a-z]/.test(pwd)) strength += 1;
		if (/[A-Z]/.test(pwd)) strength += 1;
		if (/[0-9]/.test(pwd)) strength += 1;
		if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;
		return Math.min(strength, 5);
	};
	const passwordStrength = getPasswordStrength(password);
	const strengthColors = [
		"bg-destructive",
		"bg-destructive",
		"bg-warning",
		"bg-info",
		"bg-success"
	];
	const strengthLabels = [
		"Weak",
		"Fair",
		"Good",
		"Strong",
		"Very strong"
	];
	const checkSlugAvailability = async (value) => {
		if (!value) {
			setSlugAvailable(null);
			return;
		}
		setSlugChecking(true);
		try {
			const result = await api.auth.checkSlug(value);
			setSlugAvailable(result.available);
		} catch {
			setSlugAvailable(null);
		}
		setSlugChecking(false);
	};
	const handleSlugChange = (value) => {
		const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
		setSlug(slug);
		checkSlugAvailability(slug);
	};
	const handleBusinessChange = (value) => {
		setBusiness(value);
		handleSlugChange(value);
	};
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const r = await api.auth.register({
				name,
				email,
				password,
				business,
				slug
			});
			signIn(r.user, r.token);
			await navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't create account");
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
					children: "Create your workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "name",
						children: "Your name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "name",
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "email",
						children: "Work email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email",
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pw",
							children: "Password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pw",
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true
						}),
						password && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: passwordStrength / 5 * 100,
								className: "h-1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Password strength:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn(strengthColors[passwordStrength - 1], "font-medium"),
										children: strengthLabels[passwordStrength - 1]
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "business",
						children: "Business name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "business",
						value: business,
						onChange: handleBusinessChange,
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "slug",
							children: "Workspace URL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-2 text-sm text-muted-foreground",
									children: "konvo.app/"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "slug",
									value: slug,
									onChange: (e) => handleSlugChange(e.target.value),
									required: true,
									className: cn(slugAvailable === false && "border-destructive", slugAvailable === true && "border-success")
								}),
								slugChecking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ml-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-4 border-2 border-t-primary rounded-full animate-spin" })
								}),
								slugAvailable === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "ml-2 size-4 text-success" }),
								slugAvailable === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "ml-2 size-4 text-destructive" })
							]
						}),
						slugAvailable === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: "This URL is already taken"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						id: "terms",
						checked: terms,
						onCheckedChange: (v) => setTerms(v),
						required: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "terms",
						className: "text-sm",
						children: [
							"I agree to the",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "text-primary hover:underline",
								children: "Terms of Service"
							}),
							" ",
							"and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "text-primary hover:underline",
								children: "Privacy Policy"
							})
						]
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
					disabled: !name || !email || password.length < 8 || !business || !slug || slugAvailable === false || !terms,
					children: "Create workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/login",
							children: "Already have an account? Sign in"
						})
					})
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
export { Register as component };
