import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as stringType, r as coerce, s as objectType } from "../_libs/zod.mjs";
import { t as SellerAvatar } from "./SellerAvatar-BzLCIvBH.mjs";
import { n as PageHeading, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as Label } from "./label-BTwE2nrN.mjs";
import { l as categories, y as registerSeller } from "./api-C5qQuJ0W.mjs";
import { t as useStoreData } from "./use-store-data-IX6EFSKw.mjs";
import { o as setSession } from "./session-BGB_FtJ0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-iNnrgf-R.mjs";
import { n as Textarea, t as PhotoPicker } from "./textarea-CKGx2a4U.mjs";
import { a as validatePassword, i as validateNammaspotId, r as signUpSeller } from "./seller-auth-D044lGr3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller.register-Cuu2_mwA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	businessName: stringType().trim().min(3, "Business name must be at least 3 characters").max(80, "Business name must be less than 80 characters"),
	ownerName: stringType().trim().min(2, "Owner name must be at least 2 characters").max(50, "Owner name must be less than 50 characters"),
	categoryId: stringType().min(1, "Please select a business category"),
	area: stringType().trim().min(2, "Please enter your area").max(60, "Area name is too long"),
	city: stringType().trim().min(2, "Please enter your city").max(40, "City name is too long"),
	instagram: stringType().trim().min(1, "Instagram handle is required").transform((s) => s.replace(/^@+/, "")).refine((s) => /^[a-zA-Z0-9_.]{1,30}$/.test(s), "Instagram handle can only contain letters, numbers, dots and underscores (max 30 characters)"),
	whatsapp: stringType().trim().transform((s) => s.replace(/[\s\-()]/g, "").replace(/^\+/, "")).refine((s) => /^[0-9]{10,15}$/.test(s), "Enter a valid number with country code, digits only"),
	email: stringType().trim().email("Please enter a valid email address").max(120, "Email must be less than 120 characters"),
	priceFrom: coerce.number({ invalid_type_error: "Starting price must be a number" }).min(0, "Price must be ₹0 or more").max(999999, "Price seems too high. Please check and re-enter"),
	tagline: stringType().trim().min(6, "Write one line about your business").max(150, "Tagline must be less than 150 characters"),
	about: stringType().trim().min(20, "Tell customers a bit more about your business").max(1e3, "About section must be less than 1000 characters")
}).extend({
	nammaspotId: stringType(),
	password: stringType(),
	confirmPassword: stringType()
});
function RegisterSeller() {
	const navigate = useNavigate();
	const [errors, setErrors] = (0, import_react.useState)({});
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const { data: cats } = useStoreData(categories);
	const submit = async (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const nammaspotId = String(fd.get("nammaspotId") ?? "");
		const password = String(fd.get("password") ?? "");
		const confirmPassword = String(fd.get("confirmPassword") ?? "");
		const parsed = schema.safeParse({
			nammaspotId,
			password,
			confirmPassword,
			businessName: fd.get("businessName"),
			ownerName: fd.get("ownerName"),
			categoryId,
			area: fd.get("area"),
			city: fd.get("city"),
			instagram: fd.get("instagram"),
			whatsapp: fd.get("whatsapp"),
			email: fd.get("email"),
			tagline: fd.get("tagline"),
			about: fd.get("about"),
			priceFrom: fd.get("priceFrom")
		});
		const next = {};
		if (!parsed.success) for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
		const idError = validateNammaspotId(nammaspotId);
		if (idError) next["nammaspotId"] = idError;
		const pwError = validatePassword(password);
		if (pwError) next["password"] = pwError;
		if (!next["password"] && password !== confirmPassword) next["confirmPassword"] = "Passwords do not match";
		if (Object.keys(next).length || !parsed.success) {
			setErrors(next);
			return;
		}
		setErrors({});
		const { nammaspotId: _id, password: _pw, confirmPassword: _cpw, ...profile } = parsed.data;
		setBusy(true);
		const seller = registerSeller({
			...profile,
			...avatarUrl ? { imageUrl: avatarUrl } : {}
		});
		const auth = await signUpSeller({
			nammaspotId,
			password,
			sellerId: seller.id,
			profile: seller
		});
		setBusy(false);
		if (!auth.ok) {
			setErrors({ nammaspotId: auth.error ?? "Could not create your account." });
			toast.error(auth.error ?? "Could not create your account.");
			return;
		}
		setSession(seller.id);
		toast.success("Registered! Your profile is pending admin approval.");
		navigate({ to: "/seller/dashboard" });
	};
	const err = (k) => errors[k] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-xs text-destructive",
		children: errors[k]
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "For sellers",
		title: "List your business",
		subtitle: "Free for Chennai and Tamil Nadu makers. Admin approves new profiles within 24 hours."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-2xl px-4 py-8 lg:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "card-soft space-y-4 p-5",
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-4 border-b border-border pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerAvatar, {
						name: "Your business",
						src: avatarUrl || void 0,
						size: "lg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold",
								children: "Profile picture (optional)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-sm text-xs text-muted-foreground",
								children: "Add your logo or a photo of your work — profiles with a picture get more enquiries."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPicker, {
								src: avatarUrl || void 0,
								alt: "your business",
								label: "profile picture",
								bucket: "seller-avatars",
								fit: "cover",
								className: "size-12 rounded-full",
								onPicked: setAvatarUrl
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "businessName",
								children: "Business name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "businessName",
								name: "businessName",
								className: "mt-1.5",
								maxLength: 80,
								autoComplete: "organization"
							}),
							err("businessName")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "ownerName",
								children: "Your name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "ownerName",
								name: "ownerName",
								className: "mt-1.5",
								maxLength: 50,
								autoComplete: "name"
							}),
							err("ownerName")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: categoryId,
								onValueChange: setCategoryId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select category" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (cats ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							}),
							err("categoryId")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "area",
								children: "Area"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "area",
								name: "area",
								placeholder: "Anna Nagar",
								className: "mt-1.5",
								maxLength: 60
							}),
							err("area")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "city",
								children: "City"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "city",
								name: "city",
								placeholder: "Chennai",
								defaultValue: "Chennai",
								className: "mt-1.5",
								maxLength: 40
							}),
							err("city")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "instagram",
								children: "Instagram handle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "instagram",
								name: "instagram",
								placeholder: "@ammaveedubakes",
								autoCapitalize: "none",
								spellCheck: false,
								className: "mt-1.5",
								maxLength: 40
							}),
							err("instagram")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "whatsapp",
								children: "WhatsApp (with 91)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "whatsapp",
								name: "whatsapp",
								type: "tel",
								inputMode: "numeric",
								placeholder: "919840112233",
								className: "mt-1.5",
								maxLength: 15
							}),
							err("whatsapp")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								name: "email",
								type: "email",
								autoComplete: "email",
								className: "mt-1.5",
								maxLength: 120
							}),
							err("email")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "priceFrom",
								children: "Starting price (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "priceFrom",
								name: "priceFrom",
								type: "number",
								min: "0",
								max: "999999",
								step: "1",
								inputMode: "numeric",
								defaultValue: "500",
								className: "mt-1.5"
							}),
							err("priceFrom")
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 border-t border-border pt-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Your NammaSpot login"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Choose a unique NammaSpot ID and a password — you will use these to sign in."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "nammaspotId",
								children: "NammaSpot ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "nammaspotId",
								name: "nammaspotId",
								autoCapitalize: "none",
								spellCheck: false,
								autoComplete: "username",
								placeholder: "ammaveedubakes",
								className: "mt-1.5",
								maxLength: 24
							}),
							err("nammaspotId")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden sm:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								name: "password",
								type: "password",
								autoComplete: "new-password",
								className: "mt-1.5"
							}),
							err("password")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "confirmPassword",
								children: "Confirm password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "confirmPassword",
								name: "confirmPassword",
								type: "password",
								autoComplete: "new-password",
								className: "mt-1.5"
							}),
							err("confirmPassword")
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "tagline",
						children: "One-line tagline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "tagline",
						name: "tagline",
						className: "mt-1.5",
						maxLength: 150
					}),
					err("tagline")
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "about",
						children: "About your business"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "about",
						name: "about",
						rows: 4,
						className: "mt-1.5",
						maxLength: 1e3
					}),
					err("about")
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					className: "w-full rounded-full",
					children: busy ? "Creating…" : "Create my profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: ["Already listed? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/seller/login",
						className: "text-primary hover:underline",
						children: "Seller login"
					})]
				})
			]
		})
	})] });
}
//#endregion
export { RegisterSeller as component };
