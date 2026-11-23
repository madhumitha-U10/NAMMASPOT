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

function getRestConfig() {
  const url = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacyServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url) throw new Error("Supabase URL is not configured.");
  if (secretKeys) {
    const secret = JSON.parse(secretKeys).default;
    if (!secret) throw new Error("Supabase secret key is not configured.");
    return { url, apiKey: secret, authorization: null };
  }
  if (!legacyServiceKey) throw new Error("Supabase server key is not configured.");
  return { url, apiKey: legacyServiceKey, authorization: "Bearer " + legacyServiceKey };
}

async function rest(path: string, method = "GET", body?: unknown, prefer?: string) {
  const config = getRestConfig();
  const headers = new Headers({
    apikey: config.apiKey,
    "Content-Type": "application/json",
  });
  if (config.authorization) headers.set("Authorization", config.authorization);
  if (prefer) headers.set("Prefer", prefer);
  const result = await fetch(config.url + "/rest/v1/" + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentRange = result.headers.get("content-range");
  const countText = contentRange?.split("/")[1];
  const count = countText && countText !== "*" ? Number(countText) : null;
  const text = method === "HEAD" ? "" : await result.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!result.ok) {
    const error = Array.isArray(data) ? data[0] : data;
    const exception = new Error(error?.message || "Database request failed.");
    (exception as any).code = error?.code;
    throw exception;
  }
  return { data, count };
}

function validId(value: unknown) {
  return typeof value === "string" && UUID_RE.test(value);
}
function filterList(values: unknown) {
  return Array.isArray(values) ? values.filter(validId).slice(0, 100) as string[] : [];
}
function inFilter(values: string[]) {
  return "in.(" + values.join(",") + ")";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    const { action, guestId } = body ?? {};
    if (!validId(guestId)) return response({ error: "A valid guest browser ID is required." }, 400);

    if (action === "list") {
      const sellerIds = filterList(body.sellerIds);
      const productIds = filterList(body.productIds);
      const [sellerResult, productResult] = await Promise.all([
        sellerIds.length
          ? rest("seller_content_likes?select=seller_id&guest_id=eq." + guestId + "&seller_id=" + inFilter(sellerIds))
          : Promise.resolve({ data: [] }),
        productIds.length
          ? rest("seller_content_likes?select=product_id&guest_id=eq." + guestId + "&product_id=" + inFilter(productIds))
          : Promise.resolve({ data: [] }),
      ]);
      return response({
        likedSellers: (sellerResult.data ?? []).map((row: any) => row.seller_id),
        likedProducts: (productResult.data ?? []).map((row: any) => row.product_id),
      });
    }

    if (action !== "toggle") return response({ error: "Unsupported action." }, 400);
    const { targetType, targetId, liked } = body;
    if (!["seller", "product"].includes(targetType) || !validId(targetId) || typeof liked !== "boolean") {
      return response({ error: "Invalid like request." }, 400);
    }

    const targetColumn = targetType === "seller" ? "seller_id" : "product_id";
    const targetQuery = "guest_id=eq." + guestId + "&" + targetColumn + "=eq." + targetId;
    const existingResult = await rest("seller_content_likes?select=id&" + targetQuery + "&limit=1");
    const existing = existingResult.data?.[0];

    if (liked) {
      if (existing) await rest("seller_content_likes?id=eq." + existing.id, "DELETE", undefined, "return=minimal");
      return response({ liked: false });
    }
    if (existing) return response({ liked: true });

    if (targetType === "seller") {
      const seller = await rest("sellers?select=id&id=eq." + targetId + "&verification_status=eq.approved&limit=1");
      if (!seller.data?.length) return response({ error: "This seller is not available for likes." }, 404);
    } else {
      const product = await rest("products?select=id,seller_id&id=eq." + targetId + "&limit=1");
      if (!product.data?.length) return response({ error: "This product is not available for likes." }, 404);
      const seller = await rest("sellers?select=id&id=eq." + product.data[0].seller_id + "&verification_status=eq.approved&limit=1");
      if (!seller.data?.length) return response({ error: "This product is not available for likes." }, 404);
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const rate = await rest(
      "seller_content_likes?select=id&guest_id=eq." + guestId + "&created_at=gte." + encodeURIComponent(since),
      "HEAD",
      undefined,
      "count=exact"
    );
    if ((rate.count ?? 0) >= MAX_GUEST_LIKES_PER_DAY) {
      return response({ error: "You've reached today's guest-like limit. Please try again tomorrow." }, 429);
    }

    try {
      await rest("seller_content_likes", "POST", {
        user_id: null,
        guest_id: guestId,
        seller_id: targetType === "seller" ? targetId : null,
        product_id: targetType === "product" ? targetId : null,
      }, "return=minimal");
    } catch (error) {
      if ((error as any)?.code === "23505") return response({ liked: true });
      throw error;
    }
    return response({ liked: true });
  } catch (error) {
    console.error("guest-content-likes:", error);
    return response({ error: "Guest likes could not be saved right now. Please try again." }, 500);
  }
});
