import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as stringType, s as objectType } from "../_libs/zod.mjs";
import { t as SellerAvatar } from "./SellerAvatar-BzLCIvBH.mjs";
import { P as CalendarDays, S as Instagram, g as MessageCircle, p as Phone, r as Truck, u as Share2, v as MapPin } from "../_libs/lucide-react.mjs";
import { i as cn, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Badge } from "./badge-CcKQauQ3.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as Label } from "./label-BTwE2nrN.mjs";
import { E as setCustomerAvatar, M as storiesBySeller, S as reviewsBySeller, T as sellerBySlug, f as createEnquiry, g as inr, n as allCustomers, u as categoryById, v as productsBySeller } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as imageForCategorySlug } from "./images-k2yOaHv8.mjs";
import { n as Route$4 } from "./router-DB73OFJI.mjs";
import { t as Rating } from "./Rating-B9RY_rKd.mjs";
import { n as Textarea, t as PhotoPicker } from "./textarea-CKGx2a4U.mjs";
import { t as ProductImage } from "./ProductImage-DcaZcjM9.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller._slug-BtOtzHA6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var enquirySchema = objectType({
	customerName: stringType().trim().min(2, "Please enter your name").max(80),
	phone: stringType().trim().regex(/^[0-9+\s-]{10,15}$/, "Enter a valid phone number"),
	eventDate: stringType().max(20),
	message: stringType().trim().min(10, "Tell the seller a bit more").max(1e3)
});
function SellerProfile() {
	const { slug } = Route$4.useParams();
	const { seedSeller } = Route$4.useLoaderData();
	const { data: resolved } = useStoreData(() => ({ seller: sellerBySlug(slug) ?? null }));
	const seller = resolved ? resolved.seller : seedSeller;
	const { data: products } = useStoreData(() => {
		const s = sellerBySlug(slug);
		return s ? productsBySeller(s.id) : [];
	});
	const { data: reviews } = useStoreData(() => {
		const s = sellerBySlug(slug);
		return s ? reviewsBySeller(s.id) : [];
	});
	const [selectedProduct, setSelectedProduct] = (0, import_react.useState)(null);
	if (resolved && resolved.seller === null) throw notFound();
	if (!seller) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-6xl px-4 py-24 text-sm text-muted-foreground",
		children: "Loading profile…"
	}) });
	const category = categoryById(seller.categoryId);
	const story = storiesBySeller(seller.id)[0];
	const share = async () => {
		const url = window.location.href;
		if (navigator.share) try {
			await navigator.share({
				title: seller.businessName,
				url
			});
			return;
		} catch {}
		await navigator.clipboard.writeText(url);
		toast.success("Profile link copied");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative border-b border-border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: imageForCategorySlug(category?.slug),
			alt: seller.businessName,
			className: "h-40 w-full object-cover sm:h-56"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 pb-6 lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mt-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
						name: seller.businessName,
						src: seller.imageUrl,
						size: "xl"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "mb-2",
								children: category?.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-extrabold sm:text-3xl",
								children: seller.businessName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: seller.tagline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rating, {
										value: seller.rating,
										count: seller.reviewCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
											" ",
											seller.area,
											", ",
											seller.city
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `https://instagram.com/${seller.instagram}`,
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex items-center gap-1 hover:text-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "size-3.5" }),
											" @",
											seller.instagram
										]
									}),
									seller.deliversAcrossCity && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-3.5" }), " Delivers city-wide"]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: share,
						"aria-label": "Share profile",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `https://wa.me/${seller.whatsapp}`,
							target: "_blank",
							rel: "noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), " WhatsApp"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:+${seller.whatsapp}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), " Call"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#enquiry",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }), " Send enquiry"]
						})
					})
				]
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 lg:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "catalogue",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "catalogue",
						children: "Catalogue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "about",
						children: "About"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "reviews",
						children: [
							"Reviews (",
							reviews?.length ?? 0,
							")"
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "catalogue",
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: (products ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft flex flex-col p-4",
							children: [
								p.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
									src: p.imageUrl,
									alt: p.name,
									className: "mb-3 -mx-4 -mt-4 rounded-t-[inherit]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "min-w-0 text-sm font-bold",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "shrink-0 text-[10px] uppercase",
										children: p.type
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-relaxed text-muted-foreground",
									children: p.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-bold text-primary",
										children: [
											inr(p.price),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-normal text-muted-foreground",
												children: ["/ ", p.unit]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										className: "rounded-full",
										onClick: () => {
											setSelectedProduct(p.id);
											document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" });
										},
										children: "Enquire"
									})]
								})
							]
						}, p.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "about",
					className: "mt-6 max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: seller.about
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: seller.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: t
							}, t))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-6 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-soft p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Owner"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 text-sm font-semibold",
										children: seller.ownerName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-soft p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Starts from"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 text-sm font-semibold",
										children: inr(seller.priceFrom)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-soft p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 break-all text-sm font-semibold",
										children: seller.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-soft p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "On NammaSpot since"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 text-sm font-semibold",
										children: seller.createdAt
									})]
								})
							]
						}),
						story && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-soft mt-6 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-bold",
								children: story.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: story.body
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "reviews",
					className: "mt-6 max-w-2xl space-y-3",
					children: [(reviews ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No reviews published yet."
					}), (reviews ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-soft p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: r.customerName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rating, { value: r.rating })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: r.comment
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: r.createdAt
							})
						]
					}, r.id))]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnquiryForm, {
			sellerId: seller.id,
			productId: selectedProduct,
			productName: (products ?? []).find((p) => p.id === selectedProduct)?.name
		})]
	})] });
}
function EnquiryForm({ sellerId, productId, productName }) {
	const [errors, setErrors] = (0, import_react.useState)({});
	const [sent, setSent] = (0, import_react.useState)(false);
	const [avatar, setAvatar] = (0, import_react.useState)("");
	const submit = (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const parsed = enquirySchema.safeParse({
			customerName: String(fd.get("customerName") ?? ""),
			phone: String(fd.get("phone") ?? ""),
			eventDate: String(fd.get("eventDate") ?? ""),
			message: String(fd.get("message") ?? "")
		});
		if (!parsed.success) {
			const next = {};
			for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
			setErrors(next);
			return;
		}
		setErrors({});
		createEnquiry({
			...parsed.data,
			sellerId,
			productId
		});
		if (avatar) {
			const customer = allCustomers().find((c) => c.phone === parsed.data.phone);
			if (customer) setCustomerAvatar(customer.id, avatar);
		}
		setSent(true);
		toast.success("Enquiry sent — the seller will reply on WhatsApp.");
		e.currentTarget.reset();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "enquiry",
		className: "mt-12 max-w-2xl scroll-mt-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-extrabold",
				children: "Send an enquiry / booking request"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: productName ? `About: ${productName}` : "The seller replies directly on WhatsApp."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "card-soft mt-4 space-y-4 p-5",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
							src: avatar || void 0,
							alt: "your profile",
							label: "profile picture",
							className: "size-14 rounded-full",
							onPicked: setAvatar
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Profile picture (optional)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "customerName",
								children: "Your name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "customerName",
								name: "customerName",
								maxLength: 80,
								className: "mt-1.5"
							}),
							errors["customerName"] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-destructive",
								children: errors["customerName"]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "WhatsApp number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								name: "phone",
								inputMode: "tel",
								maxLength: 15,
								className: "mt-1.5"
							}),
							errors["phone"] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-destructive",
								children: errors["phone"]
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "eventDate",
						children: "Event / delivery date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "eventDate",
						name: "eventDate",
						type: "date",
						className: "mt-1.5"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "message",
							children: "What do you need?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "message",
							name: "message",
							rows: 4,
							maxLength: 1e3,
							className: "mt-1.5"
						}),
						errors["message"] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-destructive",
							children: errors["message"]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full rounded-full sm:w-auto",
						children: "Send enquiry"
					}),
					sent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-primary",
						children: "Sent. It now appears in the seller's dashboard under Enquiries."
					})
				]
			})
		]
	});
}
//#endregion
export { SellerProfile as component };
