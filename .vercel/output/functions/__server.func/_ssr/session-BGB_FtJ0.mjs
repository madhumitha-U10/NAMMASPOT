//#region node_modules/.nitro/vite/services/ssr/assets/session-BGB_FtJ0.js
/**
* Seller session + admin session storage.
*
* The seller session id is stored client-side for UI routing only — every
* data access that matters goes through the Supabase auth token (which is
* validated server-side). The admin session is a signed token from the server
* that is validated on every admin action.
*/
var SELLER_KEY = "nammaspot.session";
var ADMIN_KEY = "nammaspot.admin.token";
function setSession(sellerId) {
	if (typeof window !== "undefined") window.localStorage.setItem(SELLER_KEY, sellerId);
}
function getSession() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(SELLER_KEY);
}
function clearSession() {
	if (typeof window !== "undefined") window.localStorage.removeItem(SELLER_KEY);
}
function setAdminToken(token) {
	if (typeof window !== "undefined") window.localStorage.setItem(ADMIN_KEY, token);
}
function getAdminToken() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(ADMIN_KEY);
}
function clearAdminToken() {
	if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_KEY);
}
//#endregion
export { setAdminToken as a, getSession as i, clearSession as n, setSession as o, getAdminToken as r, clearAdminToken as t };
