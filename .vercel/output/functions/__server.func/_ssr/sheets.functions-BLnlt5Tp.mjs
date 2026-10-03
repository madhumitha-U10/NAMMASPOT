import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { a as nullType, c as recordType, i as enumType, l as stringType, n as booleanType, o as numberType, s as objectType, t as arrayType, u as unionType } from "../_libs/zod.mjs";
import { t as SHEET_TABLES } from "./sheets-shared-MnWVK1Vr.mjs";
import { t as createServerRpc } from "./createServerRpc-BazBrprW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sheets.functions-BLnlt5Tp.js
var fetchSheetBundle_createServerFn_handler = createServerRpc({
	id: "3ec5636e65b79be808ec91ce418f89e9a5391fe251459c28cfc341e3a04b8f00",
	name: "fetchSheetBundle",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => fetchSheetBundle.__executeServer(opts));
var fetchSheetBundle = createServerFn({ method: "GET" }).inputValidator((data) => objectType({ tables: arrayType(enumType(SHEET_TABLES)).min(1).max(6) }).parse(data)).handler(fetchSheetBundle_createServerFn_handler, async ({ data }) => {
	const { readTables } = await import("./sheets-cache.server-SBNn7LeF.mjs");
	return readTables(data.tables);
});
var appendSheetRow_createServerFn_handler = createServerRpc({
	id: "8b676bc29047e390be87e7bbe85cc4c2e6f29673f8a640fcdb6fed21a71e2f5e",
	name: "appendSheetRow",
	filename: "src/lib/sheets.functions.ts"
}, (opts) => appendSheetRow.__executeServer(opts));
var appendSheetRow = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	action: enumType([
		"addSeller",
		"addProduct",
		"addCustomer",
		"addEnquiry",
		"addReview"
	]),
	row: recordType(stringType(), unionType([
		stringType(),
		numberType(),
		booleanType(),
		nullType()
	]))
}).parse(data)).handler(appendSheetRow_createServerFn_handler, async ({ data }) => {
	const base = process.env["SHEETS_API_BASE"] ?? "https://script.google.com/macros/s/AKfycbxb7xpvnV6-ZGETWYVAm4boNPvhNdfDKeqsNcUjh9AySIN0qKd3OQS9Jzp-62-HLbUG9w/exec";
	const writeToken = process.env["SHEETS_WRITE_TOKEN"] ?? void 0;
	try {
		const res = await fetch(base, {
			method: "POST",
			redirect: "follow",
			headers: { "Content-Type": "text/plain;charset=utf-8" },
			body: JSON.stringify(writeToken ? {
				action: data.action,
				data: data.row,
				token: writeToken
			} : {
				action: data.action,
				data: data.row
			})
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
});
//#endregion
export { appendSheetRow_createServerFn_handler, fetchSheetBundle_createServerFn_handler };
