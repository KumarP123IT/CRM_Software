import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { D as SquarePen, G as Plus, Ht as FileText, L as Send, R as Search, Wt as Eye, cn as CircleAlert, en as Copy, mn as Check, n as X, ot as MessageSquare, qt as Ellipsis, rn as Clock, y as Trash2 } from "./_libs/lucide-react.mjs";
import { t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { n as EmptyState, o as ListSkeleton, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as api } from "./_ssr/api-YYcBxaWJ.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, f as DropdownMenuSeparator, i as DialogFooter, l as DropdownMenuContent, n as DialogContent, o as DialogTitle, p as DropdownMenuTrigger, r as DialogDescription, t as Dialog, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Label, t as Input } from "./_ssr/label-vKCGTnBa.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./_ssr/table-DAqBIpbq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-482UPSLb.mjs";
import { t as Textarea } from "./_ssr/textarea-DB4omhqi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.templates-ChGB_cU1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Marketing",
	"Utility",
	"Authentication"
];
var LANGUAGES = [
	"en",
	"hi-en",
	"hi",
	"ta",
	"te",
	"bn",
	"mr",
	"gu",
	"kn",
	"ml"
];
var STATUS_CONFIG = {
	draft: {
		label: "Draft",
		variant: "secondary",
		icon: FileText
	},
	pending: {
		label: "Pending",
		variant: "outline",
		icon: Clock
	},
	approved: {
		label: "Approved",
		variant: "default",
		icon: Check
	},
	rejected: {
		label: "Rejected",
		variant: "destructive",
		icon: CircleAlert
	}
};
function Templates() {
	const { t } = useTranslation();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const [selectedTemplate, setSelectedTemplate] = (0, import_react.useState)(null);
	const q = useQuery({
		queryKey: ["templates"],
		queryFn: () => api.templates.list()
	});
	const filteredTemplates = q.data?.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())) ?? [];
	const submitForApproval = useMutation({
		mutationFn: (id) => Promise.resolve(),
		onSuccess: () => {
			toast.success("Template submitted for approval");
			qc.invalidateQueries({ queryKey: ["templates"] });
		}
	});
	const deleteTemplate = useMutation({
		mutationFn: (id) => Promise.resolve(),
		onSuccess: () => {
			toast.success("Template deleted");
			qc.invalidateQueries({ queryKey: ["templates"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Templates",
				description: "WhatsApp message templates for broadcasts and automation.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setCreateOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), "Create template"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search templates...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "pl-9"
					})]
				}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 4 }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => q.refetch() }) : filteredTemplates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: FileText,
					title: "No templates yet",
					description: "Create a template to send consistent messages at scale.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setCreateOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), "Create template"]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Language" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-12" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredTemplates.map((template) => {
						const config = STATUS_CONFIG[template.status];
						const StatusIcon = config.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: template.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: template.category
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: template.language }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: config.variant,
								className: "gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "size-3" }), config.label]
							}), template.status === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-destructive mt-1",
								children: "Rejected: Incomplete header"
							})] }),
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => {
											setSelectedTemplate(template);
											setPreviewOpen(true);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-2 size-4" }), "Preview"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "mr-2 size-4" }), "Edit"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 size-4" }), "Duplicate"] }),
									template.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => submitForApproval.mutate(template.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 size-4" }), "Submit for approval"]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "text-destructive",
										onClick: () => deleteTemplate.mutate(template.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
									})
								]
							})] }) })
						] }, template.id);
					}) })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplateDialog, {
				open: createOpen,
				onOpenChange: setCreateOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplatePreviewDialog, {
				template: selectedTemplate,
				open: previewOpen,
				onOpenChange: setPreviewOpen
			})
		]
	});
}
function TemplateDialog({ open, onOpenChange }) {
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		category: "Utility",
		language: "en",
		status: "draft",
		body: "",
		buttons: []
	});
	const [headerMedia, setHeaderMedia] = (0, import_react.useState)(null);
	const addButton = () => {
		setForm({
			...form,
			buttons: [...form.buttons, {
				id: `btn${form.buttons.length + 1}`,
				text: ""
			}]
		});
	};
	const removeButton = (id) => {
		setForm({
			...form,
			buttons: form.buttons.filter((b) => b.id !== id)
		});
	};
	const updateButton = (id, text) => {
		setForm({
			...form,
			buttons: form.buttons.map((b) => b.id === id ? {
				...b,
				text
			} : b)
		});
	};
	const handleSubmit = () => {
		toast.success("Template saved as draft");
		onOpenChange(false);
	};
	const variables = form.body.match(/\{\{\d+\}\}/g) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create message template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Templates must be approved by WhatsApp before use. Use variables like ",
					"{",
					"}{",
					" 1 ",
					"}",
					"}",
					" to personalize messages."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 py-4 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "Template name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									placeholder: "e.g., order_confirmation",
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.category,
										onValueChange: (v) => setForm({
											...form,
											category: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: cat,
											children: cat
										}, cat)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Language" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.language,
										onValueChange: (v) => setForm({
											...form,
											language: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LANGUAGES.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: lang,
											children: lang.toUpperCase()
										}, lang)) })]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Header media (optional)" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "file",
											accept: "image/*",
											onChange: (e) => setHeaderMedia(e.target.files?.[0] ?? null),
											className: "flex-1"
										}), headerMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => setHeaderMedia(null),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Recommended: 1120x1120px, max 5MB"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "body",
										children: "Message body"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "body",
										placeholder: "Hi {{1}}, your order #{{2}} is confirmed...",
										value: form.body,
										onChange: (e) => setForm({
											...form,
											body: e.target.value
										}),
										rows: 6
									}),
									variables.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2 mt-2",
										children: variables.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "secondary",
											className: "gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3" }), v]
										}, i))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Buttons (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: addButton,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3 mr-1" }), "Add button"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: form.buttons.map((btn) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Button text",
											value: btn.text,
											onChange: (e) => updateButton(btn.id, e.target.value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => removeButton(btn.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})]
									}, btn.id))
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "WhatsApp preview" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppPreview, {
							headerMedia,
							body: form.body,
							buttons: form.buttons
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSubmit,
					disabled: !form.name || !form.body,
					children: "Save as draft"
				})] })
			]
		})
	});
}
function WhatsAppPreview({ headerMedia, body, buttons }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-[320px] rounded-3xl border-4 border-gray-900 bg-gray-50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-3 h-6 w-24 rounded-b-xl bg-gray-900" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				headerMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative rounded-lg overflow-hidden bg-gray-200",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: URL.createObjectURL(headerMedia),
						alt: "Header",
						className: "w-full h-32 object-cover"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-white p-3 shadow-sm",
					children: body || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-gray-400 italic",
						children: "Your message will appear here..."
					})
				}),
				buttons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1",
					children: buttons.map((btn) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "w-full rounded-lg bg-white border p-2 text-sm text-blue-600 shadow-sm",
						children: btn.text || "Button text"
					}, btn.id))
				})
			]
		})]
	});
}
function TemplatePreviewDialog({ template, open, onOpenChange }) {
	if (!template) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: template.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					template.category,
					" • ",
					template.language
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppPreview, {
						headerMedia: null,
						body: template.body,
						buttons: []
					})
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
var SplitComponent = Templates;
//#endregion
export { SplitComponent as component };
