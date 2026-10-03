import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as ImagePlus, b as LoaderCircle, k as CircleCheck } from "../_libs/lucide-react.mjs";
import { i as cn } from "./SiteShell-CeFiVG_g.mjs";
import { _ as normalizeImageUrl } from "./api-C5qQuJ0W.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-BbfXN-w2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-CKGx2a4U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Image pipeline for NammaSpot.
*
* Files are downscaled + compressed in the browser, then uploaded to Lovable
* Cloud storage under the signed-in user's own folder. Buckets are private, so
* the stored value is a stable app URL (`/api/public/media/<bucket>/<path>`)
* that streams the object through the app instead of an expiring signed link.
*
* If nobody is signed in yet (e.g. the public enquiry form), the helper falls
* back to a compressed data URL so the UI keeps working.
*/
var MAX_IMAGE_BYTES = 5242880;
var UPLOAD_TIMEOUT_MS = 3e4;
var ALLOWED_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/avif"
];
/** Throws a human-readable error when the file is not an acceptable image. */
function validateImageFile(file, maxBytes = MAX_IMAGE_BYTES) {
	if (!file.type.startsWith("image/") || !ALLOWED_TYPES.includes(file.type.toLowerCase())) throw new Error("Please choose a JPG, PNG or WebP image");
	if (file.size > maxBytes) throw new Error(`Image must be under ${Math.round(maxBytes / 1048576)}MB`);
}
function loadImage(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file"));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that image"));
			img.onload = () => resolve(img);
			img.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	});
}
/** Downscale so the longest side is <= maxSide, keeping the original aspect ratio. */
async function compressImage(file, maxSide = 1200, quality = .8) {
	const img = await loadImage(file);
	const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
	const w = Math.max(1, Math.round(img.width * scale));
	const h = Math.max(1, Math.round(img.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Image processing is not supported on this device");
	ctx.drawImage(img, 0, 0, w, h);
	const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
	if (!blob) throw new Error("Could not process that image");
	return blob;
}
/** Compressed data URL — used as a local fallback when there is no session. */
async function fileToCompressedDataUrl(file, maxSide = 900, quality = .75) {
	validateImageFile(file);
	const blob = await compressImage(file, maxSide, quality);
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not process that image"));
		reader.onload = () => resolve(String(reader.result));
		reader.readAsDataURL(blob);
	});
}
/** Public, stable URL for a stored object (served by /api/public/media). */
var mediaUrl = (bucket, path) => `/api/public/media/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
async function uploadToBucket(bucket, file, { maxSide, quality, maxBytes }) {
	validateImageFile(file, maxBytes ?? 5242880);
	const { data: auth } = await supabase.auth.getUser();
	const userId = auth.user?.id;
	const blob = await compressImage(file, maxSide, quality);
	if (!userId) return await fileToCompressedDataUrl(file, maxSide, quality);
	const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
	const maxRetries = 3;
	let lastError = null;
	for (let attempt = 1; attempt <= maxRetries; attempt++) try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
		try {
			const { error } = await supabase.storage.from(bucket).upload(path, blob, {
				contentType: "image/jpeg",
				upsert: true,
				cacheControl: "3600",
				signal: controller.signal
			});
			if (error) throw new Error(error.message);
		} finally {
			clearTimeout(timeoutId);
		}
		return mediaUrl(bucket, path);
	} catch (error) {
		lastError = error instanceof Error ? error : new Error(String(error));
		if (attempt === maxRetries) break;
		await new Promise((resolve) => setTimeout(resolve, 2 ** (attempt - 1) * 1e3));
	}
	console.error("Image upload failed:", lastError);
	throw new Error("Image upload failed after 3 attempts. Please check your internet connection and try again.");
}
/** Seller profile picture — square-ish, stored at 400px. */
var uploadSellerAvatar = (file) => uploadToBucket("seller-avatars", file, {
	maxSide: 400,
	quality: .85
});
/** Catalogue photo — aspect ratio preserved, stored at up to 1200px. */
var uploadProductImage = (file) => uploadToBucket("product-images", file, {
	maxSide: 1200,
	quality: .82,
	maxBytes: 10485760
});
/** Story / editorial photo. */
var uploadStoryImage = (file) => uploadToBucket("story-images", file, {
	maxSide: 1600,
	quality: .82,
	maxBytes: 10485760
});
var uploadForBucket = (bucket, file) => bucket === "seller-avatars" ? uploadSellerAvatar(file) : bucket === "product-images" ? uploadProductImage(file) : uploadStoryImage(file);
/**
* Image picker used for seller profile pictures and catalogue photos.
*
* When a `bucket` is given the file is compressed and uploaded to cloud
* storage, and `onPicked` receives the permanent URL. Without a bucket the
* image stays local (compressed data URL).
*
* `fit` controls how the preview is drawn: circular avatars crop (`cover`),
* catalogue photos keep their uploaded proportions (`contain`).
*/
function PhotoPicker({ src, alt, label, className = "size-16 rounded-lg", bucket, fit = "contain", onPicked }) {
	const inputId = (0, import_react.useId)();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [uploadSuccess, setUploadSuccess] = (0, import_react.useState)(false);
	const [uploadError, setUploadError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shrink-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				htmlFor: inputId,
				title: src ? `Change ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`,
				className: `relative grid cursor-pointer place-items-center overflow-hidden border border-border bg-secondary text-muted-foreground transition-opacity hover:opacity-80 focus-within:ring-2 focus-within:ring-ring ${className}`,
				children: [
					src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt,
						loading: "lazy",
						className: `size-full ${fit === "cover" ? "object-cover" : "object-contain"}`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
						className: "size-4",
						"aria-hidden": true
					}),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute inset-0 grid place-items-center bg-background/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin text-primary",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "sr-only",
						children: [
							src ? "Change" : "Add",
							" ",
							label,
							" for ",
							alt
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: inputId,
				type: "file",
				accept: "image/jpeg,image/png,image/webp",
				className: "sr-only",
				disabled: busy,
				"aria-label": `${src ? "Change" : "Add"} ${label}`,
				onChange: async (e) => {
					const file = e.target.files?.[0];
					e.target.value = "";
					if (!file) return;
					setBusy(true);
					setUploadError("");
					setUploadSuccess(false);
					try {
						const url = bucket ? await uploadForBucket(bucket, file) : await fileToCompressedDataUrl(file);
						const normalized = normalizeImageUrl(url);
						if (!normalized) throw new Error("Could not use that image");
						onPicked(normalized);
						setUploadSuccess(true);
						setTimeout(() => setUploadSuccess(false), 2e3);
					} catch (err) {
						const message = err instanceof Error ? err.message : "Could not use that image";
						setUploadError(message);
						toast.error(message);
					} finally {
						setBusy(false);
					}
				}
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-xs text-muted-foreground",
				role: "status",
				children: "Uploading…"
			}),
			uploadSuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1.5 flex items-center gap-1 text-xs text-primary",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					className: "size-3.5",
					"aria-hidden": true
				}), " Image uploaded"]
			}),
			uploadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-48 text-xs text-destructive",
				role: "alert",
				children: uploadError
			})
		]
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
export { Textarea as n, PhotoPicker as t };
