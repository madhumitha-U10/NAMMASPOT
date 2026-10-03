import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as verifyAdminPassword, t as checkAdminSession } from "./admin-auth-CDyMm6Zj.mjs";
import { t as SellerAvatar } from "./SellerAvatar-BzLCIvBH.mjs";
import { M as Check, b as LoaderCircle, l as ShieldCheck, t as X } from "../_libs/lucide-react.mjs";
import { n as PageHeading, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Badge } from "./badge-CcKQauQ3.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as Label } from "./label-BTwE2nrN.mjs";
import { n as SellerRowSkeleton } from "./SellerCardSkeleton-rSYuO1KM.mjs";
import { A as setSellerStatus, O as setReviewApproval, a as allReviews, g as inr, i as allProducts, l as categories, o as allSellers, r as allEnquiries, u as categoryById, w as sellerById } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { a as setAdminToken, r as getAdminToken, t as clearAdminToken } from "./session-BGB_FtJ0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Bn8bPpdH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		id: "approval",
		label: "Seller Approval"
	},
	{
		id: "sellers",
		label: "Sellers"
	},
	{
		id: "catalogue",
		label: "Products / Services"
	},
	{
		id: "categories",
		label: "Categories"
	},
	{
		id: "enquiries",
		label: "Enquiries"
	},
	{
		id: "reviews",
		label: "Reviews"
	}
];
function Admin() {
	const [authState, setAuthState] = (0, import_react.useState)("checking");
	const [tab, setTab] = (0, import_react.useState)("approval");
	const [tick, setTick] = (0, import_react.useState)(0);
	const [decidingId, setDecidingId] = (0, import_react.useState)(null);
	const [loginBusy, setLoginBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const token = getAdminToken();
		if (!token) {
			setAuthState("out");
			return;
		}
		checkAdminSession({ data: { token } }).then((res) => {
			setAuthState(res.ok ? "in" : "out");
			if (!res.ok) clearAdminToken();
		});
	}, []);
	const { data: sellers, refresh: refreshSellers } = useStoreData(allSellers);
	const { data: reviews, refresh: refreshReviews } = useStoreData(allReviews);
	const { data: enquiries } = useStoreData(allEnquiries);
	const { data: products } = useStoreData(allProducts);
	if (authState === "checking") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-4 py-24 text-sm text-muted-foreground",
		children: "Loading…"
	}) });
	if (authState === "out") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Admin",
		title: "Admin login",
		subtitle: "Restricted to the NammaSpot team."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-sm px-4 py-8 lg:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "card-soft space-y-4 p-5",
			onSubmit: async (e) => {
				e.preventDefault();
				const code = String(new FormData(e.currentTarget).get("code") ?? "");
				setLoginBusy(true);
				try {
					const res = await verifyAdminPassword({ data: { password: code } });
					if (res.ok && res.token) {
						setAdminToken(res.token);
						setAuthState("in");
					} else toast.error(res.error ?? "Invalid access code");
				} catch {
					toast.error("Could not verify access code");
				} finally {
					setLoginBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "code",
					children: "Access code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "code",
					name: "code",
					type: "password",
					className: "mt-1.5"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: loginBusy,
					className: "w-full rounded-full",
					children: [loginBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), loginBusy ? "Verifying…" : "Enter console"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Admin access is restricted to the NammaSpot team."
				})
			]
		})
	})] });
	const sellersLoading = sellers === null;
	const all = sellers ?? [];
	const pending = all.filter((s) => s.status === "pending");
	const adminToken = getAdminToken();
	const decide = async (id, status) => {
		setDecidingId(id);
		try {
			await setSellerStatus(id, status, adminToken ?? void 0);
			refreshSellers();
			setTick(tick + 1);
			toast.success(status === "approved" ? "Seller approved and live" : "Seller rejected");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not update this seller");
		} finally {
			setDecidingId(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Admin",
		title: "Moderation console",
		subtitle: "Approve new sellers, moderate reviews and keep an eye on enquiries."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 lg:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex gap-1 overflow-x-auto pb-2",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab(t.id),
					className: `shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`,
					children: [t.label, t.id === "approval" && pending.length > 0 && ` (${pending.length})`]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					tab === "approval" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							sellersLoading && [...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "card-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerRowSkeleton, {})
							}, `pending-skeleton-${i}`)),
							!sellersLoading && pending.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Nothing waiting for approval."
							}),
							pending.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-soft p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
										name: s.businessName,
										src: s.imageUrl,
										size: "md"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-bold",
												children: s.businessName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: [
													s.ownerName,
													" · ",
													categoryById(s.categoryId)?.name,
													" · ",
													s.area,
													", ",
													s.city
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
												children: s.about
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 truncate text-xs text-muted-foreground",
												children: [
													"@",
													s.instagram,
													" · ",
													s.email,
													" · applied ",
													s.createdAt
												]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "rounded-full",
										disabled: decidingId === s.id,
										onClick: () => decide(s.id, "approved"),
										children: [decidingId === s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											className: "size-4 animate-spin",
											"aria-hidden": true
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), decidingId === s.id ? "Working…" : "Approve"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "rounded-full",
										disabled: decidingId === s.id,
										onClick: () => decide(s.id, "rejected"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Reject"]
									})]
								})]
							}, s.id))
						]
					}),
					tab === "sellers" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-soft divide-y divide-border",
						children: [sellersLoading && [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerRowSkeleton, {}, `seller-skeleton-${i}`)), all.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
									name: s.businessName,
									src: s.imageUrl,
									size: "sm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/seller/$slug",
										params: { slug: s.slug },
										className: "truncate text-sm font-semibold hover:text-primary",
										children: s.businessName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											categoryById(s.categoryId)?.name,
											" · ",
											s.area,
											" · ",
											s.reviewCount,
											" reviews"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: s.status === "approved" ? "default" : "secondary",
										children: s.status
									}), s.status !== "approved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "rounded-full",
										disabled: decidingId === s.id,
										onClick: () => decide(s.id, "approved"),
										children: decidingId === s.id ? "Working…" : "Approve"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "rounded-full",
										disabled: decidingId === s.id,
										onClick: () => decide(s.id, "rejected"),
										children: decidingId === s.id ? "Working…" : "Suspend"
									})]
								})
							]
						}, s.id))]
					}),
					tab === "catalogue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card-soft divide-y divide-border",
						children: (products ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										sellerById(p.sellerId)?.businessName,
										" · ",
										p.type
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "shrink-0 text-sm font-semibold text-primary",
								children: inr(p.price)
							})]
						}, p.id))
					}),
					tab === "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: categories().map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-primary/80",
									children: c.tamilName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: c.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: [
										all.filter((s) => s.categoryId === c.id).length,
										" sellers · slug",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: c.slug })
									]
								})
							]
						}, c.id))
					}),
					tab === "enquiries" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card-soft divide-y divide-border",
						children: (enquiries ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[minmax(0,1fr)_auto] gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-sm font-semibold",
										children: [
											e.customerName,
											" → ",
											sellerById(e.sellerId)?.businessName
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											e.phone,
											" · event ",
											e.eventDate || "—",
											" · ",
											e.createdAt
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "shrink-0",
									children: e.status
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: e.message
							})]
						}, e.id))
					}),
					tab === "reviews" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: (reviews ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "card-soft p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-sm font-semibold",
											children: [
												r.customerName,
												" · ",
												r.rating,
												"★"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												sellerById(r.sellerId)?.businessName,
												" · ",
												r.createdAt
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted-foreground",
											children: r.comment
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: r.approved ? "ghost" : "default",
									className: "shrink-0 rounded-full",
									onClick: async () => {
										try {
											await setReviewApproval(r.id, !r.approved, adminToken ?? void 0);
											refreshReviews();
											toast.success(r.approved ? "Review hidden" : "Review published");
										} catch (error) {
											toast.error(error instanceof Error ? error.message : "Could not update review");
										}
									},
									children: r.approved ? "Hide" : "Publish"
								})]
							})
						}, r.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "mt-8 rounded-full",
				onClick: () => {
					clearAdminToken();
					setAuthState("out");
				},
				children: "Sign out of admin"
			})
		]
	})] });
}
//#endregion
export { Admin as component };
