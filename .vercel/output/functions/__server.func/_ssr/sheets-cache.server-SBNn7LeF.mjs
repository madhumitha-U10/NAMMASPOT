//#region node_modules/.nitro/vite/services/ssr/assets/sheets-cache.server-SBNn7LeF.js
var TTL = 18e4;
var store = /* @__PURE__ */ new Map();
async function fetchTable(table) {
	const base = process.env["SHEETS_API_BASE"] ?? "https://script.google.com/macros/s/AKfycbxb7xpvnV6-ZGETWYVAm4boNPvhNdfDKeqsNcUjh9AySIN0qKd3OQS9Jzp-62-HLbUG9w/exec";
	const res = await fetch(`${base}?action=${table}`, {
		redirect: "follow",
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(25e3)
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const parsed = JSON.parse(text);
	if (!parsed.success || !Array.isArray(parsed.data)) throw new Error(parsed.error ?? "Unexpected response");
	return parsed.data;
}
/** Reads tables sequentially, serving anything still fresh from memory. */
async function readTables(tables) {
	const rows = {};
	let error;
	for (const table of tables) {
		const hit = store.get(table);
		if (hit && Date.now() - hit.at < TTL) {
			rows[table] = hit.rows;
			continue;
		}
		try {
			const fresh = await fetchTable(table);
			store.set(table, {
				at: Date.now(),
				rows: fresh
			});
			rows[table] = fresh;
		} catch (err) {
			rows[table] = hit?.rows ?? [];
			error = `${table}: ${String(err)}`;
		}
	}
	return {
		rows,
		error
	};
}
//#endregion
export { readTables };
