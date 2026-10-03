import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as SlidersHorizontal, f as Search, t as X } from "../_libs/lucide-react.mjs";
import { n as PageHeading, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as SellerCardSkeleton } from "./SellerCardSkeleton-rSYuO1KM.mjs";
import { C as searchSellers, c as areas, l as categories } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { r as Route$9 } from "./router-DB73OFJI.mjs";
import { t as SellerCard } from "./SellerCard-DQE-ECVl.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-iNnrgf-R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-BoGq0XWG.js
var import_jsx_runtime = require_jsx_runtime();
var ALL = "all";
function Explore() {
	const search = Route$9.useSearch();
	const navigate = useNavigate({ from: Route$9.fullPath });
	const { data: catsData } = useStoreData(categories);
	const cats = catsData ?? [];
	const { data: areaList } = useStoreData(areas);
	const set = (patch) => navigate({ search: (prev) => ({
		...prev,
		...patch
	}) });
	const { data: results } = useStoreData(() => searchSellers(search));
	const list = results ?? null;
	const activeCount = [
		search.category,
		search.area,
		search.minRating,
		search.maxPrice
	].filter(Boolean).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Explore",
		title: "Find your maker",
		subtitle: "Search by name, craft, product or neighbourhood — then narrow it down."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 lg:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-soft p-3 sm:p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search.q ?? "",
							onChange: (e) => set({ q: e.target.value || void 0 }),
							placeholder: "Search sellers, products or areas",
							className: "h-11 rounded-full pl-9",
							"aria-label": "Search"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: search.category ?? ALL,
								onValueChange: (v) => set({ category: v === ALL ? void 0 : v }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Category",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Category" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: ALL,
									children: "All categories"
								}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.slug,
									children: c.name
								}, c.id))] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: search.area ?? ALL,
								onValueChange: (v) => set({ area: v === ALL ? void 0 : v }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Area",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Area" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: ALL,
									children: "All areas"
								}), (areaList ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: a,
									children: a
								}, a))] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: search.minRating ? String(search.minRating) : ALL,
								onValueChange: (v) => set({ minRating: v === ALL ? void 0 : Number(v) }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Rating",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Rating" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: ALL,
										children: "Any rating"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "4.5",
										children: "4.5+"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "4",
										children: "4.0+"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: search.sort ?? "featured",
								onValueChange: (v) => set({ sort: v }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Sort",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sort" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "featured",
										children: "Featured first"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "rating",
										children: "Top rated"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "price-low",
										children: "Price: low to high"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "newest",
										children: "Newest"
									})
								] })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: search.maxPrice ? String(search.maxPrice) : ALL,
							onValueChange: (v) => set({ maxPrice: v === ALL ? void 0 : Number(v) }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								"aria-label": "Budget",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Budget" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: ALL,
									children: "Any budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "500",
									children: "Starts under ₹500"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "2000",
									children: "Starts under ₹2,000"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "15000",
									children: "Starts under ₹15,000"
								})
							] })]
						}), activeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "justify-start gap-2 text-primary",
							onClick: () => navigate({ search: {
								q: search.q,
								sort: search.sort
							} }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
								" Clear ",
								activeCount,
								" filter",
								activeCount > 1 ? "s" : ""
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
					className: "size-4",
					"aria-hidden": true
				}), list ? `${list.length} seller${list.length === 1 ? "" : "s"} found` : "Loading sellers…"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: list === null ? [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCardSkeleton, {}, `explore-skeleton-${i}`)) : list.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { seller: s }, s.id))
			}),
			list && list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-soft mt-4 p-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "No sellers match that yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Try a broader area or clear the filters."
				})]
			})
		]
	})] });
}
//#endregion
export { Explore as component };
