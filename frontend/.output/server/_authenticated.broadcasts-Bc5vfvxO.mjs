import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { G as Plus, L as Send, R as Search, Rt as Funnel, Y as Pause, _n as Calendar, an as CircleX, c as Users, dn as ChevronRight, fn as ChevronLeft, hn as ChartColumn, kt as IndianRupee, pt as Megaphone, qt as Ellipsis, rn as Clock, sn as CircleCheckBig, y as Trash2 } from "./_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { a as format } from "./_libs/date-fns.mjs";
import { f as StatCard, m as formatNumber, n as EmptyState, o as ListSkeleton, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as api } from "./_ssr/api-YYcBxaWJ.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, f as DropdownMenuSeparator, i as DialogFooter, l as DropdownMenuContent, n as DialogContent, o as DialogTitle, p as DropdownMenuTrigger, r as DialogDescription, t as Dialog, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Label, t as Input } from "./_ssr/label-vKCGTnBa.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./_ssr/table-DAqBIpbq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-482UPSLb.mjs";
import { t as Checkbox } from "./_ssr/checkbox-DGGUYei4.mjs";
import { t as Progress } from "./_ssr/progress-CYK5gA4w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.broadcasts-Bc5vfvxO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAILY_LIMIT = 1e3;
var COST_PER_MESSAGE = .5;
var MOCK_GROUPS = [
	{
		id: "g1",
		name: "VIP Customers",
		memberCount: 12
	},
	{
		id: "g2",
		name: "Mumbai Region",
		memberCount: 18
	},
	{
		id: "g3",
		name: "Diwali Campaign List",
		memberCount: 45
	}
];
var SAMPLE_CONTACTS = [
	{
		id: "c1",
		name: "Aarav Patel",
		phone: "+91 98765 43210",
		email: "aarav@example.com",
		city: "Mumbai",
		tags: ["VIP"],
		optedIn: true,
		lifetimeValue: 15e3,
		lastSeenAt: (/* @__PURE__ */ new Date()).toISOString(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		customFields: [],
		notes: ""
	},
	{
		id: "c2",
		name: "Diya Sharma",
		phone: "+91 87654 32109",
		email: "diya@example.com",
		city: "Delhi",
		tags: ["Repeat buyer"],
		optedIn: true,
		lifetimeValue: 8500,
		lastSeenAt: (/* @__PURE__ */ new Date()).toISOString(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		customFields: [],
		notes: ""
	},
	{
		id: "c3",
		name: "Arjun Singh",
		phone: "+91 76543 21098",
		email: "arjun@example.com",
		city: "Bengaluru",
		tags: ["New"],
		optedIn: false,
		lifetimeValue: 2500,
		lastSeenAt: (/* @__PURE__ */ new Date()).toISOString(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		customFields: [],
		notes: ""
	}
];
function Broadcasts() {
	const { t } = useTranslation();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [wizardOpen, setWizardOpen] = (0, import_react.useState)(false);
	const [resultsOpen, setResultsOpen] = (0, import_react.useState)(false);
	const [selectedBroadcast, setSelectedBroadcast] = (0, import_react.useState)(null);
	const [step, setStep] = (0, import_react.useState)("template");
	const [form, setForm] = (0, import_react.useState)({
		templateId: "",
		audienceType: "group",
		audienceId: "",
		excludeOptedOut: true,
		variables: {},
		scheduleType: "now"
	});
	const q = useQuery({
		queryKey: ["broadcasts"],
		queryFn: () => api.broadcasts.list()
	});
	const templatesQ = useQuery({
		queryKey: ["templates"],
		queryFn: () => api.templates.list()
	});
	const filteredBroadcasts = q.data?.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())) ?? [];
	templatesQ.data?.find((t) => t.id === form.templateId);
	const audienceSize = MOCK_GROUPS.find((g) => g.id === form.audienceId)?.memberCount ?? 0;
	const optedOutCount = SAMPLE_CONTACTS.filter((c) => !c.optedIn).length;
	(form.excludeOptedOut ? audienceSize - optedOutCount : audienceSize) * COST_PER_MESSAGE;
	const resetWizard = () => {
		setStep("template");
		setForm({
			templateId: "",
			audienceType: "group",
			audienceId: "",
			excludeOptedOut: true,
			variables: {},
			scheduleType: "now"
		});
	};
	const handleClose = () => {
		resetWizard();
		setWizardOpen(false);
	};
	const handleSend = () => {
		toast.success("Broadcast scheduled successfully");
		handleClose();
		qc.invalidateQueries({ queryKey: ["broadcasts"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Broadcasts",
				description: "Send messages to many contacts at once using approved templates.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setWizardOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), "Create broadcast"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 p-4 rounded-lg bg-muted/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: "Daily messaging limit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: [
									"0 / ",
									DAILY_LIMIT,
									" messages"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: 0,
							className: "h-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search broadcasts...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9"
						})]
					}),
					q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 4 }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : filteredBroadcasts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: Megaphone,
						title: "No broadcasts yet",
						description: "Create a broadcast to send messages to multiple contacts at once.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setWizardOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), "Create broadcast"]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Audience" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Delivered" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Read" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-12" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredBroadcasts.map((broadcast) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: broadcast.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: broadcast.audience }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: broadcast.status === "sent" ? "default" : broadcast.status === "scheduled" ? "outline" : "secondary",
								children: [
									broadcast.status === "sent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "mr-1 size-3" }),
									broadcast.status === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 size-3" }),
									broadcast.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "mr-1 size-3" }),
									broadcast.status
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "tabular",
								children: broadcast.sent
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "tabular",
								children: broadcast.delivered
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "tabular",
								children: broadcast.read
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									broadcast.status === "sent" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => {
											setSelectedBroadcast({
												id: broadcast.id,
												name: broadcast.name,
												sent: broadcast.sent,
												delivered: broadcast.delivered,
												read: broadcast.read,
												replied: Math.floor(broadcast.read * .4),
												failed: broadcast.sent - broadcast.delivered,
												cost: broadcast.sent * COST_PER_MESSAGE,
												perRecipient: []
											});
											setResultsOpen(true);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mr-2 size-4" }), "View results"]
									}),
									broadcast.status === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-2 size-4" }), "Pause"] }),
									broadcast.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 size-4" }), "Send now"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
									})
								]
							})] }) })
						] }, broadcast.id)) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BroadcastWizard, {
				open: wizardOpen,
				onOpenChange: handleClose,
				step,
				setStep,
				form,
				setForm,
				templates: templatesQ.data ?? [],
				groups: MOCK_GROUPS,
				sampleContacts: SAMPLE_CONTACTS,
				onSend: handleSend
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BroadcastResultsDialog, {
				result: selectedBroadcast,
				open: resultsOpen,
				onOpenChange: setResultsOpen
			})
		]
	});
}
function BroadcastWizard({ open, onOpenChange, step, setStep, form, setForm, templates, groups, sampleContacts, onSend }) {
	const STEPS = [
		{
			id: "template",
			label: "Template"
		},
		{
			id: "audience",
			label: "Audience"
		},
		{
			id: "personalize",
			label: "Personalize"
		},
		{
			id: "schedule",
			label: "Schedule"
		},
		{
			id: "review",
			label: "Review"
		}
	];
	const currentStepIndex = STEPS.findIndex((s) => s.id === step);
	const selectedTemplate = templates.find((t) => t.id === form.templateId);
	const audienceSize = groups.find((g) => g.id === form.audienceId)?.memberCount ?? 0;
	const optedOutCount = sampleContacts.filter((c) => !c.optedIn).length;
	const finalAudienceSize = form.excludeOptedOut ? audienceSize - optedOutCount : audienceSize;
	const estimatedCost = finalAudienceSize * COST_PER_MESSAGE;
	const nextStep = () => {
		if (currentStepIndex < STEPS.length - 1) setStep(STEPS[currentStepIndex + 1].id);
	};
	const prevStep = () => {
		if (currentStepIndex > 0) setStep(STEPS[currentStepIndex - 1].id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create broadcast" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Send a message to multiple contacts using an approved template." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between mb-6",
					children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("flex size-8 items-center justify-center rounded-full text-sm font-medium", i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-sm",
								children: s.label
							}),
							i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 mx-4 h-px bg-border" })
						]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4",
					children: [
						step === "template" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select a template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: templates.filter((t) => t.status === "approved").map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors", form.templateId === template.id ? "border-primary bg-primary/5" : "hover:bg-muted"),
									onClick: () => setForm({
										...form,
										templateId: template.id
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: template.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground line-clamp-1",
											children: template.body
										})]
									}), form.templateId === template.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
								}, template.id))
							})]
						}),
						step === "audience" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Audience type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: form.audienceType === "group" ? "default" : "outline",
											onClick: () => setForm({
												...form,
												audienceType: "group"
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 mr-2" }), "Group"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: form.audienceType === "filter" ? "default" : "outline",
											onClick: () => setForm({
												...form,
												audienceType: "filter"
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4 mr-2" }), "Filter"]
										})]
									})]
								}),
								form.audienceType === "group" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select group" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.audienceId,
										onValueChange: (v) => setForm({
											...form,
											audienceId: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a group" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: group.id,
											children: [
												group.name,
												" (",
												group.memberCount,
												" contacts)"
											]
										}, group.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										id: "excludeOptedOut",
										checked: form.excludeOptedOut,
										onCheckedChange: (v) => setForm({
											...form,
											excludeOptedOut: v
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "excludeOptedOut",
										className: "flex-1",
										children: "Exclude opted-out contacts"
									})]
								}),
								form.excludeOptedOut && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border p-4 bg-muted/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground mb-2",
										children: [optedOutCount, " contacts will be excluded"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "space-y-1",
										children: sampleContacts.filter((c) => !c.optedIn).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4 text-destructive" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.name }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: c.phone
												})
											]
										}, c.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: ["Total recipients:", " "]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium tabular",
										children: finalAudienceSize
									})]
								})
							]
						}),
						step === "personalize" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Personalize variables" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Preview how the message will look for each contact"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4",
									children: sampleContacts.slice(0, 3).map((contact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 mb-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium",
												children: contact.name.split(" ").map((n) => n[0]).join("")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-sm",
												children: contact.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: contact.phone
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-md bg-muted p-3 text-sm",
											children: selectedTemplate?.body.replace(/\{\{1\}\}/g, contact.name).replace(/\{\{2\}\}/g, "12345") || "Preview..."
										})]
									}, contact.id))
								})
							]
						}),
						step === "schedule" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "When to send" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: form.scheduleType === "now" ? "default" : "outline",
										onClick: () => setForm({
											...form,
											scheduleType: "now"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 mr-2" }), "Send now"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: form.scheduleType === "later" ? "default" : "outline",
										onClick: () => setForm({
											...form,
											scheduleType: "later"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 mr-2" }), "Schedule for later"]
									})]
								}),
								form.scheduleType === "later" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Scheduled time" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "datetime-local",
											onChange: (e) => setForm({
												...form,
												scheduledAt: new Date(e.target.value)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Timezone: Asia/Kolkata (IST)"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border p-4 bg-muted/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: "Estimated cost"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-lg font-bold tabular text-primary",
											children: ["₹", formatNumber(estimatedCost)]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											finalAudienceSize,
											" messages × ₹",
											COST_PER_MESSAGE,
											"/message"
										]
									})]
								})
							]
						}),
						step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Review and confirm" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Template"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: selectedTemplate?.name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Audience"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: groups.find((g) => g.id === form.audienceId)?.name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Recipients"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium tabular",
												children: finalAudienceSize
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Schedule"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: form.scheduleType === "now" ? "Immediately" : format(form.scheduledAt, "PPP p")
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Estimated cost"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-medium tabular text-primary",
												children: ["₹", formatNumber(estimatedCost)]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium mb-2",
										children: "Message preview"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-md bg-muted p-3 text-sm",
										children: selectedTemplate?.body || "No message"
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: prevStep,
					disabled: currentStepIndex === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 mr-2" }), "Back"]
				}), step === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onSend,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 mr-2" }), form.scheduleType === "now" ? "Send broadcast" : "Schedule broadcast"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: nextStep,
					disabled: !form.templateId || step === "audience" && !form.audienceId,
					children: ["Next", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 ml-2" })]
				})] })
			]
		})
	});
}
function BroadcastResultsDialog({ result, open, onOpenChange }) {
	if (!result) return null;
	const funnelData = [
		{
			label: "Sent",
			value: result.sent,
			color: "bg-primary"
		},
		{
			label: "Delivered",
			value: result.delivered,
			color: "bg-success"
		},
		{
			label: "Read",
			value: result.read,
			color: "bg-info"
		},
		{
			label: "Replied",
			value: result.replied,
			color: "bg-warning"
		},
		{
			label: "Failed",
			value: result.failed,
			color: "bg-destructive"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [result.name, " - Results"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Delivery and engagement metrics for this broadcast." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: "Delivery funnel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4 sm:grid-cols-5",
								children: funnelData.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto size-16 rounded-full flex items-center justify-center mb-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("size-full rounded-full flex items-center justify-center text-sm font-bold tabular", item.color),
											children: item.value
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: item.label
									})]
								}, item.label))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Total sent",
									value: formatNumber(result.sent),
									icon: Send
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Delivery rate",
									value: `${(result.delivered / result.sent * 100).toFixed(1)}%`,
									icon: CircleCheckBig
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Total cost",
									value: `₹${formatNumber(result.cost)}`,
									icon: IndianRupee
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: "Per-recipient log"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contact" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Phone" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Delivered at" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Read at" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.perRecipient.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center text-muted-foreground py-8",
									children: "No recipient data available"
								}) }) : result.perRecipient.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-medium",
										children: log.contactName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "tabular",
										children: log.phone
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: log.status === "failed" ? "destructive" : log.status === "replied" ? "default" : "outline",
										children: log.status
									}), log.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-destructive mt-1",
										children: log.error
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-muted-foreground",
										children: log.deliveredAt ? format(new Date(log.deliveredAt), "HH:mm") : "-"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-muted-foreground",
										children: log.readAt ? format(new Date(log.readAt), "HH:mm") : "-"
									})
								] }, log.contactId)) })] })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Close"
				}) })
			]
		})
	});
}
var SplitComponent = Broadcasts;
//#endregion
export { SplitComponent as component };
