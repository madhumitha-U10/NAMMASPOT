import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_GUEST_LIKES_PER_DAY = 60;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacyServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url) throw new Error("Supabase URL is not configured.");
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys);
    const secret = parsed.default;
    if (!secret) throw new Error("Supabase secret key is not configured.");
    // Secret API keys must be sent only as apikey, not as a Bearer JWT.
    return createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init = {}) => {
          const headers = new Headers(init.headers);
          headers.delete("Authorization");
          return fetch(input, { ...init, headers });
        },
      },
    });
  }
  if (!legacyServiceKey) throw new Error("Supabase server key is not configured.");
  return createClient(url, legacyServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function validId(value: unknown) {
  return typeof value === "string" && UUID_RE.test(value);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    const { action, guestId } = body ?? {};
    if (!validId(guestId)) return response({ error: "A valid guest browser ID is required." }, 400);

    const admin = getAdminClient();

    if (action === "list") {
      const sellerIds = Array.isArray(body.sellerIds) ? body.sellerIds.filter(validId).slice(0, 100) : [];
      const productIds = Array.isArray(body.productIds) ? body.productIds.filter(validId).slice(0, 100) : [];
      const [sellerResult, productResult] = await Promise.all([
        sellerIds.length
          ? admin.from("seller_content_likes").select("seller_id").eq("guest_id", guestId).in("seller_id", sellerIds)
          : Promise.resolve({ data: [], error: null }),
        productIds.length
          ? admin.from("seller_content_likes").select("product_id").eq("guest_id", guestId).in("product_id", productIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (sellerResult.error) throw sellerResult.error;
      if (productResult.error) throw productResult.error;
      return response({
        likedSellers: (sellerResult.data ?? []).map((row) => row.seller_id),
        likedProducts: (productResult.data ?? []).map((row) => row.product_id),
      });
    }

    if (action !== "toggle") return response({ error: "Unsupported action." }, 400);
    const { targetType, targetId, liked } = body;
    if (!["seller", "product"].includes(targetType) || !validId(targetId) || typeof liked !== "boolean") {
      return response({ error: "Invalid like request." }, 400);
    }

    const targetColumn = targetType === "seller" ? "seller_id" : "product_id";
    const targetPayload = targetType === "seller"
      ? { seller_id: targetId, product_id: null }
      : { seller_id: null, product_id: targetId };

    const { data: existing, error: existingError } = await admin
      .from("seller_content_likes")
      .select("id")
      .eq("guest_id", guestId)
      .eq(targetColumn, targetId)
      .maybeSingle();
    if (existingError) throw existingError;

    if (liked) {
      if (existing) {
        const { error } = await admin.from("seller_content_likes").delete().eq("id", existing.id);
        if (error) throw error;
      }
      return response({ liked: false });
    }
    if (existing) return response({ liked: true });

    if (targetType === "seller") {
      const { data: seller, error } = await admin.from("sellers")
        .select("id").eq("id", targetId).eq("verification_status", "approved").maybeSingle();
      if (error) throw error;
      if (!seller) return response({ error: "This seller is not available for likes." }, 404);
    } else {
      const { data: product, error } = await admin.from("products")
        .select("id,seller_id").eq("id", targetId).maybeSingle();
      if (error) throw error;
      if (!product) return response({ error: "This product is not available for likes." }, 404);
      const { data: seller, error: sellerError } = await admin.from("sellers")
        .select("id").eq("id", product.seller_id).eq("verification_status", "approved").maybeSingle();
      if (sellerError) throw sellerError;
      if (!seller) return response({ error: "This product is not available for likes." }, 404);
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await admin.from("seller_content_likes")
      .select("id", { count: "exact", head: true })
      .eq("guest_id", guestId)
      .gte("created_at", since);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_GUEST_LIKES_PER_DAY) {
      return response({ error: "You've reached today's guest-like limit. Please try again tomorrow." }, 429);
    }

    const { error: insertError } = await admin.from("seller_content_likes").insert({
      user_id: null,
      guest_id: guestId,
      ...targetPayload,
    });
    if (insertError && insertError.code !== "23505") throw insertError;
    return response({ liked: true });
  } catch (error) {
    console.error("guest-content-likes:", error);
    return response({ error: "Guest likes could not be saved right now. Please try again." }, 500);
  }
});
