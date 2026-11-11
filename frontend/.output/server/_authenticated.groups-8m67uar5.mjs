import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { D as SquarePen, G as Plus, K as Play, R as Search, Y as Pause, c as Users, mn as Check, n as X, pn as ChevronDown, qt as Ellipsis, t as Zap, y as Trash2, zt as Folder } from "./_libs/lucide-react.mjs";
import { t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { n as EmptyState, o as ListSkeleton, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, f as DropdownMenuSeparator, i as DialogFooter, l as DropdownMenuContent, n as DialogContent, o as DialogTitle, p as DropdownMenuTrigger, r as DialogDescription, t as Dialog, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Label, t as Input } from "./_ssr/label-vKCGTnBa.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./_ssr/table-DAqBIpbq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-482UPSLb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.groups-8m67uar5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	{
		value: "city",
		label: "City"
	},
	{
		value: "tags",
		label: "Tags"
	},
	{
		value: "optedIn",
		label: "Opt-in status"
	},
	{
		value: "lifetimeValue",
		label: "Lifetime value"
	},
	{
		value: "lastSeen",
		label: "Last seen"
	}
];
var OPERATORS = [
	{
		value: "equals",
		label: "Equals"
	},
	{
		value: "not_equals",
		label: "Does not equal"
	},
	{
		value: "contains",
		label: "Contains"
	},
	{
		value: "not_contains",
		label: "Does not contain"
	},
	{
		value: "greater_than",
		label: "Greater than"
	},
	{
		value: "less_than",
		label: "Less than"
	},
	{
		value: "is_empty",
		label: "Is empty"
	},
	{
		value: "is_not_empty",
		label: "Is not empty"
	}
];
var MOCK_GROUPS = [
	{
		id: "g1",
		name: "VIP Customers",
		type: "dynamic",
		memberCount: 12,
		rules: [{
			id: "r1",
			field: "lifetimeValue",
			operator: "greater_than",
			value: "10000",
			logic: "AND"
		}, {
			id: "r2",
			field: "tags",
			operator: "contains",
			value: "VIP",
			logic: "AND"
		}],
		active: true,
		createdAt: "2026-10-01T00:00:00Z"
	},
	{
		id: "g2",
		name: "Mumbai Region",
		type: "dynamic",
		memberCount: 18,
		rules: [{
			id: "r3",
			field: "city",
			operator: "equals",
			value: "Mumbai",
			logic: "AND"
		}],
		active: true,
		createdAt: "2026-10-05T00:00:00Z"
	},
	{
		id: "g3",
		name: "Diwali Campaign List",
		type: "static",
		memberCount: 45,
		createdAt: "2026-10-15T00:00:00Z"
	},
	{
		id: "g4",
		name: "Inactive for 30 days",
		type: "dynamic",
		memberCount: 8,
		rules: [{
			id: "r4",
			field: "lastSeen",
			operator: "less_than",
			value: "30",
			logic: "AND"
		}],
		active: false,
		createdAt: "2026-10-20T00:00:00Z"
	}
];
function Groups() {
	const { t } = useTranslation();
	const [search, setSearch] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("static");
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [createType, setCreateType] = (0, import_react.useState)("static");
	const q = useQuery({
		queryKey: ["groups"],
		queryFn: async () => MOCK_GROUPS
	});
	const filteredGroups = q.data?.filter((g) => {
		const matchesTab = g.type === activeTab;
		const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
		return matchesTab && matchesSearch;
	}) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Groups",
				description: "Organize contacts into static lists or dynamic segments.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }),
						"Create group",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "ml-2 size-4" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => {
							setCreateType("static");
							setCreateOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "mr-2 size-4" }), "Static group"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => {
							setCreateType("dynamic");
							setCreateOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-2 size-4" }), "Dynamic segment"]
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: activeTab === "static" ? "default" : "ghost",
							onClick: () => setActiveTab("static"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-4 mr-2" }),
								"Static",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "ml-2",
									children: MOCK_GROUPS.filter((g) => g.type === "static").length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: activeTab === "dynamic" ? "default" : "ghost",
							onClick: () => setActiveTab("dynamic"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 mr-2" }),
								"Dynamic",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "ml-2",
									children: MOCK_GROUPS.filter((g) => g.type === "dynamic").length
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search groups...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9"
						})]
					})]
				}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 4 }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : filteredGroups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: activeTab === "static" ? Folder : Zap,
					title: `No ${activeTab} groups yet`,
					description: `Create your first ${activeTab} group to organize your contacts.`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setCreateType(activeTab);
							setCreateOpen(true);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }),
							"Create ",
							activeTab,
							" group"
						]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Members" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Created" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-12" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: group.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: group.type === "dynamic" ? "default" : "secondary",
							children: group.type === "dynamic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mr-1 size-3" }), "Dynamic"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "mr-1 size-3" }), "Static"] })
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "tabular",
							children: group.memberCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: group.type === "dynamic" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: group.active ? "default" : "outline",
							children: group.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Active"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-1 size-3" }), "Paused"] })
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-muted-foreground",
							children: new Date(group.createdAt).toLocaleDateString()
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 size-4" }), "View members"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "mr-2 size-4" }), "Edit"] }),
								group.type === "dynamic" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, { children: group.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-2 size-4" }), "Pause"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-2 size-4" }), "Activate"] }) })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									className: "text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
								})
							]
						})] }) })
					] }, group.id)) })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateGroupDialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				type: createType
			})
		]
	});
}
function CreateGroupDialog({ open, onOpenChange, type }) {
	const [name, setName] = (0, import_react.useState)("");
	const [rules, setRules] = (0, import_react.useState)([{
		id: "r1",
		field: "city",
		operator: "equals",
		value: "",
		logic: "AND"
	}]);
	const [matchCount, setMatchCount] = (0, import_react.useState)(0);
	const addRule = () => {
		setRules([...rules, {
			id: `r${rules.length + 1}`,
			field: "city",
			operator: "equals",
			value: "",
			logic: "AND"
		}]);
	};
	const removeRule = (id) => {
		setRules(rules.filter((r) => r.id !== id));
	};
	const updateRule = (id, updates) => {
		setRules(rules.map((r) => r.id === id ? {
			...r,
			...updates
		} : r));
	};
	const updateMatchCount = () => {
		const simulatedCount = Math.floor(Math.random() * 40) + 5;
		setMatchCount(simulatedCount);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Create ", type === "dynamic" ? "dynamic segment" : "static group"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: type === "dynamic" ? "Define rules to automatically include contacts that match your criteria." : "Manually add contacts to this group." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "name",
								children: "Group name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "name",
								placeholder: "e.g., VIP Customers",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						type === "dynamic" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: "Rules"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: [
											"Matches ",
											matchCount,
											" contacts"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: rules.map((rule, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2 rounded-lg border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: rule.logic,
														onValueChange: (v) => updateRule(rule.id, { logic: v }),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "w-20",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "AND",
															children: "AND"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "OR",
															children: "OR"
														})] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: rule.field,
														onValueChange: (v) => updateRule(rule.id, { field: v }),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "flex-1",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: f.value,
															children: f.label
														}, f.value)) })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: rule.operator,
														onValueChange: (v) => updateRule(rule.id, { operator: v }),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "flex-1",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: OPERATORS.map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: op.value,
															children: op.label
														}, op.value)) })]
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Value",
												value: rule.value,
												onChange: (e) => {
													updateRule(rule.id, { value: e.target.value });
													updateMatchCount();
												}
											})]
										}), rules.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => removeRule(rule.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})]
									}, rule.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: addRule,
									className: "w-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Add rule"]
								})
							]
						}),
						type === "static" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Members" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border p-8 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-8 text-muted-foreground mx-auto mb-2" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground mb-4",
										children: "Add contacts to this group"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Add contacts"]
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						toast.success(`${type === "dynamic" ? "Segment" : "Group"} created successfully`);
						onOpenChange(false);
					},
					disabled: !name || type === "dynamic" && rules.some((r) => !r.value),
					children: ["Create ", type === "dynamic" ? "segment" : "group"]
				})] })
			]
		})
	});
}
var SplitComponent = Groups;
//#endregion
export { SplitComponent as component };
