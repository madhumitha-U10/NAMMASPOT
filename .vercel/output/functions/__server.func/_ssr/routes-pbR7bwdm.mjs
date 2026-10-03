import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as ArrowRight, S as Instagram, f as Search, l as ShieldCheck, s as Sparkles } from "../_libs/lucide-react.mjs";
import { r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as SellerCardSkeleton } from "./SellerCardSkeleton-rSYuO1KM.mjs";
import { j as stories, l as categories, s as approvedSellers } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { t as heroImages } from "./images-k2yOaHv8.mjs";
import { t as SellerCard } from "./SellerCard-DQE-ECVl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-pbR7bwdm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [q, setQ] = (0, import_react.useState)("");
	const { data: sellers } = useStoreData(approvedSellers);
	const featured = (sellers ?? []).filter((s) => s.featured).slice(0, 4);
	const { data: catsData } = useStoreData(categories);
	const cats = catsData ?? [];
	const storyList = stories().slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden border-b border-border bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 kolam-grid",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-6 lg:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-[0.25em] text-primary",
						children: "Chennai · Tamil Nadu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl",
						children: [
							"Namma Ooru.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Namma People.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "Namma Spot."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base",
						children: "Discover the authentic flavours, crafts and talents of Chennai's vibrant local scene. Handcrafted by the community, for the community."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-7 flex flex-col gap-2 sm:flex-row",
						onSubmit: (e) => e.preventDefault(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Try 'bridal mehendi Adyar' or 'eggless cake'",
								className: "h-12 rounded-full bg-background pl-9",
								"aria-label": "Search sellers"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							className: "h-12 rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/explore",
								search: { q },
								children: "Search"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: cats.slice(0, 5).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/explore",
							search: { category: c.slug },
							className: "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary",
							children: c.name
						}, c.id))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: heroImages.mehendi,
							alt: "Mehendi artist applying bridal henna in Chennai",
							width: 900,
							height: 1100,
							className: "col-span-1 row-span-2 h-full w-full rounded-2xl object-cover shadow-[var(--shadow-lift)]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: heroImages.bakes,
							alt: "Handmade bakes from a Chennai home baker",
							width: 900,
							height: 640,
							loading: "lazy",
							className: "h-40 w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] sm:h-48"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: heroImages.crafts,
							alt: "Terracotta and brass crafts from a local Chennai maker",
							width: 900,
							height: 640,
							loading: "lazy",
							className: "h-40 w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] sm:h-48"
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-secondary/50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 lg:px-6",
				children: [
					{
						icon: ShieldCheck,
						title: "Admin-verified sellers",
						copy: "Every profile is reviewed before it goes live."
					},
					{
						icon: Instagram,
						title: "Instagram-first",
						copy: "Built for businesses that already sell through DMs."
					},
					{
						icon: Sparkles,
						title: "Made in Tamil Nadu",
						copy: "Local artisans, local areas, local prices."
					}
				].map(({ icon: Icon, title, copy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "mt-0.5 size-5 shrink-0 text-primary",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: copy
						})]
					})]
				}, title))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-12 lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-extrabold sm:text-3xl",
					children: "Browse by craft"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Eight categories, hundreds of makers."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/categories",
					className: "shrink-0 text-sm font-semibold text-primary hover:underline",
					children: "All categories"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
				children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					search: { category: c.slug },
					className: "card-soft p-4 transition-colors hover:border-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-primary/80",
							children: c.tamilName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-2 text-xs text-muted-foreground",
							children: c.blurb
						})
					]
				}, c.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-card py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 lg:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-extrabold sm:text-3xl",
						children: "Featured this week"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/featured",
						className: "shrink-0 text-sm font-semibold text-primary hover:underline",
						children: "See all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: sellers === null ? [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCardSkeleton, {}, `featured-skeleton-${i}`)) : featured.length > 0 ? featured.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCard, { seller: s }, s.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No featured sellers at this time."
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-12 lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-extrabold sm:text-3xl",
					children: "Stories from the neighbourhood"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/stories",
					className: "shrink-0 text-sm font-semibold text-primary hover:underline",
					children: "Read more"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 md:grid-cols-3",
				children: storyList.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/stories",
					className: "card-soft p-5 hover:border-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted-foreground",
							children: s.excerpt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary",
							children: ["Read story ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
						})
					]
				}, s.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-6xl px-4 pb-4 lg:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 kolam-grid opacity-20",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-extrabold sm:text-3xl",
							children: "Selling through Instagram DMs?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm opacity-90",
							children: "Get a shareable profile, a proper catalogue and enquiries in one place. Free for Chennai and Tamil Nadu makers."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "secondary",
							className: "mt-6 rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/seller/register",
								children: "List your business"
							})
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { Home as component };
