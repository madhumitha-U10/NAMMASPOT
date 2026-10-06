import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://ahncpjthmaxapawjzcwt.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_tjoHCwVR3UVDOl4cc5EDUQ_vF2LWM27";

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

const MAX_IMAGE_BYTES = 512000;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function compressImage(file) {
  if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported image format. Use JPG, PNG or WebP.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("This image is over 10 MB. Please choose a smaller image.");
  }

  if (file.size <= MAX_IMAGE_BYTES && file.type === "image/webp") return file;

  if (!window.createImageBitmap) {
    throw new Error("This browser cannot optimize the image. Please use JPG, PNG or WebP under 500 KB.");
  }

  const bitmap = await window.createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Image processing is not available in this browser.");
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.82;
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  }
  if (!blob || blob.size > MAX_IMAGE_BYTES) {
    throw new Error("This image is over the 500 KB upload limit after compression. Please choose a smaller or simpler image.");
  }
  return new window.File([blob], "image.webp", { type: "image/webp" });
}

export async function uploadSellerMedia(file, userId, bucket = "seller-media") {
  if (!supabase || !file || !userId) return null;
  const compressed = await compressImage(file);

  if (bucket === "seller-media") {
    const { data, error } = await supabase.rpc("storage_upload_allowed", { p_bytes: compressed.size });
    if (error) throw error;
    if (data !== true) {
      const { data: usage } = await supabase.rpc("seller_storage_usage");
      if (usage?.[0]?.status === "blocked") {
        throw new Error("Your NammaSpot image storage is full (50 MB). Delete an old image before uploading another.");
      }
      if (usage?.[0]?.status === "warning") {
        throw new Error("Your NammaSpot image storage is nearly full (40 MB+ of 50 MB). Delete an old image or choose a smaller image.");
      }
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
    if (error.statusCode === "413" || error.message?.toLowerCase().includes("too large")) {
      throw new Error("This image exceeds the 500 KB upload limit. Please choose a smaller image.");
    }
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSellerStorageUsage() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("seller_storage_usage");
  if (error) throw error;
  return data?.[0] ?? null;
}
