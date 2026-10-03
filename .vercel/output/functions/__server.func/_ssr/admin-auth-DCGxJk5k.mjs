import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { l as stringType, s as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BazBrprW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-auth-DCGxJk5k.js
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
async function signToken(timestamp) {
	const secret = getAdminPassword();
	if (!secret) return null;
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const data = new TextEncoder().encode(String(timestamp));
	const sig = await crypto.subtle.sign("HMAC", key, data);
	return `${timestamp}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}
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
var verifyAdminPassword_createServerFn_handler = createServerRpc({
	id: "b55e2c835e66440d19bb5a9e3f2122f73191aa0a9bb745cd7d792488ef51c02e",
	name: "verifyAdminPassword",
	filename: "src/lib/admin-auth.ts"
}, (opts) => verifyAdminPassword.__executeServer(opts));
var verifyAdminPassword = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ password: stringType() }).parse(data)).handler(verifyAdminPassword_createServerFn_handler, async ({ data }) => {
	const expected = getAdminPassword();
	if (!expected) return {
		ok: false,
		error: "Admin access is not configured."
	};
	if (data.password !== expected) return {
		ok: false,
		error: "Invalid access code"
	};
	const token = await signToken(Date.now());
	if (!token) return {
		ok: false,
		error: "Could not create session."
	};
	return {
		ok: true,
		token
	};
});
var checkAdminSession_createServerFn_handler = createServerRpc({
	id: "68c4df23981e0f827710363da32eda85dbcd2d20fa245551f03ed964ccfda1d9",
	name: "checkAdminSession",
	filename: "src/lib/admin-auth.ts"
}, (opts) => checkAdminSession.__executeServer(opts));
var checkAdminSession = createServerFn({ method: "GET" }).inputValidator((data) => objectType({ token: stringType() }).parse(data)).handler(checkAdminSession_createServerFn_handler, async ({ data }) => {
	return { ok: await verifyAdminToken(data.token) };
});
//#endregion
export { checkAdminSession_createServerFn_handler, verifyAdminPassword_createServerFn_handler };
