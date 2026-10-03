import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as PageHeading, r as SiteShell, t as Button } from "./SiteShell-CeFiVG_g.mjs";
import { t as Input } from "./input-BkrOl6VK.mjs";
import { t as Label } from "./label-BTwE2nrN.mjs";
import { x as restoreSellerProfile } from "./api-C5qQuJ0W.mjs";
import { o as setSession } from "./session-BGB_FtJ0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as signInSeller } from "./seller-auth-D044lGr3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller.login-BcX4lIaP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SellerLogin() {
	const navigate = useNavigate();
	const [nammaspotId, setNammaspotId] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		const next = {};
		if (!nammaspotId.trim()) next["nammaspotId"] = "Enter your NammaSpot ID";
		if (!password) next["password"] = "Enter your password";
		setErrors(next);
		if (Object.keys(next).length) return;
		setBusy(true);
		const result = await signInSeller({
			nammaspotId,
			password
		});
		setBusy(false);
		if (!result.ok) {
			setErrors({ form: result.error ?? "Incorrect NammaSpot ID or password." });
			toast.error(result.error ?? "Incorrect NammaSpot ID or password.");
			return;
		}
		if (!result.sellerId) {
			setErrors({ form: "No seller profile is linked to this ID yet. Please register your business." });
			return;
		}
		if (result.profile) restoreSellerProfile(result.profile);
		setSession(result.sellerId);
		toast.success("Vanakkam! Welcome back.");
		navigate({ to: "/seller/dashboard" });
	};
	const err = (k) => errors[k] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-xs text-destructive",
		children: errors[k]
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeading, {
		eyebrow: "Sellers",
		title: "Seller login",
		subtitle: "Manage your Chennai brand."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto w-full max-w-md px-4 py-8 lg:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "card-soft space-y-4 p-5",
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "nammaspotId",
						children: "NammaSpot ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "nammaspotId",
						name: "nammaspotId",
						autoComplete: "username",
						autoCapitalize: "none",
						spellCheck: false,
						value: nammaspotId,
						onChange: (e) => setNammaspotId(e.target.value),
						placeholder: "ammaveedubakes",
						className: "mt-1.5",
						maxLength: 24
					}),
					err("nammaspotId")
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "password",
						children: "Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "password",
						name: "password",
						type: "password",
						autoComplete: "current-password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						className: "mt-1.5"
					}),
					err("password")
				] }),
				errors["form"] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive",
					children: errors["form"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					className: "w-full rounded-full",
					children: busy ? "Signing in…" : "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: [
						"New here?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/seller/register",
							className: "text-primary hover:underline",
							children: "List your business"
						})
					]
				})
			]
		})
	})] });
}
//#endregion
export { SellerLogin as component };
