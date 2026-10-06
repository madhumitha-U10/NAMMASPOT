import { supabase } from "./supabase";

const cleanUrl = (value) => {
  const v = String(value || "").trim();
  if (!v) return "";
  let u;
  try { u = new URL(v); } catch { throw new Error("Enter a valid URL."); }
  if (!["http:","https:"].includes(u.protocol)) throw new Error("Only http/https links are allowed.");
  return u.toString().slice(0, 1000);
};

export function validatePublicUrl(value, label="URL") {
  if (!String(value || "").trim()) return "";
  try { return cleanUrl(value); } catch { throw new Error(label + " must be a valid http/https URL."); }
}

export async function getMicrosite(slug) {
  const { data: seller, error } = await supabase.from("sellers")
    .select("*,category:categories(id,name)")
    .eq("slug", slug).eq("verification_status","approved").maybeSingle();
  if (error) throw error;
  if (!seller) return null;
  const [{ data: settings, error: se }, { data: hours, error: he }, { data: specialDates, error: de }, { data: products, error: pe }] = await Promise.all([
    supabase.from("seller_website_settings").select("*").eq("seller_id",seller.id).maybeSingle(),
    supabase.from("seller_business_hours").select("*").eq("seller_id",seller.id).order("day_of_week"),
    supabase.from("seller_special_dates").select("*").eq("seller_id",seller.id).order("special_date"),
    supabase.from("products").select("id,seller_id,name,product_name,description,price,image_url,available,availability,category_id,featured,created_at,category:categories(id,name)").eq("seller_id",seller.id).eq("availability",true).order("featured",{ascending:false}).order("created_at",{ascending:false}).limit(100)
  ]);
  if (se || he || de || pe) throw se || he || de || pe;
  const ids=(products||[]).map(p=>p.id);
  let images=[];
  if(ids.length){ const r=await supabase.from("product_images").select("id,product_id,image_url,sort_order").in("product_id",ids).order("sort_order"); if(r.error) throw r.error; images=r.data||[]; }
  return {seller,settings:settings||null,hours:hours||[],specialDates:specialDates||[],products:(products||[]).map(p=>({...p,images:images.filter(i=>i.product_id===p.id)}))};
}

export async function getMyMicrosite(sellerId) {
  const [{data:settings,error:se},{data:hours,error:he},{data:specialDates,error:de}] = await Promise.all([
    supabase.from("seller_website_settings").select("*").eq("seller_id",sellerId).maybeSingle(),
    supabase.from("seller_business_hours").select("*").eq("seller_id",sellerId).order("day_of_week"),
    supabase.from("seller_special_dates").select("*").eq("seller_id",sellerId).order("special_date")
  ]);
  if(se||he||de) throw se||he||de;
  return {settings:settings||null,hours:hours||[],specialDates:specialDates||[]};
}

export async function saveMicrosite(sellerId, values) {
  const payload={
    seller_id:sellerId,
    tagline:String(values.tagline||"").trim().slice(0,180)||null,
    about:String(values.about||"").trim().slice(0,1500)||null,
    experience:String(values.experience||"").trim().slice(0,160)||null,
    services:String(values.services||"").trim().slice(0,600)||null,
    business_type:String(values.business_type||"").trim().slice(0,120)||null,
    area_served:String(values.area_served||"").trim().slice(0,180)||null,
    theme:["classic","warm","minimal"].includes(values.theme)?values.theme:"classic",
    business_highlights:Array.isArray(values.business_highlights)?values.business_highlights.map(x=>String(x).trim().slice(0,120)).filter(Boolean).slice(0,6):[],
    social_youtube_url:validatePublicUrl(values.social_youtube_url,"YouTube URL")||null,
    social_facebook_url:validatePublicUrl(values.social_facebook_url,"Facebook URL")||null,
    updated_at:new Date().toISOString()
  };
  const {data,error}=await supabase.from("seller_website_settings").upsert(payload,{onConflict:"seller_id"}).select("*").single();
  if(error) throw error; return data;
}

export async function saveHours(sellerId, hours) {
  const rows=(hours||[]).map(h=>({seller_id:sellerId,day_of_week:Number(h.day_of_week),is_open:Boolean(h.is_open),ranges:Array.isArray(h.ranges)?h.ranges.slice(0,4).map(r=>({open:String(r.open||""),close:String(r.close||"")})).filter(r=>r.open&&r.close):[]}));
  const {error:delError}=await supabase.from("seller_business_hours").delete().eq("seller_id",sellerId); if(delError) throw delError;
  if(rows.length){const {error}=await supabase.from("seller_business_hours").insert(rows); if(error) throw error;}
}

export async function saveSpecialDates(sellerId, dates) {
  const rows=(dates||[]).map(d=>({seller_id:sellerId,special_date:d.special_date,label:String(d.label||"Special date").trim().slice(0,120),is_closed:Boolean(d.is_closed),ranges:Array.isArray(d.ranges)?d.ranges.slice(0,4).map(r=>({open:String(r.open||""),close:String(r.close||"")})).filter(r=>r.open&&r.close):[]})).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d.special_date));
  const {error:delError}=await supabase.from("seller_special_dates").delete().eq("seller_id",sellerId); if(delError) throw delError;
  if(rows.length){const {error}=await supabase.from("seller_special_dates").insert(rows); if(error) throw error;}
}

export async function setProductFeatured(productId, featured) {
  const {error}=await supabase.from("products").update({featured:Boolean(featured)}).eq("id",productId); if(error) throw error;
}

export async function addProductGalleryImage(productId,sellerId,url,sortOrder=0) {
  const {error}=await supabase.from("product_images").insert({product_id:productId,seller_id:sellerId,image_url:String(url).slice(0,1000),sort_order:sortOrder}); if(error) throw error;
}

export async function deleteProductGalleryImage(id) {
  const {error}=await supabase.from("product_images").delete().eq("id",id); if(error) throw error;
}

export function formatHoursForDay(day) {
  const ranges=Array.isArray(day?.ranges)?day.ranges:[]; return ranges.map(r=>r.open+" – "+r.close).join(" · ");
}

export function sellerPublicUrl(slug) { return window.location.origin + "/s/" + encodeURIComponent(slug); }
