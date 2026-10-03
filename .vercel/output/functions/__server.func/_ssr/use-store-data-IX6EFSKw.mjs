import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as cleanupExpiredImages, h as ensureData } from "./api-C5qQuJ0W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-store-data-IX6EFSKw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var cleanedUp = false;
/**
* Client-side data hook. Sellers/Products/Categories come from the Google
* Sheets backend (fetched once, cached), merged with the localStorage overlay
* for local writes — neither is available during SSR, so data resolves after
* hydration.
*/
function useStoreData(load) {
	const [data, setData] = (0, import_react.useState)(null);
	const refresh = (0, import_react.useCallback)(() => {
		ensureData().then(() => setData(load()));
	}, []);
	(0, import_react.useEffect)(() => {
		let alive = true;
		if (!cleanedUp) {
			cleanedUp = true;
			cleanupExpiredImages();
		}
		ensureData().then(() => {
			if (alive) setData(load());
		}, () => {
			if (alive) setData(load());
		});
		return () => {
			alive = false;
		};
	}, []);
	return {
		data,
		refresh
	};
}
//#endregion
export { useStoreData as t };
