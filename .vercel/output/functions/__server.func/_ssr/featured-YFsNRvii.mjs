import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as PageHeading, r as SiteShell } from "./SiteShell-CeFiVG_g.mjs";
import { g as inr, s as approvedSellers, u as categoryById } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { t as SellerCard } from "./SellerCard-DQE-ECVl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/featured-YFsNRvii.js
var import_jsx_runtime = require_jsx_runtime();
function Featured() {
	const { data: sellers } = useStoreData(approvedSellers);
	const featured = (sellers ?? []).filter((s) => s.featured);
	const topRated = (sellers ?? []).slice().sort((a, b) => b.rating - a.rating).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Featured",
		title: "Hand-picked this week",
		subtitle: "Chosen for craft, consistency and how they treat customers."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 lg:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: featured.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { seller: s }, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-12 text-xl font-extrabold",
				children: "Top rated overall"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-soft mt-4 divide-y divide-border",
				children: topRated.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 shrink-0 font-display text-lg font-extrabold text-primary",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: s.businessName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									categoryById(s.categoryId)?.name,
									" · ",
									s.area
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-xs font-semibold text-primary",
							children: [
								s.rating ? s.rating.toFixed(1) : "New",
								" · ",
								inr(s.priceFrom),
								"+"
							]
						})
					]
				}, s.id))
			})
		]
	})] });
}
//#endregion
export { Featured as component };
