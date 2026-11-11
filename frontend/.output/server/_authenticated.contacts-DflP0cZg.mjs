import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { C as Tag, G as Plus, Ht as FileText, R as Search, Rt as Funnel, Wt as Eye, Yt as Download, c as Users, cn as CircleAlert, f as UserPlus, gt as Mail, ht as MapPin, mn as Check, n as X, ot as MessageSquare, p as Upload, pn as ChevronDown, q as Phone, qt as Ellipsis } from "./_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { a as format } from "./_libs/date-fns.mjs";
import { c as PresenceAvatar, h as timeAgo, m as formatNumber, n as EmptyState, o as ListSkeleton, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as api } from "./_ssr/api-YYcBxaWJ.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, d as DropdownMenuLabel, f as DropdownMenuSeparator, i as DialogFooter, l as DropdownMenuContent, n as DialogContent, o as DialogTitle, p as DropdownMenuTrigger, r as DialogDescription, t as Dialog, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { i as useQueryClient, n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Label, t as Input } from "./_ssr/label-vKCGTnBa.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./_ssr/table-DAqBIpbq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-482UPSLb.mjs";
import { t as Checkbox } from "./_ssr/checkbox-DGGUYei4.mjs";
import { t as Drawer } from "./_libs/vaul.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.contacts-DflP0cZg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Drawer$1 = ({ shouldScaleBackground = true, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
	shouldScaleBackground,
	...props
});
Drawer$1.displayName = "Drawer";
Drawer.Trigger;
var DrawerPortal = Drawer.Portal;
Drawer.Close;
var DrawerOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80", className),
	...props
}));
DrawerOverlay.displayName = Drawer.Overlay.displayName;
var DrawerContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
	ref,
	className: cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }), children]
})] }));
DrawerContent.displayName = "DrawerContent";
var DrawerHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("grid gap-1.5 p-4 text-center sm:text-left", className),
	...props
});
DrawerHeader.displayName = "DrawerHeader";
var DrawerFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("mt-auto flex flex-col gap-2 p-4", className),
	...props
});
DrawerFooter.displayName = "DrawerFooter";
var DrawerTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DrawerTitle.displayName = Drawer.Title.displayName;
var DrawerDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DrawerDescription.displayName = Drawer.Description.displayName;
var DEFAULT_COLUMNS = [
	{
		key: "name",
		label: "Name",
		visible: true
	},
	{
		key: "phone",
		label: "Phone",
		visible: true
	},
	{
		key: "email",
		label: "Email",
		visible: true
	},
	{
		key: "city",
		label: "City",
		visible: true
	},
	{
		key: "tags",
		label: "Tags",
		visible: true
	},
	{
		key: "optedIn",
		label: "Opt-in",
		visible: true
	},
	{
		key: "lifetimeValue",
		label: "Lifetime Value",
		visible: false
	},
	{
		key: "lastSeen",
		label: "Last Seen",
		visible: true
	},
	{
		key: "createdAt",
		label: "Created",
		visible: false
	}
];
var SAVED_VIEWS = [
	{
		id: "all",
		name: "All contacts"
	},
	{
		id: "opted-in",
		name: "Opted in"
	},
	{
		id: "vip",
		name: "VIP customers"
	},
	{
		id: "cold",
		name: "Cold leads"
	}
];
function Contacts() {
	const { t } = useTranslation();
	useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [columns, setColumns] = (0, import_react.useState)(DEFAULT_COLUMNS);
	const [selectedView, setSelectedView] = (0, import_react.useState)("all");
	const [columnChooserOpen, setColumnChooserOpen] = (0, import_react.useState)(false);
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [selectedContact, setSelectedContact] = (0, import_react.useState)(null);
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const q = useQuery({
		queryKey: ["contacts", { search }],
		queryFn: () => api.contacts.list({
			search,
			pageSize: 50
		})
	});
	const toggleColumn = (key) => {
		setColumns((cols) => cols.map((c) => c.key === key ? {
			...c,
			visible: !c.visible
		} : c));
	};
	const toggleSelectAll = () => {
		if (selectedIds.size === q.data?.items.length) setSelectedIds(/* @__PURE__ */ new Set());
		else setSelectedIds(new Set(q.data?.items.map((c) => c.id) ?? []));
	};
	const toggleSelect = (id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const openDrawer = (contact) => {
		setSelectedContact(contact);
		setDrawerOpen(true);
	};
	const exportSelected = () => {
		toast.success(`Exporting ${selectedIds.size} contacts to CSV`);
		setSelectedIds(/* @__PURE__ */ new Set());
	};
	const assignOwner = () => {
		toast.success(`Assigned ${selectedIds.size} contacts to owner`);
		setSelectedIds(/* @__PURE__ */ new Set());
	};
	const addToGroup = () => {
		toast.success(`Added ${selectedIds.size} contacts to group`);
		setSelectedIds(/* @__PURE__ */ new Set());
	};
	const bulkTag = () => {
		toast.success(`Tagged ${selectedIds.size} contacts`);
		setSelectedIds(/* @__PURE__ */ new Set());
	};
	const visibleColumns = columns.filter((c) => c.visible);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Contacts",
				description: "Everyone who has messaged your business.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => setImportOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), "Import CSV"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), "Add contact"] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 max-w-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search contacts...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedView,
							onValueChange: setSelectedView,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[180px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SAVED_VIEWS.map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: view.id,
								children: view.name
							}, view.id)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [selectedIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							children: [selectedIds.size, " selected"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								children: ["Bulk actions", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "ml-2 size-4" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: bulkTag,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "mr-2 size-4" }), "Add tag"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: addToGroup,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 size-4" }), "Add to group"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: assignOwner,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-2 size-4" }), "Assign owner"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: exportSelected,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Export CSV"]
								})
							]
						})] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
							open: columnChooserOpen,
							onOpenChange: setColumnChooserOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-56",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Columns" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => toggleColumn(col.key),
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: col.label }), col.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })]
									}, col.key))
								]
							})]
						})]
					})]
				}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 8 }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : q.data.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Users,
					title: "No contacts yet",
					description: "Import contacts from CSV or add them manually.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setImportOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), "Import CSV"]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "w-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: selectedIds.size === q.data.items.length && q.data.items.length > 0,
								onCheckedChange: toggleSelectAll
							})
						}),
						visibleColumns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: col.label }, col.key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-12" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: q.data.items.map((contact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: cn("cursor-pointer hover:bg-muted/50", selectedIds.has(contact.id) && "bg-muted"),
						onClick: () => openDrawer(contact),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selectedIds.has(contact.id),
									onCheckedChange: () => toggleSelect(contact.id)
								})
							}),
							columns.find((c) => c.key === "name")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, { name: contact.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: contact.name
								})]
							}) }),
							columns.find((c) => c.key === "phone")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "tabular",
								children: contact.phone
							}),
							columns.find((c) => c.key === "email")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: contact.email || "-" }),
							columns.find((c) => c.key === "city")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: contact.city }),
							columns.find((c) => c.key === "tags")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1",
								children: [contact.tags.slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-xs",
									children: tag
								}, tag)), contact.tags.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "text-xs",
									children: ["+", contact.tags.length - 2]
								})]
							}) }),
							columns.find((c) => c.key === "optedIn")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: contact.optedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-success text-success-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Opted in"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3" }), "Opted out"]
							}) }),
							columns.find((c) => c.key === "lifetimeValue")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "tabular",
								children: ["₹", formatNumber(contact.lifetimeValue)]
							}),
							columns.find((c) => c.key === "lastSeen")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-muted-foreground",
								children: timeAgo(contact.lastSeenAt)
							}),
							columns.find((c) => c.key === "createdAt")?.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-muted-foreground",
								children: format(new Date(contact.createdAt), "MMM d, yyyy")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => openDrawer(contact),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-2 size-4" }), "View details"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 size-4" }), "Send message"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "mr-2 size-4" }), "Add tag"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 size-4" }), "Add to group"] })
									]
								})] })
							})
						]
					}, contact.id)) })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDialog, {
				open: importOpen,
				onOpenChange: setImportOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactDrawer, {
				contact: selectedContact,
				open: drawerOpen,
				onOpenChange: setDrawerOpen
			})
		]
	});
}
function ImportDialog({ open, onOpenChange }) {
	const [step, setStep] = (0, import_react.useState)("upload");
	const [file, setFile] = (0, import_react.useState)(null);
	const handleUpload = (e) => {
		const selected = e.target.files?.[0];
		if (selected) {
			setFile(selected);
			setStep("map");
		}
	};
	const handleClose = () => {
		setStep("upload");
		setFile(null);
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Import contacts from CSV" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					step === "upload" && "Upload your CSV file to get started.",
					step === "map" && "Map your CSV columns to contact fields.",
					step === "validate" && "Review and fix any validation errors.",
					step === "confirm" && "Confirm the import details."
				] })] }),
				step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-12 text-muted-foreground mb-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mb-2",
								children: "Drag and drop your CSV file here, or click to browse"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "file",
								accept: ".csv",
								onChange: handleUpload,
								className: "max-w-xs"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium mb-1",
							children: "CSV format requirements:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "list-disc list-inside space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "First row should contain column headers" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Required columns: name, phone" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Optional columns: email, city, tags" })
							]
						})]
					})]
				}),
				step === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "CSV Preview" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border p-4 text-sm font-mono",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground mb-2",
									children: "name,phone,email,city"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "John Doe,+91 98765 43210,john@example.com,Mumbai" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Jane Smith,+91 87654 32109,,Delhi" })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Column Mapping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-24 text-sm",
									children: "name →"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									defaultValue: "name",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "name",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "phone",
											children: "Phone"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "email",
											children: "Email"
										})
									] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-24 text-sm",
									children: "phone →"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									defaultValue: "phone",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "name",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "phone",
											children: "Phone"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "email",
											children: "Email"
										})
									] })]
								})]
							})]
						})]
					})]
				}),
				step === "validate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2 rows have validation errors" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Row" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Error" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Action" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: "3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: "Invalid phone format" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								children: "Fix"
							}) })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: "7" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: "Missing required field: name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								children: "Fix"
							}) })
						] })] })] })
					})]
				}),
				step === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold tabular",
									children: "48"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Total rows"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold tabular text-success",
									children: "46"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Valid"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold tabular text-destructive",
									children: "2"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Errors"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "46 contacts will be imported. 2 rows with errors will be skipped."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: handleClose,
						children: "Cancel"
					}),
					step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !file,
						onClick: () => setStep("map"),
						children: "Next"
					}),
					step === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setStep("upload"),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setStep("validate"),
						children: "Next"
					})] }),
					step === "validate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setStep("map"),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setStep("confirm"),
						children: "Next"
					})] }),
					step === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setStep("validate"),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							toast.success("Contacts imported successfully");
							handleClose();
						},
						children: "Import contacts"
					})] })
				] })
			]
		})
	});
}
function ContactDrawer({ contact, open, onOpenChange }) {
	if (!contact) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, {
			className: "max-w-md mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
					name: contact.name,
					size: "lg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: contact.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: contact.phone
					})]
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6 px-4 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Contact Information"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: contact.phone })]
								}),
								contact.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: contact.email })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: contact.city })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Opt-in Status"
						}), contact.optedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "bg-success text-success-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Opted in"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3" }), "Opted out"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Tags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: contact.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: tag
							}, tag))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Custom Fields"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: contact.customFields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: field.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: field.value })]
							}, field.label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: contact.notes || "No notes"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "Activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Lifetime value"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium tabular",
										children: ["₹", formatNumber(contact.lifetimeValue)]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Last seen"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeAgo(contact.lastSeenAt) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Created"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(contact.createdAt), "MMM d, yyyy") })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 size-4" }), "Send message"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-2 size-4" }), "Edit"]
						})]
					})
				]
			})]
		})
	});
}
var SplitComponent = Contacts;
//#endregion
export { SplitComponent as component };
