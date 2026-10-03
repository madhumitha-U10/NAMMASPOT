import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as SellerAvatar } from "./SellerAvatar-BzLCIvBH.mjs";
import { I as BadgeCheck, S as Instagram, v as MapPin } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-CcKQauQ3.mjs";
import { g as inr, u as categoryById } from "./api-C5qQuJ0W.mjs";
import { t as Rating } from "./Rating-B9RY_rKd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SellerCard-DQE-ECVl.js
var import_jsx_runtime = require_jsx_runtime();
function SellerCard({ seller }) {
	const category = categoryById(seller.categoryId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/seller/$slug",
		params: { slug: seller.slug },
		"aria-label": `${seller.businessName} in ${seller.area}`,
		className: "group card-soft flex min-h-[112px] gap-3.5 overflow-hidden p-3.5 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
			name: seller.businessName,
			src: seller.imageUrl,
			size: "md"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "min-w-0 truncate text-base font-bold",
						children: [seller.businessName, seller.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
							className: "ml-1 inline size-4 align-[-2px] text-primary",
							"aria-label": "Verified seller"
						})]
					}), seller.featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 text-[10px] uppercase tracking-wide",
						children: "Featured"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-xs text-muted-foreground",
					children: seller.tagline
				}),
				category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium text-primary/80",
					children: category.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rating, {
							value: seller.rating,
							count: seller.reviewCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								className: "size-3.5",
								"aria-hidden": true
							}), seller.area]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, {
									className: "size-3.5",
									"aria-hidden": true
								}),
								"@",
								seller.instagram
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-semibold text-primary",
					children: ["From ", inr(seller.priceFrom)]
				})
			]
		})]
	});
}
//#endregion
export { SellerCard as t };
