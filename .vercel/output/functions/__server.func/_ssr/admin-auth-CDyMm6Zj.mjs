import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BqLqHsRg.mjs";
import { l as stringType, s as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-auth-CDyMm6Zj.js
/**
* Server-side admin authentication.
*
* The admin password lives in a server-only env var (ADMIN_PASSWORD) — never
* exposed to the browser via VITE_*. The browser sends the candidate password
* to `verifyAdminPassword`, which compares it server-side and returns a
* short-lived signed session token. The token is stored client-side but is
* meaningless without the server validating it on every admin action.
*/
var SESSION_TTL_MS = 144e5;
function getAdminPassword() {
	return process.env["ADMIN_PASSWORD"] ?? null;
}
/**
* HMAC-signs a payload using the admin password as the secret key.
* Returns "timestamp.signature" or null if no password is configured.
*/
/** Verifies a token's signature and freshness. */
async function verifyAdminToken(token) {
	if (!token) return false;
	const secret = getAdminPassword();
	if (!secret) return false;
	const [tsStr, sigB64] = token.split(".");
	if (!tsStr || !sigB64) return false;
	const ts = Number(tsStr);
	if (!Number.isFinite(ts)) return false;
	if (Date.now() - ts > SESSION_TTL_MS) return false;
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["verify"]);
	const data = new TextEncoder().encode(tsStr);
	const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
	return crypto.subtle.verify("HMAC", key, sigBytes, data);
}
/** Server function: validates the admin password and returns a signed token. */
var verifyAdminPassword = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ password: stringType() }).parse(data)).handler(createSsrRpc("b55e2c835e66440d19bb5a9e3f2122f73191aa0a9bb745cd7d792488ef51c02e"));
/** Server function: checks whether a token is still valid. */
var checkAdminSession = createServerFn({ method: "GET" }).inputValidator((data) => objectType({ token: stringType() }).parse(data)).handler(createSsrRpc("68c4df23981e0f827710363da32eda85dbcd2d20fa245551f03ed964ccfda1d9"));
//#endregion
export { verifyAdminPassword as n, verifyAdminToken as r, checkAdminSession as t };
