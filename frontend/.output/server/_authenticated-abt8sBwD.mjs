import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { t as useUi } from "./_ssr/ui-BwiyUJrB.mjs";
import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { Cn as BookOpen, Ct as LayoutDashboard, En as BadgeIndianRupee, Et as Keyboard, F as Settings, G as Plus, Ht as FileText, J as PhoneCall, O as Sparkles, R as Search, S as Target, T as Sun, Tn as Bell, V as Rocket, X as PanelLeftOpen, Z as PanelLeftClose, _t as LogOut, c as Users, ct as MessageSquarePlus, d as UserRound, dn as ChevronRight, dt as Menu, f as UserPlus, hn as ChartColumn, i as Workflow, l as UsersRound, ln as ChevronsUpDown, mn as Check, n as X, nt as Monitor, on as CircleQuestionMark, ot as MessageSquare, pt as Megaphone, qt as Ellipsis, st as MessagesSquare, tt as Moon, ut as MessageCircleReply, xt as LifeBuoy } from "./_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { n as useEffectiveRole, t as useAuth } from "./_ssr/auth-DdXLipCd.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "./_libs/@radix-ui/react-dialog+[...].mjs";
import { i as TooltipTrigger, n as TooltipContent, t as Tooltip } from "./_ssr/tooltip-DsMDu4XZ.mjs";
import { b as Link, g as Outlet, p as useLocation, x as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { _ as usePermission, a as Kbd, c as PresenceAvatar, d as Skeleton, p as can, u as ROLE_LABEL } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as api } from "./_ssr/api-YYcBxaWJ.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, d as DropdownMenuLabel, f as DropdownMenuSeparator, l as DropdownMenuContent, n as DialogContent$1, o as DialogTitle$1, p as DropdownMenuTrigger, t as Dialog$1, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as PopoverTrigger$1, n as PopoverContent$1, r as PopoverPortal, t as Popover$1 } from "./_libs/radix-ui__react-popover.mjs";
import { t as _e } from "./_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-abt8sBwD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		key: "home",
		items: [
			{
				key: "dashboard",
				to: "/dashboard",
				icon: LayoutDashboard
			},
			{
				key: "conversations",
				to: "/conversations",
				icon: MessagesSquare
			},
			{
				key: "contacts",
				to: "/contacts",
				icon: Users
			},
			{
				key: "groups",
				to: "/groups",
				icon: UsersRound
			}
		]
	},
	{
		key: "marketing",
		items: [
			{
				key: "broadcasts",
				to: "/broadcasts",
				icon: Megaphone
			},
			{
				key: "campaigns",
				to: "/campaigns",
				icon: Rocket
			},
			{
				key: "templates",
				to: "/templates",
				icon: FileText
			},
			{
				key: "ads",
				to: "/ads",
				icon: BadgeIndianRupee,
				perm: "ads.manage"
			}
		]
	},
	{
		key: "sales",
		items: [{
			key: "leads",
			to: "/leads",
			icon: Target
		}, {
			key: "calls",
			to: "/calls",
			icon: PhoneCall
		}]
	},
	{
		key: "automation",
		items: [
			{
				key: "bots",
				to: "/bots",
				icon: Workflow
			},
			{
				key: "aiAgents",
				to: "/ai-agents",
				icon: Sparkles
			},
			{
				key: "commentAutomation",
				to: "/comment-automation",
				icon: MessageCircleReply
			}
		]
	},
	{
		key: "reports",
		items: [{
			key: "analytics",
			to: "/analytics",
			icon: ChartColumn,
			perm: "analytics.view"
		}]
	}
];
var SETTINGS_ITEM = {
	key: "settings",
	to: "/settings",
	icon: Settings
};
var ALL_NAV = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];
function NavLink({ item, collapsed, onNavigate }) {
	const { t } = useTranslation();
	const label = t(`nav.${item.key}`);
	const link = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		onClick: onNavigate,
		className: cn("group flex h-9 items-center gap-3 rounded-md px-2.5 text-base font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center px-0"),
		activeProps: { className: "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-sidebar-primary" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
				className: "size-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-sidebar-accent-foreground",
				"aria-hidden": true
			}),
			!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: label
			}),
			collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: label
			})
		]
	});
	if (!collapsed) return link;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: link
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		children: label
	})] });
}
function WorkspaceSwitcher({ collapsed }) {
	const { workspaceId, setWorkspace } = useAuth();
	const { data = [] } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => api.workspaces.list()
	});
	const current = data.find((w) => w.id === workspaceId) ?? data[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: cn("flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent", collapsed && "justify-center"),
			"aria-label": "Switch workspace",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground",
				children: current?.name.charAt(0) ?? "K"
			}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-base font-semibold text-foreground",
					children: current?.name ?? "Loading…"
				}), current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					className: "mt-0.5 px-1.5 py-0 text-[11px]",
					children: current.plan
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, {
				className: "size-4 text-muted-foreground",
				"aria-hidden": true
			})] })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "start",
		className: "w-64",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
				className: "text-xs text-muted-foreground",
				children: "Workspaces"
			}),
			data.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					setWorkspace(w.id);
					toast(`Switched to ${w.name}`);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-6 items-center justify-center rounded bg-primary-soft text-xs font-bold text-primary",
						children: w.name.charAt(0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 truncate",
						children: w.name
					}),
					w.id === current?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-primary" })
				]
			}, w.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => toast("Workspace creation is coming soon"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Create workspace"]
			})
		]
	})] });
}
function UserMenu({ collapsed }) {
	const { user, signOut } = useAuth();
	const role = useEffectiveRole();
	const navigate = useNavigate();
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: cn("flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-sidebar-accent", collapsed && "justify-center"),
			"aria-label": "Account menu",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
				name: user.name,
				tone: user.avatarColor,
				online: true,
				size: "sm"
			}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-sm font-medium text-foreground",
					children: user.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-xs text-muted-foreground",
					children: ROLE_LABEL[role]
				})]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		side: "top",
		align: "start",
		className: "w-56",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm",
				children: user.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs font-normal text-muted-foreground",
				children: user.email
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => navigate({ to: "/settings" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }), " Profile & settings"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					signOut();
					navigate({ to: "/login" });
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
			})
		]
	})] });
}
function SidebarContent({ collapsed, onNavigate }) {
	const { t } = useTranslation();
	const role = useEffectiveRole();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceSwitcher, { collapsed })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Main",
				className: "flex-1 space-y-5 overflow-y-auto px-3 py-2",
				children: NAV_GROUPS.map((g) => {
					const items = g.items.filter((i) => !i.perm || can(role, i.perm));
					if (!items.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [!collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80",
						children: t(`nav.${g.key}`)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-2 h-px w-6 bg-sidebar-border",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-0.5",
						children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
							item: i,
							collapsed,
							onNavigate
						}) }, i.key))
					})] }, g.key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 border-t border-sidebar-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					item: SETTINGS_ITEM,
					collapsed,
					onNavigate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMenu, { collapsed })]
			})
		]
	});
}
function AppSidebar() {
	const { sidebarCollapsed, toggleSidebar } = useUi();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: cn("relative hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block", sidebarCollapsed ? "w-[68px]" : "w-[248px]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sticky top-0 h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { collapsed: sidebarCollapsed }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				size: "icon-sm",
				onClick: toggleSidebar,
				className: "absolute -right-4 top-16 z-10 size-7 rounded-full",
				"aria-label": sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
				children: sidebarCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftOpen, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftClose, {})
			})]
		})
	});
}
var Popover = Popover$1;
var PopoverTrigger = PopoverTrigger$1;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = PopoverContent$1.displayName;
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var NOTIFS = [
	{
		id: 1,
		text: "Kiara Kumar is waiting for a reply for 12 min",
		time: "2m",
		unread: true
	},
	{
		id: 2,
		text: "Template “payment_reminder” is under review",
		time: "1h",
		unread: true
	},
	{
		id: 3,
		text: "“Diwali hampers — VIPs” finished sending",
		time: "2h",
		unread: true
	},
	{
		id: 4,
		text: "Farhan imported 126 contacts",
		time: "5h",
		unread: false
	}
];
function Breadcrumbs() {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const item = ALL_NAV.find((n) => pathname.startsWith(n.to));
	const label = item ? t(`nav.${item.key}`) : pathname === "/design" ? "Design system" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Breadcrumb",
		className: "hidden min-w-0 items-center gap-1.5 text-base sm:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/dashboard",
			className: "text-muted-foreground hover:text-foreground",
			children: "Konvo"
		}), label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
			className: "size-3.5 text-muted-foreground",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate font-medium text-foreground",
			"aria-current": "page",
			children: label
		})] })]
	});
}
function NewMenu() {
	const broadcast = usePermission("broadcast.create");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			className: "h-9",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "New"
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => toast("New chat is coming soon"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "size-4" }), " Chat"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => toast("New contact form is coming soon"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Contact"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => toast("New lead form is coming soon"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4" }), " Lead"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				disabled: !broadcast.allowed,
				onSelect: () => toast("Broadcast builder is coming soon"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-4" }), " Broadcast"]
			}),
			!broadcast.allowed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-2 pb-1.5 text-xs text-muted-foreground",
				children: broadcast.reason
			})
		]
	})] });
}
function Notifications() {
	const [items, setItems] = (0, import_react.useState)(NOTIFS);
	const unread = items.filter((n) => n.unread).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "icon",
			className: "relative",
			"aria-label": `Notifications, ${unread} unread`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-[18px]" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground tabular",
				children: unread
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-80 p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display font-semibold",
				children: "Notifications"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "link",
				size: "sm",
				className: "h-auto p-0",
				onClick: () => setItems((s) => s.map((n) => ({
					...n,
					unread: false
				}))),
				children: "Mark all read"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "max-h-80 overflow-y-auto py-1",
			children: items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3 px-4 py-2.5 hover:bg-accent",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent"),
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 text-sm text-foreground",
						children: n.text
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: n.time
					})
				]
			}, n.id))
		})]
	})] });
}
function ThemeToggle() {
	const { theme, setTheme } = useUi();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Change theme",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(theme === "dark" ? Moon : theme === "light" ? Sun : Monitor, { className: "size-[18px]" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => setTheme("light"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }), " Light"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => setTheme("dark"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" }), " Dark"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => setTheme("system"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-4" }), " Match my device"]
			})
		]
	})] });
}
function TopBar() {
	const { setPaletteOpen, setShortcutsOpen } = useUi();
	const [mobileNav, setMobileNav] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "md:hidden",
				"aria-label": "Open menu",
				onClick: () => setMobileNav(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: mobileNav,
				onOpenChange: setMobileNav,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "w-[280px] bg-sidebar p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						className: "sr-only",
						children: "Navigation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {
						collapsed: false,
						onNavigate: () => setMobileNav(false)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1 sm:gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setPaletteOpen(true),
						className: "flex h-9 w-9 items-center gap-2 rounded-md border bg-card px-2.5 text-base text-muted-foreground shadow-soft transition-colors hover:text-foreground sm:w-64 lg:w-80",
						"aria-label": "Search (Ctrl+K)",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "size-4 shrink-0",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden flex-1 text-left sm:inline",
								children: "Search…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden items-center gap-1 sm:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "Ctrl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "K" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewMenu, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notifications, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Help",
							className: "hidden sm:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-[18px]" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-52",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
								className: "text-xs text-muted-foreground",
								children: "Help"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => setShortcutsOpen(true),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" }),
									" Keyboard shortcuts",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
										className: "ml-auto",
										children: "?"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => toast("Guides are coming soon"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), " Guides"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => toast("We'll reply on WhatsApp within an hour"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, { className: "size-4" }), " Talk to us"]
							})
						]
					})] })
				]
			})
		]
	});
}
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent$1, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
function CommandPalette() {
	const { paletteOpen, setPaletteOpen, setTheme } = useUi();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { data: contacts } = useQuery({
		queryKey: ["contacts", { all: true }],
		queryFn: () => api.contacts.list({ pageSize: 100 }),
		enabled: paletteOpen
	});
	const { data: convos } = useQuery({
		queryKey: ["conversations", {}],
		queryFn: () => api.conversations.list({}),
		enabled: paletteOpen
	});
	const go = (fn) => {
		setPaletteOpen(false);
		fn();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open: paletteOpen,
		onOpenChange: setPaletteOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: "Search people, chats, pages or actions…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Nothing matches that. Try a name or phone number." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
				heading: "Actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go(() => toast("New contact form is coming soon")),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {}), " Add a contact"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go(() => navigate({ to: "/broadcasts" })),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {}), " Send a broadcast"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go(() => navigate({ to: "/leads" })),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, {}), " Add a lead"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go(() => setTheme("dark")),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {}), " Switch to dark theme"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go(() => setTheme("light")),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}), " Switch to light theme"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Pages",
				children: ALL_NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go(() => navigate({ to: n.to })),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, {}),
						" ",
						t(`nav.${n.key}`)
					]
				}, n.key))
			}),
			convos && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Conversations",
				children: convos.items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `chat ${c.contactName} ${c.lastMessage}`,
					onSelect: () => go(() => navigate({ to: "/conversations" })),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: c.contactName
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["— ", c.lastMessage]
							})
						]
					})]
				}, c.id))
			}),
			contacts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Contacts",
				children: contacts.items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `${c.name} ${c.phone}`,
					onSelect: () => go(() => navigate({ to: "/contacts" })),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
							name: c.name,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 truncate",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tabular text-muted-foreground",
							children: c.phone
						})
					]
				}, c.id))
			})
		] })]
	});
}
var SHORTCUTS = [
	[["Ctrl", "K"], "Open search"],
	[["/"], "Search"],
	[["j"], "Next item in a list"],
	[["k"], "Previous item in a list"],
	[["Enter"], "Open selected item"],
	[["Esc"], "Close dialog or panel"],
	[["?"], "Show this help"]
];
function isTyping(e) {
	const el = e.target;
	return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}
function useGlobalShortcuts() {
	const { setPaletteOpen, setShortcutsOpen } = useUi();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen(!useUi.getState().paletteOpen);
				return;
			}
			if (isTyping(e)) return;
			if (e.key === "/") {
				e.preventDefault();
				setPaletteOpen(true);
			}
			if (e.key === "?") {
				e.preventDefault();
				setShortcutsOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setPaletteOpen, setShortcutsOpen]);
}
function ShortcutsDialog() {
	const { shortcutsOpen, setShortcutsOpen } = useUi();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open: shortcutsOpen,
		onOpenChange: setShortcutsOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
			className: "max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, { children: "Keyboard shortcuts" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y",
				children: SHORTCUTS.map(([keys, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2.5 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex gap-1",
						children: keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: k }, k))
					})]
				}, label))
			})]
		})
	});
}
function DevRoleSwitcher() {
	const { user, previewRole, setPreviewRole } = useAuth();
	return null;
}
function MobileTabBar({ onMore }) {
	const { t } = useTranslation();
	const tabs = [
		{
			to: "/conversations",
			icon: MessagesSquare,
			label: t("nav.inbox")
		},
		{
			to: "/contacts",
			icon: Users,
			label: t("nav.contacts")
		},
		{
			to: "/leads",
			icon: Target,
			label: t("nav.leads")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Quick",
		className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
		children: [tabs.map((tb) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: tb.to,
			className: "flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground",
			activeProps: { className: "text-primary" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tb.icon, {
				className: "size-5",
				"aria-hidden": true
			}), tb.label]
		}, tb.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: onMore,
			className: "flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
				className: "size-5",
				"aria-hidden": true
			}), t("nav.more")]
		})]
	});
}
function AppShell() {
	useGlobalShortcuts();
	const { setPaletteOpen } = useUi();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					id: "main",
					className: "mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileTabBar, { onMore: () => setPaletteOpen(true) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutsDialog, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevRoleSwitcher, {})
		]
	});
}
/** Client-side guard: waits for persisted auth, then redirects to /login if signed out. */
function useAuthGuard() {
	const navigate = useNavigate();
	const user = useAuth((s) => s.user);
	const hydrated = useAuthHydrated();
	(0, import_react.useEffect)(() => {
		if (hydrated && !user) navigate({
			to: "/login",
			replace: true
		});
	}, [
		hydrated,
		user,
		navigate
	]);
	return { ready: hydrated && !!user };
}
function useAuthHydrated() {
	const [h, setH] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useAuth.persist.rehydrate();
		setH(true);
	}, []);
	return h;
}
function AuthenticatedLayout() {
	const { ready } = useAuthGuard();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden w-[248px] border-r bg-sidebar p-3 md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 p-8 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-64" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" })]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { AuthenticatedLayout as component };
