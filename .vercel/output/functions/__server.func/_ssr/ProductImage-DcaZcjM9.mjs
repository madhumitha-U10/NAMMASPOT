import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductImage-DcaZcjM9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Catalogue photo.
*
* Product images are shown in the proportions the seller uploaded — the image
* is fitted inside the frame with `object-contain`, never cropped. Any leftover
* space uses the muted surface colour.
*/
function ProductImage({ src, alt, className = "", ratio = "aspect-[4/3]" }) {
	const [imgError, setImgError] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `grid place-items-center overflow-hidden bg-secondary ${ratio} ${className}`,
		children: imgError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: "Image unavailable"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt,
			loading: "lazy",
			decoding: "async",
			className: "size-full object-contain",
			onError: () => setImgError(true)
		})
	});
}
//#endregion
export { ProductImage as t };
