import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime, n as AvatarFallback$1, r as AvatarImage$1, t as Avatar$1 } from "./_libs/@radix-ui/react-avatar+[...].mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { $ as Package, $t as Cpu, A as SlidersVertical, An as ArrowDown, At as Inbox, B as RotateCcw, Bt as Flame, C as Tag, Dn as ArrowUp, Dt as Key, E as Star, F as Settings, Ft as HardDrive, G as Plus, Gt as EyeOff, H as RefreshCw, Ht as FileText, I as Server, It as Hammer, Jt as Droplets, Kt as ExternalLink, Lt as Globe, M as Shield, Mt as House, N as ShieldAlert, Nt as Heart, O as Sparkles, On as ArrowUpNarrowWide, Ot as Info, P as Share2, Pt as Hash, Q as Palette, Qt as CreditCard, R as Search, Rt as Funnel, Sn as Bookmark, St as Leaf, T as Sun, Tn as Bell, Tt as Laptop, U as Receipt, Ut as FileCode, Vt as File, W as Radio, Wt as Eye, Xt as DollarSign, Yt as Download, Zt as Crop, _ as TrendingUp, _n as Calendar, _t as LogOut, a as Wifi, an as CircleX, at as Mic, b as ToggleRight, bn as Briefcase, bt as Link, c as Users, cn as CircleAlert, dn as ChevronRight, dt as Menu, en as Copy, et as OctagonAlert, f as UserPlus, ft as MemoryStick, g as TriangleAlert, gn as Camera, gt as Mail, h as Type, hn as ChartColumn, in as Circle, it as Minimize, j as Signal, jn as Archive, jt as Image, k as Smartphone, m as Unlink, mn as Check, mt as Maximize, n as X, nn as Cloud, nt as Monitor, o as Volume2, on as CircleQuestionMark, ot as MessageSquare, p as Upload, q as Phone, r as Wrench, rn as Clock, rt as Minus, s as Video, sn as CircleCheckBig, t as Zap, tn as Cog, tt as Moon, u as User, v as TrendingDown, vn as Building2, vt as Lock, w as Tablet, wn as Bluetooth, wt as Layers, x as ToggleLeft, xn as Box, y as Trash2, yn as Bug, z as RotateCw, zt as Folder } from "./_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./_ssr/button-BsqHVsio.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./_ssr/tooltip-DsMDu4XZ.mjs";
import { a as Kbd, c as PresenceAvatar, d as Skeleton, f as StatCard, l as ProgressRing, n as EmptyState, r as ErrorState, s as PageHeader, t as Card } from "./_ssr/shared-DuLMoHHa.mjs";
import { t as Badge } from "./_ssr/badge-C8bCJjig.mjs";
import { a as DialogHeader, c as DropdownMenu, d as DropdownMenuLabel, f as DropdownMenuSeparator, i as DialogFooter, l as DropdownMenuContent, n as DialogContent, o as DialogTitle, p as DropdownMenuTrigger, r as DialogDescription, s as DialogTrigger, t as Dialog, u as DropdownMenuItem } from "./_ssr/dialog-Z7AmRLEr.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Label, t as Input } from "./_ssr/label-vKCGTnBa.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-482UPSLb.mjs";
import { t as Checkbox } from "./_ssr/checkbox-DGGUYei4.mjs";
import { t as Progress } from "./_ssr/progress-CYK5gA4w.mjs";
import { n as useTheme } from "./_ssr/theme-DGtUPNiS.mjs";
import { t as Textarea } from "./_ssr/textarea-DB4omhqi.mjs";
import { n as SwitchThumb, t as Switch$1 } from "./_libs/radix-ui__react-switch.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "./_libs/radix-ui__react-radio-group.mjs";
import { i as TabsTrigger$1, n as TabsContent$1, r as TabsList$1, t as Tabs$1 } from "./_libs/radix-ui__react-tabs.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "./_libs/radix-ui__react-slider.mjs";
import { t as Separator$1 } from "./_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated.design-BdltIp3f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	});
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-3.5 w-3.5 fill-primary" })
		})
	});
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
var Tabs = Tabs$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList$1, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsList$1.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsTrigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent$1, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsContent$1.displayName;
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator$1, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Separator$1.displayName;
function DesignSystem() {
	const [switchState, setSwitchState] = (0, import_react.useState)(false);
	const [sliderValue, setSliderValue] = (0, import_react.useState)([50]);
	const [progress, setProgress] = (0, import_react.useState)(66);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [selectedTab, setSelectedTab] = (0, import_react.useState)("colors");
	const { theme, setTheme } = useTheme();
	const icons = [
		{
			name: "Navigation",
			icons: [
				House,
				Menu,
				ChevronRight,
				ArrowUp,
				ArrowDown,
				Minus,
				X,
				Plus,
				Search,
				Funnel,
				ArrowUpNarrowWide,
				RefreshCw,
				ExternalLink,
				CircleQuestionMark
			]
		},
		{
			name: "Users",
			icons: [
				User,
				Users,
				UserPlus,
				Shield,
				Lock,
				Key,
				LogOut
			]
		},
		{
			name: "Actions",
			icons: [
				Check,
				X,
				Plus,
				Trash2,
				Download,
				Copy,
				Share2,
				Bookmark
			]
		},
		{
			name: "Media",
			icons: [
				Image,
				Video,
				Camera,
				Mic,
				Volume2,
				Sparkles
			]
		},
		{
			name: "Files",
			icons: [
				File,
				FileText,
				FileCode,
				Folder,
				Archive,
				Upload,
				Link,
				Unlink
			]
		},
		{
			name: "Communication",
			icons: [
				Mail,
				MessageSquare,
				Phone,
				Bell,
				Radio,
				Signal,
				Wifi,
				Bluetooth
			]
		},
		{
			name: "Business",
			icons: [
				Briefcase,
				Building2,
				DollarSign,
				CreditCard,
				Receipt,
				Package,
				Tag,
				ChartColumn,
				TrendingUp,
				TrendingDown
			]
		},
		{
			name: "Calendar",
			icons: [Calendar, Clock]
		},
		{
			name: "Settings",
			icons: [
				Settings,
				Cog,
				SlidersVertical,
				ToggleLeft,
				ToggleRight,
				Wrench,
				Hammer
			]
		},
		{
			name: "System",
			icons: [
				Cpu,
				HardDrive,
				MemoryStick,
				Server,
				Cloud,
				Monitor,
				Laptop,
				Smartphone,
				Tablet
			]
		},
		{
			name: "Alerts",
			icons: [
				CircleAlert,
				TriangleAlert,
				Info,
				CircleCheckBig,
				CircleX,
				OctagonAlert,
				ShieldAlert
			]
		},
		{
			name: "Misc",
			icons: [
				Star,
				Heart,
				Eye,
				EyeOff,
				Zap,
				Flame,
				Droplets,
				Leaf,
				Bug,
				Globe,
				Layers,
				Palette,
				Type,
				Box,
				Hash,
				RotateCw,
				RotateCcw,
				Maximize,
				Minimize,
				Crop,
				Inbox
			]
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Design System",
				description: "All components, colors, and icons used in Konvo."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => setTheme(theme === "light" ? "dark" : "light"),
					children: theme === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4 mr-2" }), "Dark"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4 mr-2" }), "Light"] })
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: selectedTab,
			onValueChange: setSelectedTab,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "colors",
							children: "Colors"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "typography",
							children: "Typography"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "components",
							children: "Components"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "forms",
							children: "Forms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "feedback",
							children: "Feedback"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "icons",
							children: "Icons"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "colors",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold mb-4",
							children: "Color Palette"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: "Primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-primary border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Primary"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-primary-hover border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Hover"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-primary-pressed border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Pressed"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-primary-soft border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Soft"
											})]
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: "Semantic"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-success border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Success"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-warning border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Warning"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-destructive border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Danger"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-info border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Info"
											})]
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: "Neutrals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-background border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Background"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-card border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Card"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-muted border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Muted"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-lg bg-border border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Border"
											})]
										})
									]
								})] })
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "typography",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Typography Scale"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-display font-bold",
										children: "Heading 1 - 32px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Plus Jakarta Sans, Bold"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-display font-bold",
										children: "Heading 2 - 24px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Plus Jakarta Sans, Bold"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-lg font-display font-semibold",
										children: "Heading 3 - 20px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Plus Jakarta Sans, Semibold"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-md font-medium",
										children: "Body - 16px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Inter, Medium"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-base",
										children: "Body - 14px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Inter, Regular"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: "Small - 13px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Inter, Regular"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs",
										children: "Extra Small - 12px"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Inter, Regular"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Tabular Numbers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tabular",
										children: "1,234,567.89"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tabular text-success",
										children: "+12.5%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tabular text-destructive",
										children: "-8.3%"
									})
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "components",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Buttons - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Default variants"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												children: "Secondary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												children: "Ghost"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												children: "Outline"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "destructive",
												children: "Destructive"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Loading state"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												loading: true,
												children: "Primary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												loading: true,
												children: "Secondary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												loading: true,
												children: "Ghost"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												loading: true,
												children: "Outline"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "destructive",
												loading: true,
												children: "Destructive"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Disabled state"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												disabled: true,
												children: "Primary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												disabled: true,
												children: "Secondary"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												disabled: true,
												children: "Ghost"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												disabled: true,
												children: "Outline"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "destructive",
												disabled: true,
												children: "Destructive"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Sizes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												children: "Small"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Default" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "lg",
												children: "Large"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "With icons"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-2" }), " Create"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-2" }), " Download"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "destructive",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 mr-2" }), " Delete"]
											})
										]
									})] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Badges - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: "Default variants"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Default" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											children: "Secondary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: "Outline"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "destructive",
											children: "Destructive"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-success text-success-foreground",
											children: "Success"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-warning text-warning-foreground",
											children: "Warning"
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: "With icons"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 mr-1" }), " Done"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "destructive",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3 mr-1" }), " Error"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											className: "bg-success text-success-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-3 mr-1" }), " Approved"]
										})
									]
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Avatars - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Sizes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
												name: "Priya Sharma",
												size: "sm"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, { name: "Priya Sharma" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
												name: "Priya Sharma",
												size: "lg"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Presence status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
												name: "Priya Sharma",
												online: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, {
												name: "Rohit Verma",
												online: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceAvatar, { name: "Ananya Iyer" })
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "With images"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
											src: "https://github.com/shadcn.png",
											alt: "@shadcn"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: "CN" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: "CN" }) })]
									})] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Tabs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
								defaultValue: "tab1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "tab1",
											children: "Tab 1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "tab2",
											children: "Tab 2"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "tab3",
											children: "Tab 3"
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "tab1",
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Content for tab 1" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "tab2",
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Content for tab 2" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "tab3",
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Content for tab 3" })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Dropdown Menu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									children: "Open menu"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "My Account" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, { children: "Profile" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, { children: "Billing" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, { children: "Team" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, { children: "Logout" })
							] })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Dialog"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
								open: dialogOpen,
								onOpenChange: setDialogOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										children: "Open dialog"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Are you sure?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This action cannot be undone. This will permanently delete your account." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setDialogOpen(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "destructive",
									onClick: () => setDialogOpen(false),
									children: "Delete"
								})] })] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Tooltip"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									children: "Hover me"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This is a tooltip" }) })] }) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Keyboard Shortcut"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Press" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "Ctrl" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, { children: "K" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "to open search" })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Separator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Content above" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Content below" })
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Left" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
											orientation: "vertical",
											className: "h-8"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Right" })
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "forms",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Input Fields - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 max-w-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Default"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "Default input" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Disabled input",
											disabled: true
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "With error"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Error state",
											className: "border-destructive"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-destructive",
											children: "This field is required"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "With icons (visual placeholder)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Search...",
											className: "pl-9"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Types"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "email",
												placeholder: "you@example.com"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "password",
												placeholder: "••••••••"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												placeholder: "123"
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-medium mb-3",
											children: "Textarea"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											placeholder: "Enter multiple lines...",
											rows: 4
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											placeholder: "Disabled textarea",
											rows: 4,
											disabled: true,
											className: "mt-2"
										})
									] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Select"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 max-w-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an option" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "option1",
										children: "Option 1"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "option2",
										children: "Option 2"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "option3",
										children: "Option 3"
									})
								] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									disabled: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Disabled select" }) })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Checkbox - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, { id: "check1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "check1",
											children: "Unchecked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "check2",
											defaultChecked: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "check2",
											children: "Checked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "check3",
											disabled: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "check3",
											children: "Disabled unchecked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "check4",
											defaultChecked: true,
											disabled: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "check4",
											children: "Disabled checked"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Switch - All States"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											id: "switch1",
											checked: switchState,
											onCheckedChange: setSwitchState
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "switch1",
											children: "Unchecked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											id: "switch2",
											defaultChecked: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "switch2",
											children: "Checked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											id: "switch3",
											disabled: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "switch3",
											children: "Disabled unchecked"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											id: "switch4",
											defaultChecked: true,
											disabled: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "switch4",
											children: "Disabled checked"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold mb-4",
									children: "Radio Group - All States"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
									defaultValue: "option1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
												value: "option1",
												id: "radio1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "radio1",
												children: "Option 1"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
												value: "option2",
												id: "radio2"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "radio2",
												children: "Option 2"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
												value: "option3",
												id: "radio3"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "radio3",
												children: "Option 3"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium mb-3",
										children: "Disabled"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
										defaultValue: "option1",
										disabled: true,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
												value: "option1",
												id: "radio4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "radio4",
												children: "Option 1"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
												value: "option2",
												id: "radio5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "radio5",
												children: "Option 2"
											})]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Slider"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-md space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: sliderValue,
										onValueChange: setSliderValue,
										max: 100,
										step: 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground",
										children: ["Value: ", sliderValue[0]]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										defaultValue: [50],
										disabled: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Disabled slider"
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "feedback",
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Progress"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 max-w-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setProgress(Math.max(0, progress - 10)),
										children: "-10%"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setProgress(Math.min(100, progress + 10)),
										children: "+10%"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Progress Ring"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, { value: progress }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setProgress(Math.max(0, progress - 10)),
										children: "-10%"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setProgress(Math.min(100, progress + 10)),
										children: "+10%"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Alerts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 max-w-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Information" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "This is an informational alert." })
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
										variant: "destructive",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Error" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Something went wrong. Please try again." })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
										className: "border-success bg-success-soft text-success",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Success" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Your changes have been saved." })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
										className: "border-warning bg-warning-soft text-warning",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Warning" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Please review before proceeding." })
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Skeleton Loading"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 max-w-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-2/3" })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Empty State"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								icon: Inbox,
								title: "No items found",
								description: "There are no items to display here.",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => toast("Action clicked"),
									children: "Create item"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Error State"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
								message: "Failed to load data",
								onRetry: () => toast("Retrying...")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Stat Card"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2 max-w-2xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Total Users",
									value: "1,234",
									delta: 12,
									trend: [
										10,
										12,
										11,
										14,
										13,
										15,
										14
									],
									icon: Users
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Avg. Response",
									value: "3.4 min",
									delta: -8,
									trend: [
										6,
										5.5,
										5,
										4.8,
										4.1,
										3.9,
										3.4
									],
									icon: Clock,
									goodWhenDown: true
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Toast Notifications"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => toast("Default toast"),
										children: "Default"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										onClick: () => toast.success("Success toast"),
										children: "Success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "destructive",
										onClick: () => toast.error("Error toast"),
										children: "Error"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => toast.info("Info toast"),
										children: "Info"
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "icons",
					className: "space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold mb-4",
								children: "Icon Library (Lucide React)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mb-4",
								children: "A selection of commonly used icons from Lucide React."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-6",
								children: icons.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium mb-3",
									children: category.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-3",
									children: category.icons.map((Icon, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											toast("Icon clicked");
										},
										className: "flex items-center justify-center w-10 h-10 rounded-md border bg-card hover:bg-muted transition-colors",
										title: `${category.name} icon ${idx + 1}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
									}, idx))
								})] }, category.name))
							})
						]
					})
				})
			]
		})]
	});
}
var SplitComponent = DesignSystem;
//#endregion
export { SplitComponent as component };
