import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as __exportAll } from "./server-Bv2AFQcz.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-Csu2xUx6.js
var CATEGORIES = [
	{
		id: "c1",
		name: "Home Bakers",
		tamilName: "வீட்டு பேக்கிங்",
		slug: "home-bakers",
		blurb: "Custom cakes, brownies and teatime bakes from home kitchens."
	},
	{
		id: "c2",
		name: "Mehendi Artists",
		tamilName: "மருதாணி",
		slug: "mehendi",
		blurb: "Bridal and festive henna, booked directly with the artist."
	},
	{
		id: "c3",
		name: "Makeup & Bridal",
		tamilName: "மேக்கப்",
		slug: "makeup-bridal",
		blurb: "Muhurtham, reception and engagement styling."
	},
	{
		id: "c4",
		name: "Crochet & Knits",
		tamilName: "கிரோஷே",
		slug: "crochet",
		blurb: "Handmade amigurumi, bags and slow-made softies."
	},
	{
		id: "c5",
		name: "Artists & Prints",
		tamilName: "ஓவியம்",
		slug: "artists",
		blurb: "Portraits, Tanjore-inspired work and city prints."
	},
	{
		id: "c6",
		name: "Boutiques",
		tamilName: "பூட்டிக்",
		slug: "boutiques",
		blurb: "Kanchipuram, cotton drapes and small-batch labels."
	},
	{
		id: "c7",
		name: "Handmade & Decor",
		tamilName: "கைவினை",
		slug: "handmade-decor",
		blurb: "Terracotta, brass, kolam art and festival decor."
	},
	{
		id: "c8",
		name: "Gifting & Hampers",
		tamilName: "பரிசு",
		slug: "gifting",
		blurb: "Seer varisai trays, return gifts and curated hampers."
	}
];
var SELLERS = [
	{
		id: "s1",
		slug: "amma-veedu-bakes",
		businessName: "Amma Veedu Bakes",
		ownerName: "Aishwarya R",
		categoryId: "c1",
		tagline: "Filter-coffee tres leches & Chennai teatime bakes",
		about: "A two-oven home kitchen in Mylapore baking eggless cakes, brownies and teatime treats with local flavours — filter coffee, jaggery, nendran banana. Orders taken 3 days in advance.",
		area: "Mylapore",
		city: "Chennai",
		instagram: "ammaveedubakes",
		whatsapp: "919840112233",
		email: "hello@ammaveedubakes.in",
		rating: 4.9,
		reviewCount: 132,
		priceFrom: 450,
		featured: true,
		status: "approved",
		createdAt: "2024-11-02",
		deliversAcrossCity: true,
		tags: [
			"Eggless",
			"Custom cakes",
			"Same-day brownies"
		]
	},
	{
		id: "s2",
		slug: "kolam-henna-studio",
		businessName: "Kolam Henna Studio",
		ownerName: "Divya Lakshmi",
		categoryId: "c2",
		tagline: "Bridal mehendi rooted in kolam motifs",
		about: "Bridal and festive henna in Adyar since 2016. Organic paste, kolam-inspired negative space work, and full bridal packages including the pattu-saree side of the family.",
		area: "Adyar",
		city: "Chennai",
		instagram: "kolamhennastudio",
		whatsapp: "919841556677",
		email: "book@kolamhenna.in",
		rating: 4.8,
		reviewCount: 96,
		priceFrom: 1500,
		featured: true,
		status: "approved",
		createdAt: "2024-09-18",
		deliversAcrossCity: true,
		tags: [
			"Organic paste",
			"Bridal",
			"Home visits"
		]
	},
	{
		id: "s3",
		slug: "muhurtham-by-shruthi",
		businessName: "Muhurtham by Shruthi",
		ownerName: "Shruthi Narayanan",
		categoryId: "c3",
		tagline: "HD bridal makeup for South Indian weddings",
		about: "Airbrush and HD bridal makeup specialising in muhurtham looks, kondai styling and jadai alangaram. Travels across Tamil Nadu for wedding weeks.",
		area: "Besant Nagar",
		city: "Chennai",
		instagram: "muhurthambyshruthi",
		whatsapp: "919003445566",
		email: "shruthi@muhurtham.in",
		rating: 4.9,
		reviewCount: 74,
		priceFrom: 12e3,
		featured: true,
		status: "approved",
		createdAt: "2025-01-11",
		deliversAcrossCity: true,
		tags: [
			"HD & airbrush",
			"Jadai alangaram",
			"Outstation"
		]
	},
	{
		id: "s4",
		slug: "nool-crochet",
		businessName: "Nool Crochet Co",
		ownerName: "Meenakshi S",
		categoryId: "c4",
		tagline: "Slow-made crochet from a T Nagar balcony",
		about: "Handmade amigurumi, market totes and baby sets crocheted in soft cotton. Every piece takes days, not minutes — made to order in small batches.",
		area: "T Nagar",
		city: "Chennai",
		instagram: "noolcrochet",
		whatsapp: "919789223344",
		email: "nool@crochet.in",
		rating: 4.7,
		reviewCount: 58,
		priceFrom: 350,
		featured: false,
		status: "approved",
		createdAt: "2025-02-20",
		deliversAcrossCity: true,
		tags: [
			"Made to order",
			"Cotton yarn",
			"Ships all India"
		]
	},
	{
		id: "s5",
		slug: "chitra-varnam",
		businessName: "Chitra Varnam",
		ownerName: "Karthik Subramanian",
		categoryId: "c5",
		tagline: "Chennai in ink — prints, portraits, wedding invites",
		about: "Illustrator working out of Kodambakkam. Known for pen-and-ink studies of Chennai streets, Tanjore-inspired commissions and hand-drawn wedding stationery.",
		area: "Kodambakkam",
		city: "Chennai",
		instagram: "chitravarnam.art",
		whatsapp: "919600778899",
		email: "studio@chitravarnam.in",
		rating: 4.8,
		reviewCount: 41,
		priceFrom: 800,
		featured: true,
		status: "approved",
		createdAt: "2024-12-05",
		deliversAcrossCity: true,
		tags: [
			"Commissions",
			"Wedding invites",
			"Framed prints"
		]
	},
	{
		id: "s6",
		slug: "kanchi-thread-boutique",
		businessName: "Kanchi Thread Boutique",
		ownerName: "Revathi M",
		categoryId: "c6",
		tagline: "Handloom Kanchipuram, straight from the weaver",
		about: "A small boutique sourcing directly from weaver families in Kanchipuram and Arani. Pure zari sarees, cotton drapes and blouse tailoring in-house.",
		area: "Anna Nagar",
		city: "Chennai",
		instagram: "kanchithread",
		whatsapp: "919444990011",
		email: "care@kanchithread.in",
		rating: 4.6,
		reviewCount: 87,
		priceFrom: 2800,
		featured: false,
		status: "approved",
		createdAt: "2024-08-14",
		deliversAcrossCity: true,
		tags: [
			"Weaver direct",
			"Pure zari",
			"Blouse tailoring"
		]
	},
	{
		id: "s7",
		slug: "mann-terracotta",
		businessName: "Mann Terracotta",
		ownerName: "Prabhu Velan",
		categoryId: "c7",
		tagline: "Wheel-thrown pottery & festival decor",
		about: "Third-generation potters near Villivakkam making terracotta planters, water jugs, Karthigai deepam sets and kolam stencils.",
		area: "Villivakkam",
		city: "Chennai",
		instagram: "mannterracotta",
		whatsapp: "919345667788",
		email: "mann@terracotta.in",
		rating: 4.7,
		reviewCount: 63,
		priceFrom: 250,
		featured: false,
		status: "approved",
		createdAt: "2025-03-03",
		deliversAcrossCity: false,
		tags: [
			"Wheel-thrown",
			"Festival sets",
			"Bulk orders"
		]
	},
	{
		id: "s8",
		slug: "seer-varisai-studio",
		businessName: "Seer Varisai Studio",
		ownerName: "Bhavani K",
		categoryId: "c8",
		tagline: "Wedding trays, return gifts, thamboolam bags",
		about: "Curated seer varisai trays and return gifting for Tamil weddings and seemantham — assembled in Velachery with local artisan products.",
		area: "Velachery",
		city: "Chennai",
		instagram: "seervarisaistudio",
		whatsapp: "919098112255",
		email: "orders@seervarisai.in",
		rating: 4.8,
		reviewCount: 52,
		priceFrom: 600,
		featured: false,
		status: "approved",
		createdAt: "2025-04-12",
		deliversAcrossCity: true,
		tags: [
			"Wedding gifting",
			"Bulk",
			"Custom trays"
		]
	},
	{
		id: "s9",
		slug: "coimbatore-cocoa",
		businessName: "Coimbatore Cocoa Room",
		ownerName: "Anitha Devi",
		categoryId: "c1",
		tagline: "Single-origin bean-to-bar chocolate",
		about: "Bean-to-bar chocolate made with cocoa from Pollachi farms. Awaiting approval on NammaSpot.",
		area: "RS Puram",
		city: "Coimbatore",
		instagram: "coimbatorecocoa",
		whatsapp: "919812334455",
		email: "hi@cbecocoa.in",
		rating: 0,
		reviewCount: 0,
		priceFrom: 320,
		featured: false,
		status: "pending",
		createdAt: "2026-07-28",
		deliversAcrossCity: true,
		tags: ["Bean to bar", "Pollachi cocoa"]
	},
	{
		id: "s10",
		slug: "madurai-jasmine-decor",
		businessName: "Madurai Jasmine Decor",
		ownerName: "Sathya Priya",
		categoryId: "c7",
		tagline: "Malligai garlands & event flower work",
		about: "Fresh Madurai malligai garlands, poo jadai and mandapam flower work. New to the platform.",
		area: "Simmakkal",
		city: "Madurai",
		instagram: "maduraijasmindecor",
		whatsapp: "919677443322",
		email: "sathya@jasmindecor.in",
		rating: 0,
		reviewCount: 0,
		priceFrom: 900,
		featured: false,
		status: "pending",
		createdAt: "2026-08-05",
		deliversAcrossCity: false,
		tags: ["Fresh flowers", "Mandapam decor"]
	}
];
var STORIES = [
	{
		id: "st1",
		sellerId: "s1",
		title: "Two ovens, one Mylapore terrace",
		excerpt: "How Aishwarya turned a Sunday filter-coffee cake into 40 orders a week.",
		body: "Aishwarya started baking in 2021 with a borrowed OTG on her grandmother's terrace in Mylapore. The first cake she sold was a tres leches soaked in degree coffee from the shop at the end of the street. Today Amma Veedu Bakes takes about forty orders a week, all through Instagram DMs, and still bakes everything in the same kitchen."
	},
	{
		id: "st2",
		sellerId: "s2",
		title: "Drawing kolam on skin",
		excerpt: "Divya's mehendi language comes from the pulli kolam her mother drew every morning.",
		body: "Divya Lakshmi grew up watching her mother draw pulli kolam at dawn in Adyar. When she began doing bridal mehendi, she found she was drawing the same grids and loops — negative space, symmetry, a dot to start. Brides now come specifically asking for the kolam bridal hand."
	},
	{
		id: "st3",
		sellerId: "s7",
		title: "The last potters of Villivakkam",
		excerpt: "Three generations at the wheel, now selling Karthigai deepam sets across the city.",
		body: "Prabhu Velan's family has been throwing clay in Villivakkam for three generations. Land pressure took most of the neighbourhood kilns, but their Karthigai deepam sets still sell out every November — now to customers in Anna Nagar and Besant Nagar who found them online."
	},
	{
		id: "st4",
		sellerId: "s5",
		title: "Chennai, in pen and ink",
		excerpt: "Karthik draws one street corner a week — Ratna Cafe queues included.",
		body: "Every Sunday Karthik Subramanian picks a corner of Chennai and draws it: the Mylapore tank, the Marina lighthouse, the queue outside Ratna Cafe. The prints started as a personal project and became the studio's most-shipped product."
	}
];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DB73OFJI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-Bhd9YTCm.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$13 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "NammaSpot — Chennai's Local Marketplace" },
			{
				name: "description",
				content: "NammaSpot connects Chennai and Tamil Nadu customers with Instagram-based local makers, bakers, mehendi artists and boutiques."
			},
			{
				name: "author",
				content: "NammaSpot"
			},
			{
				property: "og:title",
				content: "NammaSpot — Chennai's Local Marketplace"
			},
			{
				property: "og:description",
				content: "Namma Ooru. Namma People. Namma Spot."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$13.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })]
	});
}
var $$splitComponentImporter$10 = () => import("./routes-pbR7bwdm.mjs");
var Route$12 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "NammaSpot — Chennai's Local Makers, Bakers & Artists" },
		{
			name: "description",
			content: "Discover Chennai and Tamil Nadu's Instagram-based home bakers, mehendi artists, bridal makeup studios, crochet makers and boutiques. Search, view catalogues and send enquiries directly."
		},
		{
			property: "og:title",
			content: "NammaSpot — Chennai's Local Makers, Bakers & Artists"
		},
		{
			property: "og:description",
			content: "Namma Ooru. Namma People. Namma Spot. A local marketplace for Chennai's small businesses and handmade creators."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin-Bn8bPpdH.mjs");
var Route$11 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "Admin Console — NammaSpot" },
		{
			name: "description",
			content: "NammaSpot admin console: approve sellers, moderate reviews and monitor enquiries across the Chennai marketplace."
		},
		{
			property: "og:title",
			content: "Admin Console — NammaSpot"
		},
		{
			property: "og:description",
			content: "Moderation and approvals for NammaSpot."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./categories-K34vS0RT.mjs");
var Route$10 = createFileRoute("/categories")({
	head: () => ({ meta: [
		{ title: "Categories — Bakers, Mehendi, Bridal & Crafts | NammaSpot" },
		{
			name: "description",
			content: "Browse NammaSpot categories: home bakers, mehendi artists, bridal makeup, crochet, artists, boutiques, handmade decor and wedding gifting in Chennai."
		},
		{
			property: "og:title",
			content: "Categories — NammaSpot"
		},
		{
			property: "og:description",
			content: "Eight local craft categories across Chennai and Tamil Nadu."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./explore-BoGq0XWG.mjs");
var Route$9 = createFileRoute("/explore")({
	validateSearch: (search) => ({
		q: typeof search["q"] === "string" && search["q"] ? search["q"] : void 0,
		category: typeof search["category"] === "string" ? search["category"] : void 0,
		area: typeof search["area"] === "string" ? search["area"] : void 0,
		minRating: search["minRating"] ? Number(search["minRating"]) : void 0,
		maxPrice: search["maxPrice"] ? Number(search["maxPrice"]) : void 0,
		sort: search["sort"] ?? void 0
	}),
	head: () => ({ meta: [
		{ title: "Explore Chennai Sellers — NammaSpot" },
		{
			name: "description",
			content: "Search and filter Chennai's home bakers, mehendi artists, bridal makeup studios, boutiques and handmade creators by category, area, rating and price."
		},
		{
			property: "og:title",
			content: "Explore Chennai Sellers — NammaSpot"
		},
		{
			property: "og:description",
			content: "Filter local Tamil Nadu makers by craft, neighbourhood, rating and starting price."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./featured-YFsNRvii.mjs");
var Route$8 = createFileRoute("/featured")({
	head: () => ({ meta: [
		{ title: "Featured Chennai Makers — NammaSpot" },
		{
			name: "description",
			content: "This week's featured Chennai small businesses on NammaSpot — hand-picked bakers, mehendi artists, bridal studios and craft makers."
		},
		{
			property: "og:title",
			content: "Featured Chennai Makers — NammaSpot"
		},
		{
			property: "og:description",
			content: "Hand-picked local sellers, reviewed by the NammaSpot team."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./near-me-Db1dYZKz.mjs");
var Route$7 = createFileRoute("/near-me")({
	head: () => ({ meta: [
		{ title: "Near Me — Sellers by Chennai Neighbourhood | NammaSpot" },
		{
			name: "description",
			content: "Pick your Chennai neighbourhood — Mylapore, Adyar, T Nagar, Anna Nagar, Velachery — and see local makers who deliver or visit nearby."
		},
		{
			property: "og:title",
			content: "Near Me — NammaSpot"
		},
		{
			property: "og:description",
			content: "Local Chennai sellers sorted by neighbourhood and city-wide delivery."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var STATIC_PATHS = [
	{
		path: "/",
		priority: "1.0",
		changefreq: "daily"
	},
	{
		path: "/explore",
		priority: "0.9",
		changefreq: "daily"
	},
	{
		path: "/categories",
		priority: "0.8",
		changefreq: "weekly"
	},
	{
		path: "/featured",
		priority: "0.8",
		changefreq: "weekly"
	},
	{
		path: "/near-me",
		priority: "0.7",
		changefreq: "weekly"
	},
	{
		path: "/stories",
		priority: "0.6",
		changefreq: "weekly"
	},
	{
		path: "/seller/register",
		priority: "0.6",
		changefreq: "monthly"
	},
	{
		path: "/seller/login",
		priority: "0.3",
		changefreq: "monthly"
	}
];
var Route$6 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async ({ request }) => {
	const origin = new URL(request.url).origin;
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PATHS.map(({ path, priority, changefreq }) => `  <url>
    <loc>${origin}${path === "/" ? "" : path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$4 = () => import("./stories-BE2Jmm4Y.mjs");
var Route$5 = createFileRoute("/stories")({
	head: () => ({ meta: [
		{ title: "Stories — The People Behind Chennai's Small Businesses | NammaSpot" },
		{
			name: "description",
			content: "Longform stories about Chennai's home bakers, mehendi artists, potters and illustrators — how they started and how they sell today."
		},
		{
			property: "og:title",
			content: "Stories from Chennai's makers — NammaSpot"
		},
		{
			property: "og:description",
			content: "Two ovens in Mylapore, kolam drawn on skin, the last potters of Villivakkam."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./seller._slug-BtOtzHA6.mjs");
var $$splitNotFoundComponentImporter = () => import("./seller._slug-DC6SALoW.mjs");
var Route$4 = createFileRoute("/seller/$slug")({
	loader: ({ params }) => {
		return { seedSeller: SELLERS.find((s) => s.slug === params.slug) ?? null };
	},
	head: ({ params }) => {
		const seller = SELLERS.find((s) => s.slug === params.slug);
		const title = seller ? `${seller.businessName} — ${seller.area}, Chennai | NammaSpot` : "Seller — NammaSpot";
		const description = seller ? `${seller.tagline}. View the catalogue, reviews and send an enquiry to ${seller.businessName} in ${seller.area}.` : "Seller profile on NammaSpot.";
		return { meta: [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			}
		] };
	},
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./seller.dashboard-CkHERN-u.mjs");
var Route$3 = createFileRoute("/seller/dashboard")({
	head: () => ({ meta: [
		{ title: "Seller Dashboard — NammaSpot" },
		{
			name: "description",
			content: "Track profile views, manage your catalogue, respond to enquiries and see your customers — all from the NammaSpot seller dashboard."
		},
		{
			property: "og:title",
			content: "Seller Dashboard — NammaSpot"
		},
		{
			property: "og:description",
			content: "Manage your Chennai brand on NammaSpot."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./seller.login-BcX4lIaP.mjs");
var Route$2 = createFileRoute("/seller/login")({
	head: () => ({ meta: [
		{ title: "Seller Login — NammaSpot" },
		{
			name: "description",
			content: "Sign in to your NammaSpot seller dashboard with your NammaSpot ID and password to manage your catalogue, enquiries, customers and analytics."
		},
		{
			property: "og:title",
			content: "Seller Login — NammaSpot"
		},
		{
			property: "og:description",
			content: "Access your NammaSpot seller dashboard."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./seller.register-Cuu2_mwA.mjs");
var Route$1 = createFileRoute("/seller/register")({
	head: () => ({ meta: [
		{ title: "List Your Business — NammaSpot for Sellers" },
		{
			name: "description",
			content: "Free listing for Chennai and Tamil Nadu small businesses. Create a shareable profile, publish your catalogue and receive enquiries in one place."
		},
		{
			property: "og:title",
			content: "List Your Business — NammaSpot for Sellers"
		},
		{
			property: "og:description",
			content: "Register your Instagram-based business on NammaSpot in under two minutes."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
/**
* Serves images from the private storage buckets.
*
* Buckets are private (no public browsing), so this route mints a short-lived
* signed URL server-side and streams the object back. That keeps image URLs
* stable and shareable while the bucket itself stays locked down.
*/
var ALLOWED_BUCKETS = /* @__PURE__ */ new Set([
	"seller-avatars",
	"product-images",
	"story-images"
]);
var Route = createFileRoute("/api/public/media/$")({ server: { handlers: { GET: async ({ params }) => {
	const [bucket, ...rest] = decodeURIComponent(String(params._splat ?? "")).split("/");
	const path = rest.join("/");
	if (!bucket || !ALLOWED_BUCKETS.has(bucket) || !path || path.includes("..")) return new Response("Not found", { status: 404 });
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
	if (error || !data) return new Response("Not found", { status: 404 });
	return new Response(await data.arrayBuffer(), { headers: {
		"Content-Type": data.type || "image/jpeg",
		"Cache-Control": "public, max-age=86400, immutable"
	} });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$12.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$13
	}),
	AdminRoute: Route$11.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$13
	}),
	CategoriesRoute: Route$10.update({
		id: "/categories",
		path: "/categories",
		getParentRoute: () => Route$13
	}),
	ExploreRoute: Route$9.update({
		id: "/explore",
		path: "/explore",
		getParentRoute: () => Route$13
	}),
	FeaturedRoute: Route$8.update({
		id: "/featured",
		path: "/featured",
		getParentRoute: () => Route$13
	}),
	NearMeRoute: Route$7.update({
		id: "/near-me",
		path: "/near-me",
		getParentRoute: () => Route$13
	}),
	SitemapDotxmlRoute: Route$6.update({
		id: "/sitemap.xml",
		path: "/sitemap.xml",
		getParentRoute: () => Route$13
	}),
	StoriesRoute: Route$5.update({
		id: "/stories",
		path: "/stories",
		getParentRoute: () => Route$13
	}),
	SellerSlugRoute: Route$4.update({
		id: "/seller/$slug",
		path: "/seller/$slug",
		getParentRoute: () => Route$13
	}),
	SellerDashboardRoute: Route$3.update({
		id: "/seller/dashboard",
		path: "/seller/dashboard",
		getParentRoute: () => Route$13
	}),
	SellerLoginRoute: Route$2.update({
		id: "/seller/login",
		path: "/seller/login",
		getParentRoute: () => Route$13
	}),
	SellerRegisterRoute: Route$1.update({
		id: "/seller/register",
		path: "/seller/register",
		getParentRoute: () => Route$13
	}),
	ApiPublicMediaSplatRoute: Route.update({
		id: "/api/public/media/$",
		path: "/api/public/media/$",
		getParentRoute: () => Route$13
	})
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { SELLERS as a, CATEGORIES as i, Route$4 as n, STORIES as o, Route$9 as r, router_exports as t };
