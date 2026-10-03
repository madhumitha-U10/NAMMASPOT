import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { i as enumType, l as stringType, n as booleanType, s as objectType } from "../_libs/zod.mjs";
import { r as verifyAdminToken } from "./admin-auth-CDyMm6Zj.mjs";
import { t as createServerRpc } from "./createServerRpc-BazBrprW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-mutations-BPfdn_Qu.js
/**
* Server-side admin mutations that persist to Google Sheets.
*
* These use the Apps Script `update` action (Code.gs doPost) to update records
* by id. The admin token is validated before any write is performed.
*/
async function postToSheet(body) {
	const base = process.env["SHEETS_API_BASE"] ?? "https://script.google.com/macros/s/AKfycbxb7xpvnV6-ZGETWYVAm4boNPvhNdfDKeqsNcUjh9AySIN0qKd3OQS9Jzp-62-HLbUG9w/exec";
	const writeToken = process.env["SHEETS_WRITE_TOKEN"] ?? void 0;
	try {
		const res = await fetch(base, {
			method: "POST",
			redirect: "follow",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			body: JSON.stringify(writeToken ? {
				...body,
				token: writeToken
			} : body)
		});
		const text = await res.text();
		if (!res.ok) return {
			ok: false,
			error: `HTTP ${res.status}`
		};
		try {
			const parsed = JSON.parse(text);
			return parsed.success ? { ok: true } : {
				ok: false,
				error: parsed.error ?? "Write rejected"
			};
		} catch {
			return {
				ok: false,
				error: "Backend has no doPost handler yet"
			};
		}
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
}
var adminSetSellerStatus_createServerFn_handler = createServerRpc({
	id: "5e50111d0c54c550943c30e3bea0e9e2d7b8a98351680d1eb660caee7794a001",
	name: "adminSetSellerStatus",
	filename: "src/lib/admin-mutations.ts"
}, (opts) => adminSetSellerStatus.__executeServer(opts));
var adminSetSellerStatus = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	token: stringType(),
	sellerId: stringType(),
	status: enumType([
		"approved",
		"rejected",
		"pending"
	])
}).parse(data)).handler(adminSetSellerStatus_createServerFn_handler, async ({ data }) => {
	if (!await verifyAdminToken(data.token)) return {
		ok: false,
		error: "Unauthorized"
	};
	return postToSheet({
		action: "update",
		table: "sellers",
		data: {
			sellerId: data.sellerId,
			status: data.status
		}
	});
});
var adminSetReviewApproval_createServerFn_handler = createServerRpc({
	id: "eb8aa2e2085a6e2af92e6d001f721aa109be3294eceff78db4debd4485914f76",
	name: "adminSetReviewApproval",
	filename: "src/lib/admin-mutations.ts"
}, (opts) => adminSetReviewApproval.__executeServer(opts));
var adminSetReviewApproval = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	token: stringType(),
	reviewId: stringType(),
	approved: booleanType()
}).parse(data)).handler(adminSetReviewApproval_createServerFn_handler, async ({ data }) => {
	if (!await verifyAdminToken(data.token)) return {
		ok: false,
		error: "Unauthorized"
	};
	return postToSheet({
		action: "update",
		table: "reviews",
		data: {
			reviewId: data.reviewId,
			approved: data.approved
		}
	});
});
//#endregion
export { adminSetReviewApproval_createServerFn_handler, adminSetSellerStatus_createServerFn_handler };
