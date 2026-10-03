import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://byxqdletlfglujymhovw.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_dKej76176ynBW0v56D56ig_z-WQN5m6";

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

const MAX_IMAGE_BYTES = 500 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

async function compressImage(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Please select an image file.");
  if (file.size <= MAX_IMAGE_BYTES && file.type === "image/webp") return file;

  const bitmap = await window.createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing is not available in this browser.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.82;
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  }
  if (!blob || blob.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large after compression. Please choose a smaller image.");
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
      throw new Error("NammaSpot image storage is at its safety limit. New image uploads are temporarily paused.");
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

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
