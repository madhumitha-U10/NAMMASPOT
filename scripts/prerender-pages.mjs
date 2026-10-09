import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = "https://nammaspot.vercel.app";
const basePath = path.resolve("dist/index.html");
const baseHtml = await readFile(basePath, "utf8");

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function replaceMeta(html, selector, tag) {
  const re = new RegExp("<meta(?=[^>]*" + selector + ")[^>]*>", "i");
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", "    " + tag + "\n  </head>");
}
function withMetadata(html, { title, description, url, image = origin + "/og-image.svg", robots = "index,follow,max-image-preview:large", type = "website", jsonLd = null }) {
  let result = html.replace(/<title>[^<]*<\/title>/i, "<title>" + escapeHtml(title) + "</title>");
  result = replaceMeta(result, 'name="description"', '<meta name="description" content="' + escapeHtml(description) + '" />');
  result = replaceMeta(result, 'name="robots"', '<meta name="robots" content="' + escapeHtml(robots) + '" />');
  result = replaceMeta(result, 'rel="canonical"', '<link rel="canonical" href="' + escapeHtml(url) + '" />');
  result = replaceMeta(result, 'property="og:title"', '<meta property="og:title" content="' + escapeHtml(title) + '" />');
  result = replaceMeta(result, 'property="og:description"', '<meta property="og:description" content="' + escapeHtml(description) + '" />');
  result = replaceMeta(result, 'property="og:url"', '<meta property="og:url" content="' + escapeHtml(url) + '" />');
  result = replaceMeta(result, 'property="og:image"', '<meta property="og:image" content="' + escapeHtml(image) + '" />');
  result = replaceMeta(result, 'property="og:type"', '<meta property="og:type" content="' + escapeHtml(type) + '" />');
  result = replaceMeta(result, 'name="twitter:title"', '<meta name="twitter:title" content="' + escapeHtml(title) + '" />');
  result = replaceMeta(result, 'name="twitter:description"', '<meta name="twitter:description" content="' + escapeHtml(description) + '" />');
  result = replaceMeta(result, 'name="twitter:image"', '<meta name="twitter:image" content="' + escapeHtml(image) + '" />');
  if (jsonLd) result = result.replace("</head>", '    <script type="application/ld+json">' + JSON.stringify(jsonLd).replace(/</g, "\\u003c") + "</script>\n  </head>");
  return result;
}

const routes = [
  ["/explore", "Explore Local Sellers · NammaSpot", "Explore local businesses, products, makers and home sellers across Tamil Nadu."],
  ["/categories", "Shop by Category · NammaSpot", "Discover local sellers by category on NammaSpot."],
  ["/featured", "Featured Local Sellers · NammaSpot", "Meet featured local sellers and small businesses on NammaSpot."],
  ["/register", "Create Seller Account · NammaSpot", "Create a NammaSpot seller account and publish your local business catalogue after approval.", "noindex,nofollow,noarchive"],
  ["/login", "Seller Login · NammaSpot", "Sign in to manage your NammaSpot seller account.", "noindex,nofollow,noarchive"],
  ["/nammaspot-control-panel/login", "Admin Login · NammaSpot", "Authorized NammaSpot administration access.", "noindex,nofollow,noarchive"],
  ["/nammaspot-control-panel/dashboard", "Admin Console · NammaSpot", "Authorized NammaSpot administration console.", "noindex,nofollow,noarchive"],
  ["/dashboard", "Seller Dashboard · NammaSpot", "Manage your NammaSpot business profile, catalogue and enquiries.", "noindex,nofollow,noarchive"]
];

for (const [route, title, description, robots] of routes) {
  const folder = path.join("dist", route.replace(/^\//, ""));
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, "index.html"), withMetadata(baseHtml, {
    title, description, url: origin + route, robots: robots || "index,follow,max-image-preview:large"
  }), "utf8");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !key) {
  console.warn("Supabase build environment is missing; seller HTML pre-rendering skipped.");
} else {
  try {
    const endpoint = new URL("/rest/v1/sellers", supabaseUrl);
    endpoint.searchParams.set("select", "slug,business_name,description,location,city,contact,profile_image_url,cover_image_url,instagram_url");
    endpoint.searchParams.set("verification_status", "eq.approved");
    endpoint.searchParams.set("limit", "5000");
    const response = await fetch(endpoint, {
      headers: { apikey: key, Authorization: "Bearer " + key },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error("Supabase returned HTTP " + response.status);
    const sellers = await response.json();
    for (const seller of sellers) {
      if (typeof seller.slug !== "string" || !/^[a-z0-9-]{1,100}$/i.test(seller.slug)) continue;
      const url = origin + "/s/" + encodeURIComponent(seller.slug);
      const title = (seller.business_name || "Local seller") + " · Catalogue · NammaSpot";
      const description = (seller.description || "Discover this local seller and their catalogue on NammaSpot.").replace(/\s+/g, " ").slice(0, 155);
      const image = seller.cover_image_url || seller.profile_image_url || origin + "/og-image.svg";
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": url + "#business",
        name: seller.business_name || "Local seller",
        description,
        url,
        image,
        telephone: seller.contact || undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: seller.city || seller.location || "Tamil Nadu",
          addressRegion: "Tamil Nadu",
          addressCountry: "IN"
        },
        sameAs: seller.instagram_url ? [seller.instagram_url] : undefined
      };
      const folder = path.join("dist", "s", seller.slug);
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, "index.html"), withMetadata(baseHtml, { title, description, url, image, type: "profile", jsonLd }), "utf8");
    }
    console.log("Pre-rendered " + sellers.length + " approved seller profile pages for search and social crawlers.");
  } catch (error) {
    console.warn("Could not pre-render seller profiles: " + error.message);
  }
}
