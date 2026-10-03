import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as PageHeading, r as SiteShell } from "./SiteShell-CeFiVG_g.mjs";
import { l as categories, s as approvedSellers, u as categoryById } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { n as imageForCategorySlug } from "./images-k2yOaHv8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-K34vS0RT.js
var import_jsx_runtime = require_jsx_runtime();
function CategoriesPage() {
	const { data: sellers } = useStoreData(approvedSellers);
	const { data: cats } = useStoreData(categories);
	const count = (categoryId) => (sellers ?? []).filter((s) => s.categoryId === categoryId).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
			eyebrow: "Categories",
			title: "Crafts of Chennai",
			subtitle: "Every category is run by real people you can message directly."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-6",
			children: (cats ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/explore",
				search: { category: c.slug },
				className: "group card-soft overflow-hidden hover:border-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: imageForCategorySlug(c.slug),
					alt: c.name,
					loading: "lazy",
					className: "h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 text-xs text-muted-foreground",
								children: [count(c.id), " sellers"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-primary/80",
							children: c.tamilName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted-foreground",
							children: c.blurb
						})
					]
				})]
			}, c.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 pb-8 lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-extrabold",
				children: "Popular right now"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: (sellers ?? []).slice().sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/seller/$slug",
					params: { slug: s.slug },
					className: "card-soft flex items-center justify-between gap-3 px-4 py-3 text-sm hover:border-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 truncate font-semibold",
						children: s.businessName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-xs text-muted-foreground",
						children: categoryById(s.categoryId)?.name
					})]
				}) }, s.id))
			})]
		})
	] });
}
//#endregion
export { CategoriesPage as component };
