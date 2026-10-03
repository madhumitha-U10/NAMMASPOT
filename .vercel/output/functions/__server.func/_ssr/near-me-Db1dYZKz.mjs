import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as MapPin } from "../_libs/lucide-react.mjs";
import { n as PageHeading, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { s as approvedSellers } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { t as SellerCard } from "./SellerCard-DQE-ECVl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/near-me-Db1dYZKz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NEIGHBOURHOODS = [
	"Mylapore",
	"Adyar",
	"Besant Nagar",
	"T Nagar",
	"Anna Nagar",
	"Velachery",
	"Kodambakkam",
	"Villivakkam"
];
function NearMe() {
	const [area, setArea] = (0, import_react.useState)("Mylapore");
	const { data: sellers } = useStoreData(approvedSellers);
	const inArea = (sellers ?? []).filter((s) => s.area === area);
	const nearby = (sellers ?? []).filter((s) => s.area !== area && s.deliversAcrossCity);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Near Me",
		title: "Who's close by?",
		subtitle: "Pick your area — we show sellers in the neighbourhood first, then those who deliver across the city."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 lg:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: NEIGHBOURHOODS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: n === area ? "default" : "outline",
					className: "rounded-full",
					onClick: () => setArea(n),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
						" ",
						n
					]
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-8 text-lg font-extrabold",
				children: ["In ", area]
			}),
			inArea.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: [
					"No seller listed in ",
					area,
					" yet — check the city-wide list below."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: inArea.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { seller: s }, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-10 text-lg font-extrabold",
				children: "Delivers across Chennai"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: nearby.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { seller: s }, s.id))
			})
		]
	})] });
}
//#endregion
export { NearMe as component };
