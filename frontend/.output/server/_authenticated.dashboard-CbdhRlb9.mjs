import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { L as Send, Mn as Activity, _ as TrendingUp, c as Users, f as UserPlus, g as TriangleAlert, kn as ArrowRight, lt as MessageCircle, mn as Check, pt as Megaphone, q as Phone, rn as Clock, st as MessagesSquare } from "./_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { t as useAuth } from "./_ssr/auth-DdXLipCd.mjs";
import { b as Link, x as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { _ as usePermission, c as PresenceAvatar, f as StatCard, g as timeOfDay, h as timeAgo, l as ProgressRing, m as formatNumber, n as EmptyState, o as ListSkeleton, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as api } from "./_ssr/api-YYcBxaWJ.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.dashboard-CbdhRlb9.js
var import_jsx_runtime = require_jsx_runtime();
var ACTIVITY_ICON = {
	message: MessageCircle,
	lead: TrendingUp,
	broadcast: Megaphone,
	contact: UserPlus,
	assignment: Users
};
function greetingKey() {
	const h = (/* @__PURE__ */ new Date()).getHours();
	return h < 12 ? "dashboard.greeting_morning" : h < 17 ? "dashboard.greeting_afternoon" : "dashboard.greeting_evening";
}
function Dashboard() {
	const { t } = useTranslation();
	const user = useAuth((s) => s.user);
	const first = user?.name.split(" ")[0] ?? "there";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: t(greetingKey(), { name: first }),
				description: t("dashboard.subtitle")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupChecklist, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metrics, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignedChats, { userId: user?.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallReminders, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentActivity, {})
		]
	});
}
function SetupChecklist() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["dashboard", "onboarding"],
		queryFn: () => api.dashboard.onboarding()
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 2 })
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) });
	const steps = q.data;
	const done = steps.filter((s) => s.done).length;
	if (done === steps.length) return null;
	const markDone = (id) => {
		qc.setQueryData(["dashboard", "onboarding"], (old) => old?.map((s) => s.id === id ? {
			...s,
			done: true
		} : s));
		toast.success(`${t(`onboarding.${id}`)} — done`);
	};
	const stepRoutes = {
		connect: "/settings",
		import: "/contacts",
		template: "/templates",
		invite: "/settings",
		broadcast: "/broadcasts"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, { value: done / steps.length * 100 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "absolute inset-0 flex items-center justify-center text-sm font-semibold tabular",
					children: [
						done,
						"/",
						steps.length
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-md font-semibold",
				children: t("onboarding.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Finish these steps to get the most out of your workspace."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5",
			children: steps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: s.done,
				onClick: () => {
					if (!s.done) navigate({ to: stepRoutes[s.id] });
					else markDone(s.id);
				},
				className: cn("flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors", s.done ? "bg-success-soft text-success" : "hover:bg-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-5 shrink-0 items-center justify-center rounded-full border", s.done && "border-success bg-success text-primary-foreground"),
					children: s.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn(s.done && "line-through"),
					children: t(`onboarding.${s.id}`)
				})]
			}) }, s.id))
		})]
	});
}
function Metrics() {
	const { can: canViewAnalytics } = usePermission("analytics.view");
	const q = useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: () => api.dashboard.stats()
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) });
	const s = q.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				loading: !s,
				label: "Open chats",
				icon: MessagesSquare,
				value: s ? formatNumber(s.openConversations.value) : "",
				delta: s?.openConversations.delta,
				trend: s?.openConversations.trend
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				loading: !s,
				label: "Avg. reply time",
				icon: Clock,
				goodWhenDown: true,
				value: s ? `${s.avgResponseMins.value} min` : "",
				delta: s?.avgResponseMins.delta,
				trend: s?.avgResponseMins.trend
			}),
			canViewAnalytics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				loading: !s,
				label: "New leads",
				icon: TrendingUp,
				value: s ? formatNumber(s.newLeads.value) : "",
				delta: s?.newLeads.delta,
				trend: s?.newLeads.trend
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				loading: !s,
				label: "Messages today",
				icon: Send,
				value: s ? formatNumber(s.messagesToday.value) : "",
				delta: s?.messagesToday.delta,
				trend: s?.messagesToday.trend
			})] })
		]
	});
}
function AssignedChats({ userId }) {
	const { can: canReply } = usePermission("conversation.reply");
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: [
			"conversations",
			"assigned",
			userId
		],
		queryFn: () => api.conversations.list({
			assigneeId: userId ?? "u1",
			pageSize: 6
		})
	});
	const resolve = useMutation({
		mutationFn: (id) => api.conversations.setStatus(id, "resolved"),
		onSuccess: () => {
			toast.success("Chat marked as resolved");
			qc.invalidateQueries({ queryKey: ["conversations"] });
		},
		onError: () => toast.error("Couldn't update this chat. Try again.")
	});
	const rows = q.data?.items.filter((c) => c.status !== "resolved") ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5 lg:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-md font-semibold",
				children: "Assigned to you"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/conversations",
					children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})
			})]
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: MessagesSquare,
			title: "You're all caught up",
			description: "No open chats are assigned to you right now.",
			className: "py-8"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y",
			children: rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, { name: c.contactName }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: c.contactName
								}),
								c.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto shrink-0 text-xs text-muted-foreground",
									children: timeAgo(c.lastMessageAt)
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted-foreground",
							children: c.lastMessage
						})]
					}),
					c.unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular",
						children: c.unread
					}),
					canReply && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						disabled: resolve.isPending,
						onClick: () => resolve.mutate(c.id),
						"aria-label": `Resolve chat with ${c.contactName}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
					})
				]
			}, c.id))
		})]
	});
}
function CallReminders() {
	const { can: canViewAnalytics } = usePermission("analytics.view");
	const q = useQuery({
		queryKey: ["dashboard", "calls"],
		queryFn: () => api.dashboard.callReminders()
	});
	const today = (/* @__PURE__ */ new Date()).toDateString();
	const rows = (q.data ?? []).filter((r) => new Date(r.at).toDateString() === today).sort((a, b) => a.at.localeCompare(b.at));
	if (!canViewAnalytics) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 text-md font-semibold",
			children: "Today's calls"
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 3 }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Phone,
			title: "No calls today",
			description: "Call reminders you set will show up here.",
			className: "py-8"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: rows.map((r) => {
				const past = new Date(r.at) < /* @__PURE__ */ new Date();
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("rounded-md border p-3", past && "opacity-60 border-destructive/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: r.contactName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium tabular text-primary",
								children: timeOfDay(r.at)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: r.note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:${r.phone.replace(/\s/g, "")}`,
							className: "mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
									className: "size-3.5",
									"aria-hidden": true
								}),
								" ",
								r.phone
							]
						}),
						past && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-1 text-xs text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), "Overdue"]
						})
					]
				}, r.id);
			})
		})]
	});
}
function RecentActivity() {
	const q = useQuery({
		queryKey: ["dashboard", "activity"],
		queryFn: () => api.dashboard.activity()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 text-md font-semibold",
			children: "Recent activity"
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Activity,
			title: "No activity yet",
			description: "Messages, new leads and broadcasts will appear here.",
			className: "py-8"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "space-y-4",
			children: q.data.map((a) => {
				const Icon = ACTIVITY_ICON[a.kind];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: a.actorName
								}),
								" ",
								a.text
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: timeAgo(a.at)
						})]
					})]
				}, a.id);
			})
		})]
	});
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
