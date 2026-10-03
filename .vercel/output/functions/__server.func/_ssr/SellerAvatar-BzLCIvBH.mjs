import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SellerAvatar-BzLCIvBH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Circular seller/customer avatar with an initials fallback.
* `object-cover` is intentional here — cropping a circle is expected. Product
* photos never use this component (they must keep their uploaded proportions).
*/
var SIZES = {
	sm: "size-12 text-sm",
	md: "size-16 text-base",
	lg: "size-20 text-lg",
	xl: "size-[120px] text-3xl"
};
function getInitials(name) {
	return name.split(/\s+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}
function SellerAvatar({ name, src, size = "md", className = "" }) {
	const [imgError, setImgError] = (0, import_react.useState)(false);
	const showImg = src && !imgError;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-card bg-secondary font-display font-bold text-primary shadow-[var(--shadow-soft)] ${SIZES[size]} ${className}`,
		children: [showImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: `${name} profile picture`,
			loading: "lazy",
			decoding: "async",
			className: "size-full object-cover",
			onError: () => setImgError(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			children: getInitials(name)
		}), !showImg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: name
		})]
	});
}
//#endregion
export { SellerAvatar as t };
