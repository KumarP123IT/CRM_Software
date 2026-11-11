import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { cn as CircleAlert } from "../_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./button-BsqHVsio.mjs";
import { n as useEffectiveRole } from "./auth-DdXLipCd.mjs";
import { i as TooltipTrigger, n as TooltipContent, t as Tooltip } from "./tooltip-DsMDu4XZ.mjs";
import { n as Area, r as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { a as format, i as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-DuLMoHHa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-lg border bg-card text-card-foreground shadow-card", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1 p-5", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-display text-md font-semibold leading-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-5 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-5 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0
});
var num = new Intl.NumberFormat("en-IN");
var formatNumber = (v) => num.format(v);
var timeAgo = (iso) => formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
var timeOfDay = (iso) => format(new Date(iso), "h:mm a");
var initials = (name) => name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
var ALL = [
	"conversation.reply",
	"conversation.assign",
	"contact.create",
	"contact.delete",
	"broadcast.create",
	"template.create",
	"lead.edit",
	"bot.edit",
	"ai.configure",
	"ads.manage",
	"analytics.view",
	"settings.manage",
	"billing.manage",
	"team.invite"
];
var ROLE_PERMISSIONS = {
	owner: ALL,
	admin: ALL.filter((p) => p !== "billing.manage"),
	manager: [
		"conversation.reply",
		"conversation.assign",
		"contact.create",
		"broadcast.create",
		"template.create",
		"lead.edit",
		"bot.edit",
		"analytics.view",
		"team.invite"
	],
	agent: [
		"conversation.reply",
		"contact.create",
		"lead.edit"
	],
	readonly: ["analytics.view"]
};
var ROLE_LABEL = {
	owner: "Owner",
	admin: "Admin",
	manager: "Manager",
	agent: "Agent",
	readonly: "Read-only"
};
function can(role, perm) {
	return ROLE_PERMISSIONS[role].includes(perm);
}
/** Minimum role that has a permission, for "why is this disabled" tooltips. */
function deniedReason(perm) {
	return `Only ${ROLE_LABEL[[
		"agent",
		"manager",
		"admin",
		"owner"
	].find((r) => can(r, perm)) ?? "owner"]}s and above can do this. Ask your workspace owner for access.`;
}
function usePermission(perm) {
	const role = useEffectiveRole();
	const allowed = can(role, perm);
	return {
		allowed,
		reason: allowed ? void 0 : deniedReason(perm),
		role
	};
}
function PageHeader({ title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-bold text-foreground sm:text-2xl",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-base text-muted-foreground",
				children: description
			})]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: actions
		})]
	});
}
function EmptyState({ icon: Icon, title, description, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center px-6 py-14 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 -m-3 rounded-full bg-primary-soft opacity-60 blur-xl",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex size-14 items-center justify-center rounded-2xl border bg-card text-primary shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-6",
						"aria-hidden": true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-md font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-base text-muted-foreground",
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: action
			})
		]
	});
}
function ErrorState({ message = "We couldn't load this.", onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "flex flex-col items-center gap-3 px-6 py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-full bg-destructive-soft text-destructive",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "size-5",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base text-foreground",
				children: message
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				size: "sm",
				onClick: onRetry,
				children: "Try again"
			})
		]
	});
}
function ListSkeleton({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		"aria-busy": "true",
		"aria-label": "Loading",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-9 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-1/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-2/3" })]
			})]
		}, i))
	});
}
var AVATAR_TONES = [
	"bg-primary-soft text-primary",
	"bg-success-soft text-success",
	"bg-warning-soft text-warning",
	"bg-info-soft text-info",
	"bg-destructive-soft text-destructive"
];
function PresenceAvatar({ name, tone, online, size = "md" }) {
	const t = tone ?? name.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "relative inline-flex shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("inline-flex items-center justify-center rounded-full font-semibold", size === "sm" ? "size-7 text-xs" : size === "lg" ? "size-11 text-base" : "size-9 text-sm", AVATAR_TONES[t % AVATAR_TONES.length]),
			"aria-hidden": true,
			children: initials(name)
		}), online !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card", online ? "bg-success" : "bg-muted-foreground/50"),
			"aria-label": online ? "Online" : "Offline",
			role: "img"
		})]
	});
}
function Kbd({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: cn("inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground", className),
		children
	});
}
function StatCard({ label, value, delta, trend, icon: Icon, goodWhenDown = false, loading }) {
	const id = import_react.useId().replace(/:/g, "");
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-8 w-20" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-10 w-full" })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "group p-5 transition-shadow duration-200 hover:shadow-float",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 items-center justify-center rounded-md bg-primary-soft text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-4",
						"aria-hidden": true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-2xl font-bold tabular text-foreground",
					children: value
				}), delta !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("text-sm font-medium tabular", delta !== void 0 && (goodWhenDown ? delta < 0 : delta > 0) ? "text-success" : "text-destructive"),
					children: [
						delta > 0 ? "+" : "",
						delta,
						"%"
					]
				})]
			}),
			trend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-10",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: trend.map((v, i) => ({
							i,
							v
						})),
						margin: {
							top: 2,
							bottom: 0,
							left: 0,
							right: 0
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: `g${id}`,
							x1: "0",
							x2: "0",
							y1: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "0%",
								stopColor: "var(--color-primary)",
								stopOpacity: .25
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "var(--color-primary)",
								stopOpacity: 0
							})]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "v",
							stroke: "var(--color-primary)",
							strokeWidth: 2,
							fill: `url(#g${id})`,
							isAnimationActive: false
						})]
					})
				})
			})
		]
	});
}
function Guarded({ perm, children, mode = "disable" }) {
	const { allowed, reason } = usePermission(perm);
	if (allowed) return children;
	if (mode === "hide") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			tabIndex: 0,
			className: "inline-flex",
			children: import_react.cloneElement(children, { disabled: true })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		className: "max-w-60",
		children: reason
	})] });
}
function ProgressRing({ value, size = 56 }) {
	const stroke = 5;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		className: "-rotate-90",
		role: "img",
		"aria-label": `${Math.round(value)}% complete`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: size / 2,
			cy: size / 2,
			r,
			fill: "none",
			stroke: "var(--color-muted)",
			strokeWidth: stroke
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: size / 2,
			cy: size / 2,
			r,
			fill: "none",
			stroke: "var(--color-primary)",
			strokeWidth: stroke,
			strokeLinecap: "round",
			strokeDasharray: c,
			strokeDashoffset: c * (1 - value / 100),
			className: "transition-[stroke-dashoffset] duration-500"
		})]
	});
}
//#endregion
export { usePermission as _, Kbd as a, PresenceAvatar as c, Skeleton as d, StatCard as f, timeOfDay as g, timeAgo as h, Guarded as i, ProgressRing as l, formatNumber as m, EmptyState as n, ListSkeleton as o, can as p, ErrorState as r, PageHeader as s, Card as t, ROLE_LABEL as u };
