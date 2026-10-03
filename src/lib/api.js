import { supabase, isSupabaseConfigured, uploadSellerMedia } from "./supabase";
import { seedSellers, categoryNames } from "./seed";

export { isSupabaseConfigured, uploadSellerMedia };

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("NammaSpot backend is not configured.");
    this.name = "BackendNotConfiguredError";
  }
}

function needBackend() {
  if (!supabase) throw new BackendNotConfiguredError();
  return supabase;
}

function text(v, max = 1000) {
  return String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function productsOf(rows = []) {
  return rows.map((p) => ({
    id: p.id,
    name: p.product_name,
    description: p.description ?? "",
    price: Number(p.price ?? 0),
    available: Boolean(p.availability),
    image_url: p.image_url ?? "",
    category_id: p.category_id ?? null,
    created_at: p.created_at ?? null,
    seller_id: p.seller_id,
  }));
}

function sellerOf(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.business_name,
    business_name: row.business_name,
    owner_name: row.owner_name ?? "",
    category: row.category?.name ?? "Local",
    category_id: row.category_id ?? "",
    location: row.location ?? row.city ?? "Chennai",
    location_url: row.location_url ?? "",
    city: row.city ?? "Chennai",
    description: row.description ?? "",
    phone: row.contact ?? "",
    whatsapp_phone: row.whatsapp_phone ?? "",
    instagram_url: row.instagram_url ?? "",
    profile_image_url: row.profile_image_url ?? "",
    cover_image_url: row.cover_image_url ?? "",
    opening_time: row.opening_time ?? "",
    closing_time: row.closing_time ?? "",
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
    verification_status: row.verification_status ?? "pending",
    products: productsOf(row.products ?? []),
  };
}

const sellerSelect = "id,slug,business_name,owner_name,location,location_url,city,description,contact,whatsapp_phone,instagram_url,profile_image_url,cover_image_url,opening_time,closing_time,featured,verified,verification_status,category:categories(id,name),products(id,seller_id,product_name,description,price,availability,image_url,category_id,created_at)";

export async function getCategories() {
  if (!supabase) return categoryNames.map((name) => ({ id: name, name }));
  const { data, error } = await supabase.from("categories").select("id,name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublicSellers({ query = "", category = "All", near = "" } = {}) {
  if (!supabase) {
    const q = query.trim().toLowerCase();
    return seedSellers.filter((s) => {
      const categoryOk = category === "All" || s.category === category;
      const nearOk = !near || (s.location || "").toLowerCase().includes(near.toLowerCase());
      const queryOk = !q || [s.name,s.category,s.location,s.description,...s.products.map((p) => p.name)].join(" ").toLowerCase().includes(q);
      return categoryOk && nearOk && queryOk;
    });
  }

  const { data, error } = await supabase
    .from("sellers")
    .select(sellerSelect)
    .eq("verification_status","approved")
    .order("created_at",{ascending:false})
    .limit(60);

  if (error) throw error;

  const q = query.trim().toLowerCase();
  return (data ?? []).map(sellerOf).filter((s) => {
    const categoryOk = category === "All" || s.category === category;
    const nearOk = !near || s.location.toLowerCase().includes(near.toLowerCase());
    const queryOk = !q || [s.name,s.category,s.location,s.description,...s.products.map((p) => p.name)].join(" ").toLowerCase().includes(q);
    return categoryOk && nearOk && queryOk;
  });
}

export async function getPublicSeller(slug) {
  if (!supabase) return seedSellers.find((s) => s.slug === slug || s.id === slug) ?? null;
  const { data, error } = await supabase.from("sellers").select(sellerSelect).eq("slug",slug).eq("verification_status","approved").maybeSingle();
  if (error) throw error;
  return data ? sellerOf(data) : null;
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signIn(email,password) {
  const client = needBackend();
  const { data,error } = await client.auth.signInWithPassword({ email: text(email,320).toLowerCase(), password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUpSeller(values) {
  const client = needBackend();
  const metadata = {
    role:"seller",
    name:text(values.owner,120),
    phone:text(values.phone,40),
    business_name:text(values.business,160),
    category_name:text(values.category,80),
    location:text(values.location,240),
    location_url:text(values.locationUrl,500),
    description:text(values.description,300),
    whatsapp_phone:text(values.whatsapp,40),
    instagram_url:text(values.instagram,500),
  };
  const { data,error } = await client.auth.signUp({
    email:text(values.email,320).toLowerCase(),
    password:values.password,
    options:{ data:metadata },
  });
  if (error) throw error;
  return data;
}

export async function getCurrentProfile() {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) return null;
  const { data,error } = await client.from("users").select("id,name,email,phone,role").eq("id",session.user.id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getMySeller() {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) throw new Error("Please sign in.");
  const { data,error } = await client.from("sellers").select(sellerSelect).eq("user_id",session.user.id).maybeSingle();
  if (error) throw error;
  return data ? sellerOf(data) : null;
}

export async function updateMySeller(sellerId, values) {
  const client = needBackend();
  const { data,error } = await client.from("sellers").update({
    business_name:text(values.business_name,160),
    owner_name:text(values.owner_name,120),
    category_id:values.category_id || null,
    location:text(values.location,240),
    location_url:text(values.location_url,500),
    city:text(values.city,80),
    description:text(values.description,600),
    contact:text(values.contact,40),
    whatsapp_phone:text(values.whatsapp_phone,40),
    instagram_url:text(values.instagram_url,500),
    opening_time:values.opening_time || null,
    closing_time:values.closing_time || null,
  }).eq("id",sellerId).select("*,category:categories(id,name)").single();
  if (error) throw error;
  return data;
}

export async function listMyProducts(sellerId) {
  const client = needBackend();
  const { data,error } = await client.from("products").select("id,seller_id,product_name,description,price,availability,image_url,category_id,created_at").eq("seller_id",sellerId).order("created_at",{ascending:false});
  if (error) throw error;
  return productsOf(data ?? []);
}

export async function createProduct(values) {
  const client = needBackend();
  const { data,error } = await client.from("products").insert({
    seller_id:values.seller_id,
    product_name:text(values.product_name,160),
    description:text(values.description,1000),
    price:Number(values.price),
    availability:Boolean(values.availability),
    image_url:text(values.image_url,800) || null,
    category_id:values.category_id || null,
  }).select("id,seller_id,product_name,description,price,availability,image_url,category_id,created_at").single();
  if (error) throw error;
  return productsOf([data])[0];
}

export async function updateProduct(productId,values) {
  const client = needBackend();
  const { data,error } = await client.from("products").update({
    product_name:text(values.product_name,160),
    description:text(values.description,1000),
    price:Number(values.price),
    availability:Boolean(values.availability),
    image_url:text(values.image_url,800) || null,
    category_id:values.category_id || null,
  }).eq("id",productId).select("id,seller_id,product_name,description,price,availability,image_url,category_id,created_at").single();
  if (error) throw error;
  return productsOf([data])[0];
}

export async function deleteProduct(productId) {
  const client = needBackend();
  const { error } = await client.from("products").delete().eq("id",productId);
  if (error) throw error;
}

export async function createEnquiry(values) {
  const client = needBackend();
  const session = await getSession();
  const { data,error } = await client.from("enquiries").insert({
    user_id:session?.user?.id || null,
    seller_id:values.seller_id,
    product_id:values.product_id || null,
    customer_name:text(values.customer_name,120),
    customer_contact:text(values.customer_contact,160),
    message:text(values.message,1000),
    status:"pending",
  }).select("id,status").single();
  if (error) throw error;
  return data;
}

export async function getMyEnquiries(sellerId) {
  const client = needBackend();
  const { data,error } = await client.from("enquiries").select("id,customer_name,customer_contact,message,status,enquiry_date,product:products(product_name)").eq("seller_id",sellerId).order("enquiry_date",{ascending:false});
  if (error) throw error;
  return data ?? [];
}

export async function updateEnquiryStatus(id,status) {
  const client = needBackend();
  const { error } = await client.from("enquiries").update({status}).eq("id",id);
  if (error) throw error;
}

export async function listMyFavourites() {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) return [];
  const { data,error } = await client.from("favourites").select("seller_id").eq("user_id",session.user.id);
  if (error) throw error;
  return (data ?? []).map((x) => x.seller_id);
}

export async function saveFavourite(sellerId) {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) throw new Error("Please sign in to sync saved sellers.");
  const { error } = await client.from("favourites").insert({ user_id:session.user.id, seller_id:sellerId });
  if (error && error.code !== "23505") throw error;
}

export async function removeFavourite(sellerId) {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) return;
  const { error } = await client.from("favourites").delete().eq("user_id",session.user.id).eq("seller_id",sellerId);
  if (error) throw error;
}

export async function isCurrentUserAdmin() {
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) return false;
  const { data,error } = await client.from("admins").select("id").eq("user_id",session.user.id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function adminListSellers() {
  const client = needBackend();
  const { data,error } = await client.from("sellers").select("id,slug,business_name,owner_name,contact,verification_status,verified,created_at,location,category:categories(name)").order("created_at",{ascending:false}).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateSellerStatus(id,status) {
  const client = needBackend();
  const { error } = await client.from("sellers").update({verification_status:status,verified:status==="approved"}).eq("id",id);
  if (error) throw error;
}

export async function adminListCategories() {
  const client = needBackend();
  const { data,error } = await client.from("categories").select("id,name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function adminAddCategory(name) {
  const client = needBackend();
  const { error } = await client.from("categories").insert({name:text(name,80)});
  if (error) throw error;
}

export async function adminRenameCategory(id,name) {
  const client = needBackend();
  const { error } = await client.from("categories").update({name:text(name,80)}).eq("id",id);
  if (error) throw error;
}

export async function adminDeleteCategory(id) {
  const client = needBackend();
  const { error } = await client.from("categories").delete().eq("id",id);
  if (error) throw error;
}
