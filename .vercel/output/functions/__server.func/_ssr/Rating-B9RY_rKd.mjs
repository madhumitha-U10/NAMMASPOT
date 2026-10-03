import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as Star } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Rating-B9RY_rKd.js
var import_jsx_runtime = require_jsx_runtime();
function Rating({ value, count }) {
	if (!value) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "New on NammaSpot"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs font-medium text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
				className: "size-3.5 fill-primary text-primary",
				"aria-hidden": true
			}),
			value.toFixed(1),
			count !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: [
					"(",
					count,
					")"
				]
			})
		]
	});
}
//#endregion
export { Rating as t };
