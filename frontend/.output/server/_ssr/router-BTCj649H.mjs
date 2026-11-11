import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button-BsqHVsio.mjs";
import { r as TooltipProvider } from "./tooltip-DsMDu4XZ.mjs";
import { C as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, q as redirect, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as ThemeProvider } from "./theme-DGtUPNiS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BTCj649H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CIFAitB4.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message: describeThrown(error),
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var MAX_SERIALIZED_LENGTH = 2e3;
function describeThrown(error) {
	if (error instanceof Response) return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	const { message } = error ?? {};
	if (typeof message === "string" && message.length > 0) return message;
	try {
		return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
	} catch {
		return String(error);
	}
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-7xl font-bold text-primary tabular",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-lg font-semibold text-foreground",
					children: "We couldn't find that page"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-base text-muted-foreground",
					children: "It may have moved, or the link has a typo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: "Back to dashboard"
						})
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold text-foreground",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-base text-muted-foreground",
					children: "It's not you, it's us. Try again, or head back to the dashboard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/dashboard",
							children: "Go to dashboard"
						})
					})]
				})
			]
		})
	});
}
var Route$21 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Konvo — WhatsApp CRM for growing businesses" },
			{
				name: "description",
				content: "Shared WhatsApp inbox, contacts, broadcasts, leads and bots for your whole team."
			},
			{
				property: "og:title",
				content: "Konvo — WhatsApp CRM"
			},
			{
				property: "og:description",
				content: "Shared WhatsApp inbox, contacts, broadcasts, leads and bots for your whole team."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$21.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
			delayDuration: 200,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "bottom-right" })]
		}) })
	});
}
var $$splitComponentImporter$19 = () => import("./register-CuzSwz8U.mjs");
var Route$20 = createFileRoute("/register")({
	head: () => ({ meta: [
		{ title: "Create workspace — Konvo" },
		{
			name: "description",
			content: "Create your Konvo workspace."
		},
		{
			property: "og:title",
			content: "Create workspace — Konvo"
		},
		{
			property: "og:description",
			content: "Create your Konvo workspace."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./forgot-password-CsiTmJ9V.mjs");
var Route$19 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [
		{ title: "Reset password — Konvo" },
		{
			name: "description",
			content: "Reset your Konvo password."
		},
		{
			property: "og:title",
			content: "Reset password — Konvo"
		},
		{
			property: "og:description",
			content: "Reset your Konvo password."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var Route$18 = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Konvo — WhatsApp CRM" },
		{
			name: "description",
			content: "Your team's shared WhatsApp inbox, contacts, broadcasts and leads."
		},
		{
			property: "og:title",
			content: "Konvo — WhatsApp CRM"
		},
		{
			property: "og:description",
			content: "Your team's shared WhatsApp inbox, contacts, broadcasts and leads."
		}
	] })
});
var $$splitComponentImporter$17 = () => import("../_authenticated-abt8sBwD.mjs");
var Route$17 = createFileRoute("/_authenticated")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./login-D5VAnhui.mjs");
var Route$16 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Sign in — Konvo" },
		{
			name: "description",
			content: "Sign in to your Konvo workspace."
		},
		{
			property: "og:title",
			content: "Sign in — Konvo"
		},
		{
			property: "og:description",
			content: "Sign in to your Konvo workspace."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("../_authenticated.ads-Dd6ya-Lm.mjs");
var Route$15 = createFileRoute("/_authenticated/ads")({
	head: () => ({ meta: [
		{ title: "Ads — Konvo" },
		{
			name: "description",
			content: "Ads that open a WhatsApp chat."
		},
		{
			property: "og:title",
			content: "Ads — Konvo"
		},
		{
			property: "og:description",
			content: "Ads that open a WhatsApp chat."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("../_authenticated.ai-agents-Bu83wZsP.mjs");
var Route$14 = createFileRoute("/_authenticated/ai-agents")({
	head: () => ({ meta: [
		{ title: "AI Agents — Konvo" },
		{
			name: "description",
			content: "Let AI answer customers in your voice."
		},
		{
			property: "og:title",
			content: "AI Agents — Konvo"
		},
		{
			property: "og:description",
			content: "Let AI answer customers in your voice."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("../_authenticated.analytics-DaD28E4W.mjs");
var Route$13 = createFileRoute("/_authenticated/analytics")({
	head: () => ({ meta: [
		{ title: "Analytics — Konvo" },
		{
			name: "description",
			content: "How your team and messages are doing."
		},
		{
			property: "og:title",
			content: "Analytics — Konvo"
		},
		{
			property: "og:description",
			content: "How your team and messages are doing."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("../_authenticated.bots-CDe_xdP8.mjs");
var Route$12 = createFileRoute("/_authenticated/bots")({
	head: () => ({ meta: [
		{ title: "Bots — Konvo" },
		{
			name: "description",
			content: "Automatic replies for common questions."
		},
		{
			property: "og:title",
			content: "Bots — Konvo"
		},
		{
			property: "og:description",
			content: "Automatic replies for common questions."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("../_authenticated.broadcasts-Bc5vfvxO.mjs");
var Route$11 = createFileRoute("/_authenticated/broadcasts")({
	head: () => ({ meta: [
		{ title: "Broadcasts — Konvo" },
		{
			name: "description",
			content: "Send one message to everyone in a group."
		},
		{
			property: "og:title",
			content: "Broadcasts — Konvo"
		},
		{
			property: "og:description",
			content: "Send one message to everyone in a group."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("../_authenticated.calls-CnmanZW3.mjs");
var Route$10 = createFileRoute("/_authenticated/calls")({
	head: () => ({ meta: [
		{ title: "Calls — Konvo" },
		{
			name: "description",
			content: "Call reminders and history."
		},
		{
			property: "og:title",
			content: "Calls — Konvo"
		},
		{
			property: "og:description",
			content: "Call reminders and history."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("../_authenticated.campaigns-C-XD1LtJ.mjs");
var Route$9 = createFileRoute("/_authenticated/campaigns")({
	head: () => ({ meta: [
		{ title: "Campaigns — Konvo" },
		{
			name: "description",
			content: "Plan a series of messages over time."
		},
		{
			property: "og:title",
			content: "Campaigns — Konvo"
		},
		{
			property: "og:description",
			content: "Plan a series of messages over time."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("../_authenticated.comment-automation-vACNWzPY.mjs");
var Route$8 = createFileRoute("/_authenticated/comment-automation")({
	head: () => ({ meta: [
		{ title: "Comment Automation — Konvo" },
		{
			name: "description",
			content: "Reply to Instagram comments on WhatsApp."
		},
		{
			property: "og:title",
			content: "Comment Automation — Konvo"
		},
		{
			property: "og:description",
			content: "Reply to Instagram comments on WhatsApp."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("../_authenticated.contacts-DflP0cZg.mjs");
var Route$7 = createFileRoute("/_authenticated/contacts")({
	head: () => ({ meta: [
		{ title: "Contacts — Konvo" },
		{
			name: "description",
			content: "Everyone who has messaged your business."
		},
		{
			property: "og:title",
			content: "Contacts — Konvo"
		},
		{
			property: "og:description",
			content: "Everyone who has messaged your business."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_authenticated.conversations-DEmyYqqn.mjs");
var Route$6 = createFileRoute("/_authenticated/conversations")({
	head: () => ({ meta: [
		{ title: "Conversations — Konvo" },
		{
			name: "description",
			content: "Every WhatsApp chat in one shared inbox."
		},
		{
			property: "og:title",
			content: "Conversations — Konvo"
		},
		{
			property: "og:description",
			content: "Every WhatsApp chat in one shared inbox."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("../_authenticated.dashboard-CbdhRlb9.mjs");
var Route$5 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — Konvo" },
		{
			name: "description",
			content: "Your day at a glance."
		},
		{
			property: "og:title",
			content: "Dashboard — Konvo"
		},
		{
			property: "og:description",
			content: "Your day at a glance."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("../_authenticated.design-BdltIp3f.mjs");
var Route$4 = createFileRoute("/_authenticated/design")({
	head: () => ({ meta: [
		{ title: "Design system — Konvo" },
		{
			name: "description",
			content: "Every component and state."
		},
		{
			property: "og:title",
			content: "Design system — Konvo"
		},
		{
			property: "og:description",
			content: "Every component and state."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("../_authenticated.groups-8m67uar5.mjs");
var Route$3 = createFileRoute("/_authenticated/groups")({
	head: () => ({ meta: [
		{ title: "Groups — Konvo" },
		{
			name: "description",
			content: "Organise contacts into groups you can message together."
		},
		{
			property: "og:title",
			content: "Groups — Konvo"
		},
		{
			property: "og:description",
			content: "Organise contacts into groups you can message together."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("../_authenticated.leads-Uo-o3CGb.mjs");
var Route$2 = createFileRoute("/_authenticated/leads")({
	head: () => ({ meta: [
		{ title: "Leads — Konvo" },
		{
			name: "description",
			content: "Track deals from first hello to paid."
		},
		{
			property: "og:title",
			content: "Leads — Konvo"
		},
		{
			property: "og:description",
			content: "Track deals from first hello to paid."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_authenticated.settings-CC4rdriS.mjs");
var Route$1 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — Konvo" },
		{
			name: "description",
			content: "Workspace, team and billing."
		},
		{
			property: "og:title",
			content: "Settings — Konvo"
		},
		{
			property: "og:description",
			content: "Workspace, team and billing."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_authenticated.templates-ChGB_cU1.mjs");
var Route = createFileRoute("/_authenticated/templates")({
	head: () => ({ meta: [
		{ title: "Templates — Konvo" },
		{
			name: "description",
			content: "Pre-approved messages ready to send."
		},
		{
			property: "og:title",
			content: "Templates — Konvo"
		},
		{
			property: "og:description",
			content: "Pre-approved messages ready to send."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$18.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var AuthenticatedRoute = Route$17.update({
	id: "/_authenticated",
	getParentRoute: () => Route$21
});
var ForgotPasswordRoute = Route$19.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$21
});
var LoginRoute = Route$16.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$21
});
var RegisterRoute = Route$20.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$21
});
var AuthenticatedRouteChildren = {
	AuthenticatedAdsRoute: Route$15.update({
		id: "/ads",
		path: "/ads",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedAiAgentsRoute: Route$14.update({
		id: "/ai-agents",
		path: "/ai-agents",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedAnalyticsRoute: Route$13.update({
		id: "/analytics",
		path: "/analytics",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedBotsRoute: Route$12.update({
		id: "/bots",
		path: "/bots",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedBroadcastsRoute: Route$11.update({
		id: "/broadcasts",
		path: "/broadcasts",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedCallsRoute: Route$10.update({
		id: "/calls",
		path: "/calls",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedCampaignsRoute: Route$9.update({
		id: "/campaigns",
		path: "/campaigns",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedCommentAutomationRoute: Route$8.update({
		id: "/comment-automation",
		path: "/comment-automation",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedContactsRoute: Route$7.update({
		id: "/contacts",
		path: "/contacts",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedConversationsRoute: Route$6.update({
		id: "/conversations",
		path: "/conversations",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedDashboardRoute: Route$5.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedDesignRoute: Route$4.update({
		id: "/design",
		path: "/design",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedGroupsRoute: Route$3.update({
		id: "/groups",
		path: "/groups",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedLeadsRoute: Route$2.update({
		id: "/leads",
		path: "/leads",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedSettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AuthenticatedRoute
	}),
	AuthenticatedTemplatesRoute: Route.update({
		id: "/templates",
		path: "/templates",
		getParentRoute: () => AuthenticatedRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRoute: AuthenticatedRoute._addFileChildren(AuthenticatedRouteChildren),
	ForgotPasswordRoute,
	LoginRoute,
	RegisterRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
