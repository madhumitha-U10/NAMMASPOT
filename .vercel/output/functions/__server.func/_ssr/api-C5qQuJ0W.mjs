import { a as createServerFn } from "./server-Bv2AFQcz.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BqLqHsRg.mjs";
import { a as nullType, c as recordType, i as enumType, l as stringType, n as booleanType, o as numberType, s as objectType, t as arrayType, u as unionType } from "../_libs/zod.mjs";
import { t as SHEET_TABLES } from "./sheets-shared-MnWVK1Vr.mjs";
import { i as CATEGORIES, o as STORIES } from "./router-DB73OFJI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-C5qQuJ0W.js
/**
* Server-side proxy to the NammaSpot Google Apps Script Web App.
* Keeps the browser free of CORS/redirect issues.
*
* Reads (GET):  ?action=sellers|products|categories|customers|enquiries|reviews
* Writes (POST): { action: "addEnquiry" | "addSeller" | "addProduct" | ..., data }
*                — enabled once doPost exists in the Apps Script (backend/Code.gs).
*/
/**
* Fetches several tabs in ONE round-trip. Apps Script executes requests from a
* single user serially, so parallel client calls queue up and time out — this
* walks the tables sequentially on the server instead.
*/
var fetchSheetBundle = createServerFn({ method: "GET" }).inputValidator((data) => objectType({ tables: arrayType(enumType(SHEET_TABLES)).min(1).max(6) }).parse(data)).handler(createSsrRpc("3ec5636e65b79be808ec91ce418f89e9a5391fe251459c28cfc341e3a04b8f00"));
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
}).parse(data)).handler(createSsrRpc("8b676bc29047e390be87e7bbe85cc4c2e6f29673f8a640fcdb6fed21a71e2f5e"));
/**
* Maps Google Sheets rows (via the Apps Script Web App) onto the app's
* domain types. The UI never sees sheet field names — only this file does.
*
* Live tables: Sellers, Products, Categories.
* Prepared for later: Customers, Enquiries, Reviews (already read + mapped,
* currently empty in the sheet).
*/
var str = (v, fallback = "") => v === void 0 || v === null || v === "" ? fallback : String(v).trim();
var num = (v, fallback = 0) => {
	const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, ""));
	return Number.isFinite(n) ? n : fallback;
};
var bool = (v) => /^(true|yes|1|y)$/i.test(String(v ?? "").trim());
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
var pick = (row, ...keys) => {
	for (const k of keys) {
		const hit = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase());
		if (hit && row[hit] !== "" && row[hit] !== null && row[hit] !== void 0) return row[hit];
	}
};
var emptyRemote = {
	categories: [],
	sellers: [],
	products: [],
	customers: [],
	enquiries: [],
	reviews: [],
	error: null
};
function mapCategory(row) {
	const name = str(pick(row, "name", "category", "categoryName"), "Category");
	const seedMatch = CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === slugify(name));
	return {
		id: str(pick(row, "categoryId", "id"), slugify(name)),
		name,
		tamilName: str(pick(row, "tamilName"), seedMatch?.tamilName ?? ""),
		slug: str(pick(row, "slug"), slugify(name)),
		blurb: str(pick(row, "description", "blurb"), seedMatch?.blurb ?? "")
	};
}
function mapProduct(row) {
	const type = str(pick(row, "type"), "product").toLowerCase() === "service" ? "service" : "product";
	return {
		id: str(pick(row, "productId", "id"), `p_${Math.random().toString(36).slice(2, 8)}`),
		sellerId: str(pick(row, "sellerId", "seller")),
		name: str(pick(row, "name", "productName"), "Item"),
		type,
		price: num(pick(row, "price")),
		unit: str(pick(row, "unit"), type === "service" ? "per booking" : "each"),
		description: str(pick(row, "description")),
		views: num(pick(row, "views")),
		active: pick(row, "active") === void 0 ? true : bool(pick(row, "active")),
		imageUrl: str(pick(row, "imageUrl", "image", "photo")) || void 0
	};
}
function mapSeller(row, categories) {
	const name = str(pick(row, "name", "businessName"), "Seller");
	const categoryName = str(pick(row, "category", "categoryName"));
	const categoryId = str(pick(row, "categoryId")) || categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName)?.id || categories[0]?.id || "";
	const description = str(pick(row, "description", "about"));
	const location = str(pick(row, "location", "area"), "Chennai");
	const statusRaw = str(pick(row, "status"), "approved").toLowerCase();
	const status = statusRaw === "pending" || statusRaw === "rejected" ? statusRaw : "approved";
	return {
		id: str(pick(row, "sellerId", "id"), slugify(name)),
		slug: str(pick(row, "slug"), slugify(name)),
		businessName: name,
		ownerName: str(pick(row, "ownerName", "owner"), name),
		categoryId,
		tagline: str(pick(row, "tagline"), description.slice(0, 110)),
		about: description,
		area: location,
		city: str(pick(row, "city"), location),
		instagram: str(pick(row, "instagram")).replace(/^@/, ""),
		whatsapp: str(pick(row, "whatsapp", "phone")).replace(/[^0-9]/g, ""),
		email: str(pick(row, "email")),
		rating: num(pick(row, "rating")),
		reviewCount: num(pick(row, "reviewCount")),
		priceFrom: num(pick(row, "priceFrom", "startingPrice")),
		featured: bool(pick(row, "featured")),
		status,
		createdAt: str(pick(row, "createdAt", "date"), today()).slice(0, 10),
		deliversAcrossCity: pick(row, "deliversAcrossCity") === void 0 ? true : bool(pick(row, "deliversAcrossCity")),
		tags: str(pick(row, "tags")).split(/[,|]/).map((t) => t.trim()).filter(Boolean),
		imageUrl: str(pick(row, "imageUrl", "image", "photo", "logo")) || void 0,
		coverUrl: str(pick(row, "coverUrl", "cover", "bannerUrl")) || void 0
	};
}
function mapCustomer(row) {
	return {
		id: str(pick(row, "customerId", "id"), `cu_${Math.random().toString(36).slice(2, 8)}`),
		name: str(pick(row, "name", "customerName"), "Customer"),
		phone: str(pick(row, "phone", "whatsapp")),
		area: str(pick(row, "area", "location"), "—"),
		createdAt: str(pick(row, "createdAt", "date"), today()).slice(0, 10),
		avatarUrl: str(pick(row, "imageUrl", "photo", "avatarUrl")) || void 0
	};
}
function mapEnquiry(row) {
	const statusRaw = str(pick(row, "status"), "new").toLowerCase();
	return {
		id: str(pick(row, "enquiryId", "id"), `e_${Math.random().toString(36).slice(2, 8)}`),
		sellerId: str(pick(row, "sellerId")),
		productId: str(pick(row, "productId")) || null,
		customerName: str(pick(row, "customerName", "name"), "Customer"),
		phone: str(pick(row, "phone", "whatsapp")),
		eventDate: str(pick(row, "eventDate", "date")).slice(0, 10),
		message: str(pick(row, "message", "notes")),
		status: statusRaw === "responded" || statusRaw === "closed" ? statusRaw : "new",
		createdAt: str(pick(row, "createdAt"), today()).slice(0, 10)
	};
}
function mapReview(row) {
	return {
		id: str(pick(row, "reviewId", "id"), `r_${Math.random().toString(36).slice(2, 8)}`),
		sellerId: str(pick(row, "sellerId")),
		customerName: str(pick(row, "customerName", "name"), "Customer"),
		rating: num(pick(row, "rating"), 5),
		comment: str(pick(row, "comment", "review", "message")),
		createdAt: str(pick(row, "createdAt", "date"), today()).slice(0, 10),
		approved: pick(row, "approved") === void 0 ? true : bool(pick(row, "approved"))
	};
}
function derive(data) {
	const approvedReviews = data.reviews.filter((r) => r.approved);
	const sellers = data.sellers.map((s) => {
		const mine = approvedReviews.filter((r) => r.sellerId === s.id);
		const rating = mine.length ? Math.round(mine.reduce((a, r) => a + r.rating, 0) / mine.length * 10) / 10 : s.rating;
		const prices = data.products.filter((p) => p.sellerId === s.id && p.active && p.price > 0).map((p) => p.price);
		return {
			...s,
			rating,
			reviewCount: mine.length || s.reviewCount,
			priceFrom: s.priceFrom || (prices.length ? Math.min(...prices) : 0)
		};
	});
	const withFeatured = sellers.some((s) => s.featured) ? sellers : sellers.map((s, i) => ({
		...s,
		featured: i < Math.min(6, sellers.length)
	}));
	return {
		...data,
		sellers: withFeatured
	};
}
var CACHE_KEY = "nammaspot.sheets.cache.v1";
var CACHE_TTL = 3e5;
function readCache() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function writeCache(rows) {
	if (typeof window === "undefined") return;
	try {
		const prev = readCache()?.rows ?? {};
		window.localStorage.setItem(CACHE_KEY, JSON.stringify({
			at: Date.now(),
			rows: {
				...prev,
				...rows
			}
		}));
	} catch {}
}
function build(rows, error) {
	const categories = (rows["categories"] ?? []).map(mapCategory);
	return derive({
		categories,
		sellers: (rows["sellers"] ?? []).map((r) => mapSeller(r, categories)),
		products: (rows["products"] ?? []).map(mapProduct),
		customers: (rows["customers"] ?? []).map(mapCustomer),
		enquiries: (rows["enquiries"] ?? []).map(mapEnquiry),
		reviews: (rows["reviews"] ?? []).map(mapReview),
		error
	});
}
var cache = null;
var rawRows = {};
var inflight = null;
function remoteSnapshot() {
	return cache ?? emptyRemote;
}
var CORE = [
	"categories",
	"sellers",
	"products"
];
var SECONDARY = [
	"customers",
	"enquiries",
	"reviews"
];
/**
* Loads the sheet data. Apps Script handles one request at a time per user, so
* everything goes through a single bundled server call, backed by a short-lived
* localStorage cache for instant page-to-page navigation.
*/
function loadRemote(force = false) {
	if (!force && cache) return Promise.resolve(cache);
	if (!force && inflight) return inflight;
	const cached = readCache();
	if (!force && cached && Date.now() - cached.at < CACHE_TTL && (cached.rows["sellers"]?.length ?? 0) >= 0) {
		rawRows = cached.rows;
		cache = build(rawRows, null);
		if (Date.now() - cached.at > 6e4) revalidate();
		return Promise.resolve(cache);
	}
	inflight = (async () => {
		try {
			const core = await fetchSheetBundle({ data: { tables: CORE } });
			rawRows = {
				...rawRows,
				...core.rows
			};
			writeCache(core.rows);
			cache = build(rawRows, core.error ?? null);
			fetchSheetBundle({ data: { tables: SECONDARY } }).then((extra) => {
				rawRows = {
					...rawRows,
					...extra.rows
				};
				writeCache(extra.rows);
				cache = build(rawRows, cache?.error ?? null);
			}).catch(() => void 0);
		} catch (err) {
			cache = {
				...emptyRemote,
				error: String(err)
			};
		} finally {
			inflight = null;
		}
		return cache;
	})();
	return inflight;
}
async function revalidate() {
	try {
		const fresh = await fetchSheetBundle({ data: { tables: [...CORE, ...SECONDARY] } });
		rawRows = {
			...rawRows,
			...fresh.rows
		};
		writeCache(fresh.rows);
		cache = build(rawRows, fresh.error ?? null);
	} catch {}
}
/**
* Server-side admin mutations that persist to Google Sheets.
*
* These use the Apps Script `update` action (Code.gs doPost) to update records
* by id. The admin token is validated before any write is performed.
*/
var adminSetSellerStatus = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	token: stringType(),
	sellerId: stringType(),
	status: enumType([
		"approved",
		"rejected",
		"pending"
	])
}).parse(data)).handler(createSsrRpc("5e50111d0c54c550943c30e3bea0e9e2d7b8a98351680d1eb660caee7794a001"));
var adminSetReviewApproval = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	token: stringType(),
	reviewId: stringType(),
	approved: booleanType()
}).parse(data)).handler(createSsrRpc("eb8aa2e2085a6e2af92e6d001f721aa109be3294eceff78db4debd4485914f76"));
/**
* NammaSpot data access layer (the only place the app talks to "the backend").
*
* Reads: live Google Sheets data through the Apps Script Web App
* (src/lib/sheets.functions.ts -> src/lib/remote.ts).
* Writes: applied instantly to a localStorage overlay so the UI stays snappy,
* and mirrored to the sheet best-effort via `appendSheetRow` (which starts
* working the moment doPost exists in the Apps Script — see backend/Code.gs).
*/
/** Loads Sellers/Products/Categories (and the prepared Customers/Enquiries/
* Reviews tables) from the Google Sheets backend. Safe to call repeatedly. */
var ensureData = (force = false) => loadRemote(force);
var KEY = "nammaspot.store.v1";
var emptyOverlay = {
	sellers: [],
	products: [],
	enquiries: [],
	reviews: [],
	customers: [],
	statusOverrides: {},
	reviewApprovals: {},
	productImages: {},
	customerAvatars: {},
	sellerImages: {}
};
function readOverlay() {
	if (typeof window === "undefined") return emptyOverlay;
	try {
		const raw = window.localStorage.getItem(KEY);
		return raw ? {
			...emptyOverlay,
			...JSON.parse(raw)
		} : emptyOverlay;
	} catch {
		return emptyOverlay;
	}
}
function writeOverlay(next) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(next));
}
function mutate(fn) {
	const o = readOverlay();
	fn(o);
	writeOverlay(o);
}
var id = (prefix) => `${prefix}${Date.now().toString(36)}`;
/**
* Normalises any picked image value into something safe to persist.
*
* - Cloud storage objects become the stable proxy path (`/api/public/media/...`)
*   so links never expire.
* - Hosted `https://` images and locally compressed data URLs pass through.
* - Anything else (blob: object URLs, junk) is dropped, because those die with
*   the page and would render as a broken image after a refresh.
*/
function normalizeImageUrl(url) {
	const value = (url ?? "").trim();
	if (!value) return "";
	if (value.startsWith("/api/public/media/")) return value;
	if (value.startsWith("data:image/")) return value;
	const storage = value.match(/\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^?#]+)/i);
	if (storage?.[1]) return `/api/public/media/${storage[1]}`;
	if (/^https?:\/\//i.test(value)) return value;
	return "";
}
/** Resolve a stored value for rendering, with an optional fallback image. */
function getImageUrl(url, fallback = "") {
	return normalizeImageUrl(url) || fallback;
}
/**
* Housekeeping: drops overlay image entries whose value can no longer be
* rendered (legacy `blob:` URLs from older builds, empty strings, etc.).
* Returns the number of entries removed.
*/
function cleanupExpiredImages() {
	let removed = 0;
	mutate((o) => {
		for (const map of [
			o.sellerImages,
			o.productImages,
			o.customerAvatars
		]) for (const [key, value] of Object.entries(map)) {
			const next = normalizeImageUrl(value);
			if (!next) {
				delete map[key];
				removed += 1;
			} else if (next !== value) map[key] = next;
		}
	});
	return removed;
}
/** Mirror a write to Google Sheets. Never blocks or breaks the UI. */
function mirror(action, row) {
	appendSheetRow({ data: {
		action,
		row
	} }).catch(() => void 0);
}
function allSellers() {
	const o = readOverlay();
	const byId = /* @__PURE__ */ new Map();
	for (const s of [...remoteSnapshot().sellers, ...o.sellers]) byId.set(s.id, {
		...s,
		status: o.statusOverrides[s.id] ?? s.status,
		imageUrl: getImageUrl(o.sellerImages[s.id] ?? s.imageUrl) || void 0
	});
	return [...byId.values()];
}
function allProducts() {
	const o = readOverlay();
	return [...remoteSnapshot().products, ...o.products].map((p) => ({
		...p,
		imageUrl: getImageUrl(o.productImages[p.id] ?? p.imageUrl) || void 0
	}));
}
function allEnquiries() {
	return [...readOverlay().enquiries, ...remoteSnapshot().enquiries];
}
function allReviews() {
	const o = readOverlay();
	return [...remoteSnapshot().reviews, ...o.reviews].map((r) => ({
		...r,
		approved: o.reviewApprovals[r.id] ?? r.approved
	}));
}
function allCustomers() {
	const o = readOverlay();
	return [...remoteSnapshot().customers, ...o.customers].map((c) => ({
		...c,
		avatarUrl: getImageUrl(o.customerAvatars[c.id] ?? c.avatarUrl) || void 0
	}));
}
var categories = () => remoteSnapshot().categories;
/** Stories are editorial content (no sheet tab yet) — attached to live sellers. */
function stories() {
	const sellers = approvedSellers();
	if (!sellers.length) return [];
	return STORIES.map((st, i) => ({
		...st,
		sellerId: sellers[i % sellers.length].id
	}));
}
var approvedSellers = () => allSellers().filter((s) => s.status === "approved");
var sellerBySlug = (slug) => allSellers().find((s) => s.slug === slug);
var sellerById = (sid) => allSellers().find((s) => s.id === sid);
var categoryById = (cid) => categories().find((c) => c.id === cid);
var productsBySeller = (sid) => allProducts().filter((p) => p.sellerId === sid && p.active);
var reviewsBySeller = (sid) => allReviews().filter((r) => r.sellerId === sid && r.approved);
var enquiriesBySeller = (sid) => allEnquiries().filter((e) => e.sellerId === sid);
var storiesBySeller = (sid) => stories().filter((s) => s.sellerId === sid);
var BASE_AREAS = [
	"Mylapore",
	"Adyar",
	"Besant Nagar",
	"T Nagar",
	"Anna Nagar",
	"Velachery",
	"Kodambakkam",
	"Villivakkam",
	"Tambaram",
	"Coimbatore",
	"Madurai"
];
/** Areas from live seller data, merged with the known Chennai/TN list. */
function areas() {
	const live = allSellers().flatMap((s) => [s.area, s.city]).filter(Boolean);
	return Array.from(/* @__PURE__ */ new Set([...live, ...BASE_AREAS]));
}
/**
* Tamil (and Tanglish) search terms mapped to the English words that actually
* appear in seller data, so "கேக்" / "maruthani" find the right makers.
*/
var TAMIL_SYNONYMS = [
	[/கேக்|கேக|cake|கேக்ஸ்/i, "cake bakery baker dessert"],
	[/மருதாணி|மெஹந்தி|maruthani|mehendi|henna/i, "mehendi henna bridal"],
	[/மணப்பெண்|திருமண|bridal|kalyanam|கல்யாண/i, "bridal wedding makeup"],
	[/ஒப்பனை|makeup|மேக்கப்/i, "makeup bridal"],
	[/பூ|flower|மாலை/i, "flower garland decor"],
	[/பரிசு|gift|கிஃப்ட்/i, "gift hamper gifting"],
	[/புடவை|சேலை|saree|boutique|ஆடை/i, "saree boutique clothing fashion"],
	[/ஓவியம்|painting|art|கலை/i, "art artist painting portrait"],
	[/அலங்கார|decor|டெக்கார்/i, "decor handmade craft"],
	[/பின்னல்|crochet|கிரோஷே/i, "crochet knit yarn"],
	[/சென்னை/i, "chennai"],
	[/உணவு|food|சமையல்|snack|தின்பண்ட/i, "food snacks bakes"]
];
function expandQuery(q) {
	const terms = [q];
	for (const [re, english] of TAMIL_SYNONYMS) if (re.test(q)) terms.push(...english.split(" "));
	return terms;
}
function searchSellers(f) {
	const q = (f.q ?? "").trim().toLowerCase();
	const terms = q ? expandQuery(q) : [];
	const products = allProducts();
	let list = approvedSellers().filter((s) => {
		if (f.category && categoryById(s.categoryId)?.slug !== f.category) return false;
		if (f.area && s.area !== f.area && s.city !== f.area) return false;
		if (f.minRating && s.rating < f.minRating) return false;
		if (f.maxPrice && s.priceFrom > f.maxPrice) return false;
		if (!q) return true;
		const category = categoryById(s.categoryId);
		const hay = [
			s.businessName,
			s.ownerName,
			s.tagline,
			s.about,
			s.area,
			s.city,
			s.instagram,
			s.tags.join(" "),
			category?.name ?? "",
			category?.tamilName ?? "",
			category?.slug ?? "",
			products.filter((p) => p.sellerId === s.id).map((p) => `${p.name} ${p.description}`).join(" ")
		].join(" ").toLowerCase();
		return terms.some((t) => t && hay.includes(t));
	});
	switch (f.sort) {
		case "rating":
			list = list.sort((a, b) => b.rating - a.rating);
			break;
		case "price-low":
			list = list.sort((a, b) => a.priceFrom - b.priceFrom);
			break;
		case "newest":
			list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
			break;
		default: list = list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
	}
	return list;
}
function createEnquiry(input) {
	const enquiry = {
		...input,
		id: id("e_"),
		status: "new",
		createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	};
	mutate((o) => {
		o.enquiries.unshift(enquiry);
		if (!allCustomers().some((c) => c.phone === input.phone)) o.customers.unshift({
			id: id("cu_"),
			name: input.customerName,
			phone: input.phone,
			area: "—",
			createdAt: enquiry.createdAt
		});
	});
	mirror("addEnquiry", {
		enquiryId: enquiry.id,
		sellerId: enquiry.sellerId,
		productId: enquiry.productId ?? "",
		customerName: enquiry.customerName,
		phone: enquiry.phone,
		eventDate: enquiry.eventDate,
		message: enquiry.message,
		status: enquiry.status,
		createdAt: enquiry.createdAt
	});
	return enquiry;
}
function registerSeller(input) {
	const imageUrl = normalizeImageUrl(input.imageUrl);
	const { imageUrl: _picked, ...rest } = input;
	const seller = {
		...rest,
		id: id("s_"),
		slug: input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
		rating: 0,
		reviewCount: 0,
		featured: false,
		status: "pending",
		createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		deliversAcrossCity: true,
		tags: []
	};
	mutate((o) => {
		o.sellers.unshift(seller);
		if (imageUrl) o.sellerImages[seller.id] = imageUrl;
	});
	mirror("addSeller", {
		sellerId: seller.id,
		name: seller.businessName,
		ownerName: seller.ownerName,
		category: categoryById(seller.categoryId)?.name ?? "",
		description: seller.about,
		tagline: seller.tagline,
		phone: seller.whatsapp,
		whatsapp: seller.whatsapp,
		instagram: `@${seller.instagram}`,
		email: seller.email,
		location: seller.area,
		city: seller.city,
		priceFrom: seller.priceFrom,
		status: seller.status,
		createdAt: seller.createdAt,
		imageUrl: imageUrl && /^https?:/i.test(imageUrl) ? imageUrl : ""
	});
	return {
		...seller,
		...imageUrl ? { imageUrl } : {}
	};
}
/** Re-adds a seller profile to this browser's store (used after login on a new device). */
function restoreSellerProfile(seller) {
	if (allSellers().some((s) => s.id === seller.id)) return;
	mutate((o) => o.sellers.unshift(seller));
}
function addProduct(input) {
	const product = {
		...input,
		id: id("p_"),
		views: 0,
		active: true
	};
	const imageUrl = normalizeImageUrl(product.imageUrl);
	const { imageUrl: _picked, ...rest } = product;
	mutate((o) => {
		o.products.unshift(rest);
		if (imageUrl) o.productImages[product.id] = imageUrl;
	});
	mirror("addProduct", {
		productId: product.id,
		sellerId: product.sellerId,
		name: product.name,
		description: product.description,
		price: product.price,
		type: product.type,
		unit: product.unit,
		category: categoryById(sellerById(product.sellerId)?.categoryId ?? "")?.name ?? "",
		imageUrl: imageUrl && /^https?:/i.test(imageUrl) ? imageUrl : ""
	});
	return product;
}
/** Attach / change a seller profile photo. */
function setSellerImage(sellerId, url) {
	const next = normalizeImageUrl(url);
	mutate((o) => {
		if (next) o.sellerImages[sellerId] = next;
		else delete o.sellerImages[sellerId];
	});
}
function removeSellerImage(sellerId) {
	mutate((o) => {
		delete o.sellerImages[sellerId];
	});
}
async function setSellerStatus(sellerId, status, adminToken) {
	if (!adminToken) throw new Error("Admin authorization required");
	const result = await adminSetSellerStatus({ data: {
		token: adminToken,
		sellerId,
		status
	} });
	if (!result.ok) throw new Error(result.error ?? "Could not update seller status");
	mutate((o) => {
		o.statusOverrides[sellerId] = status;
	});
}
async function setReviewApproval(reviewId, approved, adminToken) {
	if (!adminToken) throw new Error("Admin authorization required");
	const result = await adminSetReviewApproval({ data: {
		token: adminToken,
		reviewId,
		approved
	} });
	if (!result.ok) throw new Error(result.error ?? "Could not update review");
	mutate((o) => {
		o.reviewApprovals[reviewId] = approved;
	});
}
/** Update an existing product's details (name, price, unit, description, type). */
function updateProduct(productId, patch) {
	mutate((o) => {
		const local = o.products.find((p) => p.id === productId);
		if (local) Object.assign(local, patch);
	});
}
/** Permanently remove a product from the seller's catalogue. */
function deleteProduct(productId) {
	mutate((o) => {
		o.products = o.products.filter((p) => p.id !== productId);
		delete o.productImages[productId];
	});
}
/** Attach / change a catalogue photo for an existing product. */
function setProductImage(productId, url) {
	const next = normalizeImageUrl(url);
	mutate((o) => {
		if (next) o.productImages[productId] = next;
		else delete o.productImages[productId];
	});
}
/** Attach / change a customer profile picture (optional). */
function setCustomerAvatar(customerId, url) {
	const next = normalizeImageUrl(url);
	mutate((o) => {
		if (next) o.customerAvatars[customerId] = next;
		else delete o.customerAvatars[customerId];
	});
}
var inr = (n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
//#endregion
export { setSellerStatus as A, searchSellers as C, setProductImage as D, setCustomerAvatar as E, storiesBySeller as M, updateProduct as N, setReviewApproval as O, reviewsBySeller as S, sellerBySlug as T, normalizeImageUrl as _, allReviews as a, removeSellerImage as b, areas as c, cleanupExpiredImages as d, createEnquiry as f, inr as g, ensureData as h, allProducts as i, stories as j, setSellerImage as k, categories as l, enquiriesBySeller as m, allCustomers as n, allSellers as o, deleteProduct as p, allEnquiries as r, approvedSellers as s, addProduct as t, categoryById as u, productsBySeller as v, sellerById as w, restoreSellerProfile as x, registerSeller as y };
