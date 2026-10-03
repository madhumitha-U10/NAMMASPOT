import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { l as stringType, s as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BazBrprW.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-auth-server-CAiYm-LH.js
/**
* Server-side seller authorization.
*
* Verifies that the currently signed-in Supabase user owns the seller profile
* they're trying to access. Prevents localStorage/URL manipulation from
* granting access to another seller's dashboard.
*/
var getAuthorizedSellerId_createServerFn_handler = createServerRpc({
	id: "b36d55f1c6f10cc0be429935143053aa9e87e506fa37eb9c3fb8683d1f1195d9",
	name: "getAuthorizedSellerId",
	filename: "src/lib/seller-auth-server.ts"
}, (opts) => getAuthorizedSellerId.__executeServer(opts));
var getAuthorizedSellerId = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ sellerId: stringType() }).parse(data)).handler(getAuthorizedSellerId_createServerFn_handler, async ({ data }) => {
	const SUPABASE_URL = process.env["SUPABASE_URL"];
	const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { ok: false };
	const authHeader = (await import("./server-VOINEUhV.mjs").then((m) => m.getRequest()))?.headers?.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return { ok: false };
	const token = authHeader.replace("Bearer ", "");
	if (!token || token.split(".").length !== 3) return { ok: false };
	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
	const { data: userData, error } = await supabase.auth.getUser(token);
	if (error || !userData.user) return { ok: false };
	const { data: account } = await supabase.from("seller_accounts").select("seller_id").eq("user_id", userData.user.id).maybeSingle();
	if (!account?.seller_id) return { ok: false };
	if (account.seller_id !== data.sellerId) return { ok: false };
	return {
		ok: true,
		sellerId: account.seller_id
	};
});
//#endregion
export { getAuthorizedSellerId_createServerFn_handler };
