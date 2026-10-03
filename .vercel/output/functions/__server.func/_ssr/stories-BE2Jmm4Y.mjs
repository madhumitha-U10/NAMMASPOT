import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as PageHeading, r as SiteShell } from "./SiteShell-CeFiVG_g.mjs";
import { u as categoryById } from "./api-C5qQuJ0W.mjs";
import { n as imageForCategorySlug } from "./images-k2yOaHv8.mjs";
import { a as SELLERS, o as STORIES } from "./router-DB73OFJI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stories-BE2Jmm4Y.js
var import_jsx_runtime = require_jsx_runtime();
function Stories() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Stories",
		title: "The people behind the shops",
		subtitle: "Every listing here has a person, a street and a story behind it."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-4xl px-4 py-8 lg:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: STORIES.map((story) => {
				const seller = SELLERS.find((s) => s.id === story.sellerId);
				const cat = seller ? categoryById(seller.categoryId) : void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card-soft overflow-hidden md:flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: imageForCategorySlug(cat?.slug),
						alt: story.title,
						loading: "lazy",
						className: "h-44 w-full object-cover md:h-auto md:w-56"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold uppercase tracking-widest text-primary",
								children: [
									seller?.area,
									" · ",
									cat?.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-xl font-extrabold",
								children: story.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: story.body
							}),
							seller && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/seller/$slug",
								params: { slug: seller.slug },
								className: "mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline",
								children: [
									"Visit ",
									seller.businessName,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
								]
							})
						]
					})]
				}, story.id);
			})
		})
	})] });
}
//#endregion
export { Stories as component };
