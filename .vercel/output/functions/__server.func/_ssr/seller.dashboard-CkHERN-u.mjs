import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BqLqHsRg.mjs";
import { l as stringType, s as objectType } from "../_libs/zod.mjs";
import { t as SellerAvatar } from "./SellerAvatar-BzLCIvBH.mjs";
import { D as Eye, F as Boxes, N as ChartColumn, S as Instagram, T as Heart, a as Store, d as Settings, h as MessageSquare, i as Trash2, m as Pencil, n as Users, t as X, x as LayoutGrid, y as LogOut } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as cn, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Badge } from "./badge-CcKQauQ3.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as Label } from "./label-BTwE2nrN.mjs";
import { D as setProductImage, E as setCustomerAvatar, N as updateProduct, S as reviewsBySeller, b as removeSellerImage, g as inr, k as setSellerImage, m as enquiriesBySeller, n as allCustomers, p as deleteProduct, t as addProduct, u as categoryById, v as productsBySeller, w as sellerById } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { i as getSession, n as clearSession } from "./session-BGB_FtJ0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-iNnrgf-R.mjs";
import { t as supabase } from "./client-BbfXN-w2.mjs";
import { n as Textarea, t as PhotoPicker } from "./textarea-CKGx2a4U.mjs";
import { t as ProductImage } from "./ProductImage-DcaZcjM9.mjs";
import { n as signOutSeller } from "./seller-auth-D044lGr3.mjs";
import { a as ResponsiveContainer, i as Bar, n as XAxis, o as Tooltip, r as CartesianGrid, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller.dashboard-CkHERN-u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REFRESH_INTERVAL_MS = 18e5;
/**
* Keeps a signed-in seller's Supabase session alive.
*
* JWTs expire after ~1 hour, so we proactively refresh every 30 minutes.
* If the refresh fails the session is no longer valid and we sign out so the
* app can send the seller back to the login screen instead of failing silently.
*/
function useSellerSessionRefresh() {
	(0, import_react.useEffect)(() => {
		const interval = setInterval(async () => {
			try {
				const { data } = await supabase.auth.getSession();
				if (!data.session) return;
				const { error } = await supabase.auth.refreshSession();
				if (error) {
					console.error("Session refresh failed:", error);
					await supabase.auth.signOut();
				}
			} catch (error) {
				console.error("Session refresh error:", error);
			}
		}, REFRESH_INTERVAL_MS);
		return () => clearInterval(interval);
	}, []);
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
/**
* Server-side seller authorization.
*
* Verifies that the currently signed-in Supabase user owns the seller profile
* they're trying to access. Prevents localStorage/URL manipulation from
* granting access to another seller's dashboard.
*/
var getAuthorizedSellerId = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ sellerId: stringType() }).parse(data)).handler(createSsrRpc("b36d55f1c6f10cc0be429935143053aa9e87e506fa37eb9c3fb8683d1f1195d9"));
var SECTIONS = [
	{
		id: "overview",
		label: "Overview",
		icon: LayoutGrid
	},
	{
		id: "business",
		label: "My Business",
		icon: Store
	},
	{
		id: "catalogue",
		label: "Catalogue",
		icon: Boxes
	},
	{
		id: "enquiries",
		label: "Enquiries",
		icon: MessageSquare
	},
	{
		id: "customers",
		label: "Customers",
		icon: Users
	},
	{
		id: "instagram",
		label: "Instagram",
		icon: Instagram
	},
	{
		id: "analytics",
		label: "Analytics",
		icon: ChartColumn
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings
	}
];
var VIEWS_7D = [
	{
		day: "Mon",
		views: 118
	},
	{
		day: "Tue",
		views: 164
	},
	{
		day: "Wed",
		views: 132
	},
	{
		day: "Thu",
		views: 205
	},
	{
		day: "Fri",
		views: 241
	},
	{
		day: "Sat",
		views: 268
	},
	{
		day: "Sun",
		views: 196
	}
];
function Dashboard() {
	useSellerSessionRefresh();
	const [section, setSection] = (0, import_react.useState)("overview");
	const [authChecked, setAuthChecked] = (0, import_react.useState)(false);
	const [authOk, setAuthOk] = (0, import_react.useState)(false);
	const [editingProduct, setEditingProduct] = (0, import_react.useState)(null);
	const { data: sellerId } = useStoreData(getSession);
	(0, import_react.useEffect)(() => {
		const sid = getSession();
		if (!sid) {
			setAuthChecked(true);
			setAuthOk(false);
			return;
		}
		getAuthorizedSellerId({ data: { sellerId: sid } }).then((res) => {
			setAuthOk(res.ok);
			setAuthChecked(true);
			if (!res.ok) clearSession();
		});
	}, [sellerId]);
	const { data: seller, refresh: refreshSeller } = useStoreData(() => {
		const sid = getSession();
		return sid ? sellerById(sid) ?? null : null;
	});
	const { data: products, refresh: refreshProducts } = useStoreData(() => {
		const sid = getSession();
		return sid ? productsBySeller(sid) : [];
	});
	const { data: enquiries } = useStoreData(() => {
		const sid = getSession();
		return sid ? enquiriesBySeller(sid) : [];
	});
	const { data: customers, refresh: refreshCustomers } = useStoreData(allCustomers);
	const { data: reviews } = useStoreData(() => {
		const sid = getSession();
		return sid ? reviewsBySeller(sid) : [];
	});
	if (!authChecked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-4 py-24 text-sm text-muted-foreground",
		children: "Loading…"
	}) });
	if (sellerId === null || !authOk || sellerId && seller === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-extrabold",
				children: "Sign in to your dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Seller dashboards are private to each business."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/seller/login",
						children: "Seller login"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/seller/register",
						children: "Register"
					})
				})]
			})
		]
	}) });
	if (!seller) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-4 py-24 text-sm text-muted-foreground",
		children: "Loading dashboard…"
	}) });
	const list = products ?? [];
	const enq = enquiries ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "min-w-0 lg:sticky lg:top-24 lg:self-start",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground",
						children: seller.businessName.charAt(0)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-bold",
							children: "Seller Dashboard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: seller.businessName
						})]
					})]
				}),
				seller.status !== "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "mt-3",
					children: "Pending admin approval"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-5 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0",
					children: SECTIONS.map(({ id, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSection(id),
						className: `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${section === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								"aria-hidden": true
							}),
							" ",
							label
						]
					}, id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-5 sm:flex sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Vanakkam, ",
							seller.ownerName.split(" ")[0],
							" 👋"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-extrabold sm:text-3xl",
						children: "Here's how your shop is doing."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/seller/$slug",
							params: { slug: seller.slug },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), " View profile"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "rounded-full",
						onClick: () => setSection("catalogue"),
						children: "Add product"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-6",
				children: [
					section === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							{
								label: "Profile Views",
								value: "1,284",
								delta: "+12%",
								icon: Eye
							},
							{
								label: "Catalogue Views",
								value: "864",
								delta: "+5%",
								icon: Boxes
							},
							{
								label: "New Enquiries",
								value: String(enq.filter((e) => e.status === "new").length),
								delta: "live",
								icon: MessageSquare
							},
							{
								label: "Saved",
								value: "137",
								delta: "+18%",
								icon: Heart
							}
						].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: m.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, {
									className: "size-4 shrink-0 text-muted-foreground",
									"aria-hidden": true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xl font-extrabold text-primary",
								children: [
									m.value,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium text-muted-foreground",
										children: m.delta
									})
								]
							})]
						}, m.label))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-primary",
								children: "Profile Views Over Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 h-56",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: VIEWS_7D,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												strokeDasharray: "3 3",
												vertical: false,
												opacity: .3
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "day",
												fontSize: 11,
												tickLine: false,
												axisLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												dataKey: "views",
												fill: "var(--color-chart-2)",
												radius: [
													6,
													6,
													0,
													0
												]
											})
										]
									})
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-primary",
								children: "Popular Products"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-3",
								children: list.slice().sort((a, b) => b.views - a.views).slice(0, 4).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "grid grid-cols-[minmax(0,1fr)_auto] gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-primary",
											children: inr(p.price)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "shrink-0 text-right text-xs text-muted-foreground",
										children: [
											p.views,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
											"views"
										]
									})]
								}, p.id))
							})]
						})]
					})] }),
					section === "business" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-soft max-w-2xl space-y-4 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-extrabold",
								children: "Business profile"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-4 border-b border-border pb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
										name: seller.businessName,
										src: seller.imageUrl,
										size: "xl"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-bold",
											children: "Profile picture"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "max-w-sm text-xs text-muted-foreground",
											children: "Square photo, JPG or PNG under 5MB. This is what customers see on your profile and in search results."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
													src: seller.imageUrl,
													alt: seller.businessName,
													label: "profile picture",
													bucket: "seller-avatars",
													fit: "cover",
													className: "size-12 rounded-full",
													onPicked: (url) => {
														setSellerImage(seller.id, url);
														refreshSeller();
														toast.success("Profile picture updated");
													}
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted-foreground",
													children: seller.imageUrl ? "Tap to change" : "Tap to upload"
												}),
												seller.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													className: "rounded-full",
													onClick: () => {
														removeSellerImage(seller.id);
														refreshSeller();
														toast.success("Profile picture removed");
													},
													children: "Remove"
												})
											]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Business name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										defaultValue: seller.businessName,
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										readOnly: true,
										value: categoryById(seller.categoryId)?.name ?? "",
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Area" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										defaultValue: seller.area,
										className: "mt-1.5"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "WhatsApp" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										defaultValue: seller.whatsapp,
										className: "mt-1.5"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tagline" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								defaultValue: seller.tagline,
								className: "mt-1.5"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "About" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 4,
								defaultValue: seller.about,
								className: "mt-1.5"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "rounded-full",
								onClick: () => toast.success("Profile saved"),
								children: "Save changes"
							})
						]
					}),
					section === "catalogue" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-[1fr_320px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No products yet. Add your first item using the form."
							}), list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-soft grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
										src: p.imageUrl,
										alt: p.name,
										label: "Photo",
										bucket: "product-images",
										className: "size-16 rounded-lg",
										onPicked: (url) => {
											setProductImage(p.id, url);
											refreshProducts();
											toast.success("Photo updated");
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-bold",
												children: p.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "line-clamp-1 text-xs text-muted-foreground",
												children: p.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-xs font-semibold text-primary",
												children: [
													inr(p.price),
													" / ",
													p.unit
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex shrink-0 items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "size-8",
											onClick: () => setEditingProduct(p),
											"aria-label": `Edit ${p.name}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "size-8 text-destructive hover:text-destructive",
											onClick: () => {
												deleteProduct(p.id);
												refreshProducts();
												toast.success("Product removed");
											},
											"aria-label": `Delete ${p.name}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									})
								]
							}, p.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddProductForm, {
							sellerId: seller.id,
							onAdded: () => {
								refreshProducts();
								refreshSeller();
							}
						})]
					}),
					section === "enquiries" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [enq.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No enquiries yet."
						}), enq.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-bold",
											children: e.customerName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												e.phone,
												" · event ",
												e.eventDate || "—",
												" · received ",
												e.createdAt
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: e.status === "new" ? "default" : "secondary",
										className: "shrink-0 text-[10px] uppercase",
										children: e.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: e.message
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									variant: "outline",
									className: "mt-3 rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `https://wa.me/${e.phone}`,
										target: "_blank",
										rel: "noreferrer",
										children: "Reply on WhatsApp"
									})
								})
							]
						}, e.id))]
					}),
					section === "customers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card-soft divide-y divide-border",
						children: (customers ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
									src: c.avatarUrl,
									alt: c.name,
									label: "DP",
									className: "size-11 rounded-full",
									onPicked: (dataUrl) => {
										setCustomerAvatar(c.id, dataUrl);
										refreshCustomers();
										toast.success("Profile picture updated");
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-semibold",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											c.phone,
											" · ",
											c.area
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "shrink-0 text-xs text-muted-foreground",
									children: ["since ", c.createdAt]
								})
							]
						}, c.id))
					}),
					section === "instagram" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-soft max-w-xl p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-extrabold",
								children: "Instagram"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Your listing links straight to your Instagram, so customers can see your latest work before enquiring."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Handle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									defaultValue: seller.instagram,
									className: "mt-1.5"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "mt-4 rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `https://instagram.com/${seller.instagram}`,
									target: "_blank",
									rel: "noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "size-4" }), " Open profile"]
								})
							})
						]
					}),
					section === "analytics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-primary",
								children: "Weekly views"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 h-48",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: VIEWS_7D,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "day",
												fontSize: 11,
												tickLine: false,
												axisLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												dataKey: "views",
												fill: "var(--color-chart-1)",
												radius: [
													6,
													6,
													0,
													0
												]
											})
										]
									})
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft space-y-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold text-primary",
									children: "Summary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Catalogue items: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: list.length
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Total product views:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: list.reduce((sum, p) => sum + p.views, 0)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Enquiries received: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: enq.length
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Published reviews:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: (reviews ?? []).length
										})
									]
								})
							]
						})]
					}),
					section === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-soft max-w-xl space-y-4 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-extrabold",
								children: "Settings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Contact email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								defaultValue: seller.email,
								className: "mt-1.5"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								defaultValue: seller.deliversAcrossCity ? "city" : "area",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "city",
									children: "Delivers across the city"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "area",
									children: "Local area / pickup only"
								})] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "rounded-full",
									onClick: () => toast.success("Settings saved"),
									children: "Save"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "rounded-full",
									onClick: async () => {
										await signOutSeller();
										clearSession();
										toast.success("Signed out");
										window.location.assign("/seller/login");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
								})]
							})
						]
					})
				]
			})]
		})]
	}), editingProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProductDialog, {
		product: editingProduct,
		onClose: () => setEditingProduct(null),
		onSaved: refreshProducts
	})] });
}
function AddProductForm({ sellerId, onAdded }) {
	const [type, setType] = (0, import_react.useState)("product");
	const [imageUrl, setImageUrl] = (0, import_react.useState)("");
	const submit = (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const name = String(fd.get("name") ?? "").trim();
		const price = Number(fd.get("price"));
		if (name.length < 2 || !Number.isFinite(price) || price < 0) {
			toast.error("Add a name and a valid price");
			return;
		}
		addProduct({
			sellerId,
			name: name.slice(0, 80),
			type,
			price,
			unit: String(fd.get("unit") ?? "piece").slice(0, 30),
			description: String(fd.get("description") ?? "").slice(0, 400),
			...imageUrl ? { imageUrl } : {}
		});
		e.currentTarget.reset();
		setImageUrl("");
		onAdded();
		toast.success("Added to your catalogue");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "card-soft h-fit space-y-3 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold",
				children: "Add product / service"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
					src: imageUrl || void 0,
					alt: "new item",
					label: "Photo",
					bucket: "product-images",
					className: "size-16 rounded-lg",
					onPicked: setImageUrl
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Photo (optional)"
				})]
			}),
			imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
				src: imageUrl,
				alt: "Selected catalogue photo",
				className: "rounded-lg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "name",
				children: "Name"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "name",
				name: "name",
				className: "mt-1.5",
				maxLength: 80
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "price",
					children: "Price ₹"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "price",
					name: "price",
					inputMode: "numeric",
					className: "mt-1.5"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "unit",
					children: "Unit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "unit",
					name: "unit",
					defaultValue: "piece",
					className: "mt-1.5",
					maxLength: 30
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: type,
				onValueChange: (v) => setType(v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "mt-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "product",
					children: "Product"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "service",
					children: "Service"
				})] })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "description",
				children: "Description"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "description",
				name: "description",
				rows: 3,
				className: "mt-1.5",
				maxLength: 400
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full rounded-full",
				children: "Add to catalogue"
			})
		]
	});
}
function EditProductDialog({ product, onClose, onSaved }) {
	const submit = (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const name = String(fd.get("name") ?? "").trim();
		const price = Number(fd.get("price"));
		if (name.length < 2 || !Number.isFinite(price) || price < 0) {
			toast.error("Add a name and a valid price");
			return;
		}
		updateProduct(product.id, {
			name: name.slice(0, 80),
			price,
			unit: String(fd.get("unit") ?? "piece").slice(0, 30),
			type: String(fd.get("type") ?? "product"),
			description: String(fd.get("description") ?? "").slice(0, 400)
		});
		onSaved();
		onClose();
		toast.success("Product updated");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit product" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-name",
						name: "name",
						defaultValue: product.name,
						className: "mt-1.5",
						maxLength: 80
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-price",
							children: "Price ₹"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-price",
							name: "price",
							type: "number",
							inputMode: "numeric",
							defaultValue: product.price,
							className: "mt-1.5"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-unit",
							children: "Unit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-unit",
							name: "unit",
							defaultValue: product.unit,
							className: "mt-1.5",
							maxLength: 30
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						name: "type",
						defaultValue: product.type,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "mt-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "product",
							children: "Product"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "service",
							children: "Service"
						})] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-description",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "edit-description",
						name: "description",
						rows: 3,
						defaultValue: product.description,
						className: "mt-1.5",
						maxLength: 400
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Save changes"
					})] })
				]
			})]
		})
	});
}
//#endregion
export { Dashboard as component };
