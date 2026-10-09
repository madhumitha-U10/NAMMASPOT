import { mkdir, writeFile } from "node:fs/promises";

const origin = "https://nammaspot.vercel.app";
const staticPaths = ["/", "/explore", "/categories", "/featured"];
const urls = new Set(staticPaths.map((path) => origin + path));
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && publishableKey) {
  try {
    const endpoint = new URL("/rest/v1/sellers", supabaseUrl);
    endpoint.searchParams.set("select", "slug");
    endpoint.searchParams.set("verification_status", "eq.approved");
    endpoint.searchParams.set("limit", "5000");
    const response = await fetch(endpoint, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}`);
    const sellers = await response.json();
    for (const seller of sellers) {
      if (typeof seller.slug === "string" && /^[a-z0-9-]{1,100}$/i.test(seller.slug)) {
        urls.add(`${origin}/s/${encodeURIComponent(seller.slug)}`);
      }
    }
    console.log(`Sitemap includes ${sellers.length} approved seller profiles.`);
  } catch (error) {
    console.warn(`Could not refresh approved seller sitemap: ${error.message}. Keeping static public routes.`);
  }
} else {
  console.warn("Supabase build environment is missing; sitemap will include static public routes only.");
}

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].sort().map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", xml, "utf8");
