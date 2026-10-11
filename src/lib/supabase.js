import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isProductionConfigurationError = Boolean(import.meta.env.PROD && (!url || !key));
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const DEFAULT_MAX_IMAGE_BYTES = 1000000;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function compressImage(file, maxImageBytes = DEFAULT_MAX_IMAGE_BYTES) {
  if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("This image format is not supported. Please upload JPG, PNG or WebP.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("This image is over 10 MB. Please choose a smaller image.");
  }
  if (file.size <= maxImageBytes && file.type === "image/webp") return file;
  if (!window.createImageBitmap) {
    throw new Error("This browser cannot optimize the image. Please use JPG, PNG or WebP under your assigned image limit.");
  }

  let bitmap;
  try {
    bitmap = await window.createImageBitmap(file);
    const sourceMax = Math.max(bitmap.width, bitmap.height);
    const dimensionSteps = [1600, 1400, 1200, 1000, 800, 640, 480];
    const targets = dimensionSteps.filter((size) => size < sourceMax);
    targets.unshift(Math.min(MAX_IMAGE_DIMENSION, sourceMax));
    const uniqueTargets = [...new Set(targets)];
    const qualities = [0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.25];

    for (const maxDimension of uniqueTargets) {
      const scale = Math.min(1, maxDimension / sourceMax);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image processing is not available in this browser.");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of qualities) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size > 0 && blob.size <= maxImageBytes) {
          return new window.File([blob], "image.webp", { type: "image/webp" });
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message) throw error;
    throw new Error("NammaSpot could not process this image. Please try another JPG, PNG or WebP image.");
  } finally {
    bitmap?.close?.();
  }

  throw new Error(
    "This image could not be compressed below your " + formatByteMessage(maxImageBytes) +
    " per-image limit. Try cropping it or choose a smaller image."
  );
}
async function recordUploadEvent(eventType, requestedBytes, message) {
  try {
    await supabase.rpc("record_seller_storage_event", {
      p_event_type: eventType,
      p_requested_bytes: requestedBytes ?? null,
      p_message: String(message || "").slice(0, 240),
    });
  } catch {}
}

function formatByteMessage(bytes) {
  if (bytes < 1000000) return Math.max(0, Math.round(bytes / 1000)) + " KB";
  return (bytes / 1000000).toFixed(1) + " MB";
}

export async function uploadSellerMedia(file, userId, bucket = "seller-media") {
  if (!supabase && import.meta.env.PROD) {
    throw new Error("NammaSpot cannot upload because production Supabase configuration is missing. Contact support.");
  }
  if (!file) return null;
  if (!supabase) throw new Error("Image upload is unavailable because NammaSpot storage is not configured.");
  if (!userId) throw new Error("Your seller session could not be verified. Sign in again, then upload the image.");
  let maxImageBytes = DEFAULT_MAX_IMAGE_BYTES;
  if (bucket === "seller-media") {
    const { data: rows, error: usageError } = await supabase.rpc("seller_storage_usage");
    if (usageError) throw usageError;
    const current = Array.isArray(rows) ? rows[0] : rows;
    maxImageBytes = Number(current?.max_file_bytes || DEFAULT_MAX_IMAGE_BYTES);
  }
  const compressed = await compressImage(file, maxImageBytes);

  if (bucket === "seller-media") {
    const { data, error } = await supabase.rpc("storage_upload_allowed", { p_bytes: compressed.size });
    if (error) throw error;
    if (data !== true) {
      const { data: rows } = await supabase.rpc("seller_storage_usage");
      const usage = Array.isArray(rows) ? rows[0] : rows;
      if (usage?.status === "blocked") { await recordUploadEvent("quota_exceeded",compressed.size,"Seller storage quota is full."); throw new Error("Your catalogue storage is full. Delete unused images or contact NammaSpot support to request a storage upgrade."); }
      if (Number(usage?.remaining_bytes) < compressed.size) { await recordUploadEvent("quota_exceeded",compressed.size,"Upload exceeds remaining seller storage."); throw new Error("This image cannot be uploaded because it exceeds your remaining storage. You have " + formatByteMessage(Number(usage?.remaining_bytes) || 0) + " available."); }
      if (compressed.size > Number(usage?.max_file_bytes)) { await recordUploadEvent("file_too_large",compressed.size,"Image exceeds assigned per-image limit."); throw new Error("This image exceeds your assigned per-image limit. Please choose a smaller image."); }
      await recordUploadEvent("quota_exceeded",compressed.size,"Upload rejected by storage quota preflight.");
      throw new Error("This image cannot be uploaded because the NammaSpot storage limit has been reached.");
    }
  }

  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, {
      cacheControl: "31536000",
      upsert: false,
      contentType: "image/webp",
    });

  if (error) {
    await recordUploadEvent(String(error.message || "").toLowerCase().includes("size") ? "file_too_large" : "upload_failed", compressed.size, error.message || "Storage upload failed.");
    if (error.statusCode === "413" || error.message?.toLowerCase().includes("too large")) {
      throw new Error("This image exceeds your assigned per-image limit. Please choose a smaller image.");
    }
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    try { await supabase.storage.from(bucket).remove([path]); } catch {}
    throw new Error("The image uploaded, but NammaSpot could not create its catalogue URL. Please try again.");
  }
  return data.publicUrl;
}

export async function getSellerStorageUsage() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("seller_storage_usage");
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}
