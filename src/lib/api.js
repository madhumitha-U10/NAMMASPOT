import { supabase, isSupabaseConfigured, isProductionConfigurationError, uploadSellerMedia, getSellerStorageUsage } from "./supabase";
import { seedSellers, categoryNames } from "./seed";

export { isSupabaseConfigured, isProductionConfigurationError, uploadSellerMedia, getSellerStorageUsage };

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("NammaSpot backend is not configured.");
    this.name = "BackendNotConfiguredError";
  }
}

const DEMO_KEY = "nammaspot-demo-state";
const CURRENT_USER_KEY = "nammaspot-demo-user";

function text(v, max = 1000) {
  return String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function uid(prefix = "demo") {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function seedState() {
  const sellers = seedSellers.map((seller) => ({
    ...seller,
    id: seller.id,
    slug: seller.slug,
    name: seller.name || seller.business_name,
    business_name: seller.name || seller.business_name,
    location: seller.location || seller.location_text || "Chennai",
    city: seller.city || "Chennai",
    phone: seller.phone || "",
    products: (seller.products || []).map((p) => ({ ...p, available: p.available ?? true })),
    verification_status: seller.verification_status || seller.status || "approved",
  }));
  return {
    users: [],
    sellers,
    products: sellers.flatMap((s) => (s.products || []).map((p) => ({ ...p, seller_id: s.id }))),
    enquiries: [],
    favourites: [],
    categories: [...categoryNames],
  };
}

function demoState() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sellers && parsed.categories) return parsed;
    }
  } catch {}
  const initial = seedState();
  localStorage.setItem(DEMO_KEY, JSON.stringify(initial));
  return initial;
}

function saveDemo(state) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  return state;
}

function currentDemoUser() {
  try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null"); } catch { return null; }
}

function setCurrentDemoUser(user) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

const COMMON_PASSWORDS = new Set([
  "password","password123","password1234","12345678","123456789",
  "qwerty123","qwertyui","admin123","welcome123","letmein123",
  "nammaspot","nammaspot123"
]);

export function validatePassword(password, context = {}) {
  const value = String(password || "");
  if (value.length < 10) throw new Error("Password must be at least 10 characters.");
  if (value.length > 128) throw new Error("Password must be 128 characters or fewer.");
  if (/\s/.test(value)) throw new Error("Password cannot contain spaces.");
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    throw new Error("Use uppercase, lowercase, a number and a symbol in your password.");
  }
  const lowered = value.toLowerCase();
  if (COMMON_PASSWORDS.has(lowered)) throw new Error("Choose a less common password.");
  for (const candidate of [context.nammaspotId, context.email, context.name]) {
    const part = String(candidate || "").trim().toLowerCase();
    if (part.length >= 4 && lowered.includes(part)) {
      throw new Error("Password must not contain your NammaSpot ID, email or name.");
    }
  }
  return true;
}

function needBackend() {
  if (!supabase) throw new BackendNotConfiguredError();
  return supabase;
}

function productsOf(rows = []) {
  return rows.map((p) => ({
    id: p.id,
    name: p.product_name || p.name,
    description: p.description ?? "",
    price: Number(p.price ?? 0),
    available: Boolean(p.availability ?? p.available),
    image_url: p.image_url ?? "",
    images: Array.isArray(p.product_images) ? p.product_images.map((x) => ({
      id: x.id,
      image_url: x.image_url,
      sort_order: Number(x.sort_order || 0),
    })) : [],
    category_id: p.category_id ?? null,
    created_at: p.created_at ?? null,
    seller_id: p.seller_id,
  }));
}

function sellerOf(row) {
  return {
    id: row.id,
    nammaspot_id: row.nammaspot_id ?? "",
    slug: row.slug,
    name: row.business_name || row.name,
    business_name: row.business_name || row.name,
    owner_name: row.owner_name ?? "",
    category: row.category?.name ?? row.category ?? "Local",
    category_id: row.category_id ?? "",
    location: row.location ?? row.location_text ?? row.city ?? "Chennai",
    location_url: row.location_url ?? "",
    city: row.city ?? "Chennai",
    description: row.description ?? "",
    phone: row.contact ?? row.phone ?? "",
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

const sellerSelect = "id,nammaspot_id,slug,business_name,owner_name,location,location_url,city,description,contact,whatsapp_phone,instagram_url,profile_image_url,cover_image_url,opening_time,closing_time,featured,verified,verification_status,category:categories(id,name),products(id,seller_id,product_name,description,price,availability,image_url,category_id,created_at)";

export async function getCategories() {
  if (!supabase) return demoState().categories.map((name) => ({ id: name, name }));
  const { data, error } = await supabase.from("categories").select("id,name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getPublicSellers({ query = "", category = "All", near = "" } = {}) {
  if (!supabase) {
    const state = demoState();
    const q = query.trim().toLowerCase();
    return state.sellers.filter((seller) => seller.verification_status === "approved").map((s) => ({
      ...s,
      products: state.products.filter((p) => p.seller_id === s.id),
    })).filter((s) => {
      const categoryOk = category === "All" || s.category === category;
      const nearOk = !near || (s.location || "").toLowerCase().includes(near.toLowerCase());
      const queryOk = !q || [s.name,s.category,s.location,s.description,...s.products.map((p) => p.name)].join(" ").toLowerCase().includes(q);
      return categoryOk && nearOk && queryOk;
    });
  }

  const { data, error } = await supabase.from("sellers").select(sellerSelect).eq("verification_status","approved").order("created_at",{ascending:false}).limit(60);
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
  if (!supabase) {
    const state = demoState();
    const row = state.sellers.find((s) => s.slug === slug || s.id === slug && s.verification_status === "approved");
    if (!row || row.verification_status !== "approved") return null;
    return { ...row, products: state.products.filter((p) => p.seller_id === row.id) };
  }
  const { data, error } = await supabase.from("sellers").select(sellerSelect).eq("slug",slug).eq("verification_status","approved").maybeSingle();
  if (error) throw error;
  return data ? sellerOf(data) : null;
}

export async function getSession() {
  if (!supabase) return currentDemoUser() ? { user: currentDemoUser() } : null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase().slice(0,320);
}

export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "+91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return String(value ?? "").trim();
}

export async function signInSeller(nammaspotId, password) {
  if (!supabase) throw new BackendNotConfiguredError();
  const client = needBackend();
  const cleanId = text(nammaspotId, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleanId) throw new Error("Enter your NammaSpot ID.");
  const email = cleanId.toLowerCase() + "@accounts.nammaspot.internal";
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function startSellerPasswordSetup(nammaspotId, email) {
  if (!supabase) throw new BackendNotConfiguredError();
  const client = needBackend();
  const normalized = normalizeEmail(email);
  const { data, error } = await client.rpc("lookup_seller_email", {
    p_nammaspot_id: text(nammaspotId, 40),
    p_email: normalized,
  });
  if (error) throw error;
  const seller = data?.[0];
  if (!seller) throw new Error("NammaSpot ID and email address do not match.");
  if (!["pending","approved"].includes(seller.verification_status)) throw new Error("This seller account cannot set a password right now.");
  const { data: otpGuard, error: otpGuardError } = await client.rpc("register_email_otp_request", { p_email: normalized });
  if (otpGuardError) throw otpGuardError;
  const { error: otpError } = await client.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: false },
  });
  if (otpError) throw otpError;
  if (otpGuard?.warning) console.warn("NammaSpot email OTP usage warning:", otpGuard.email_count, "emails in the current hour.");
  return normalized;
}

export async function verifySellerPasswordSetupOtp(email, token) {
  if (!supabase) throw new BackendNotConfiguredError();
  const { data, error } = await needBackend().auth.verifyOtp({
    email: normalizeEmail(email),
    token: text(token, 10),
    type: "email",
  });
  if (error) throw error;
  return data;
}

export async function setSellerPassword(password) {
  if (!supabase) throw new BackendNotConfiguredError();
  validatePassword(password);
  const { data, error } = await supabase.functions.invoke("set-seller-credentials", {
    body: { password },
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || "Could not create your login password.");
  return data;
}

export async function startSellerRegistration(values) {
  if (!supabase) throw new BackendNotConfiguredError();
  const client = needBackend();
  const cleanBusiness = text(values.business, 160);
  const cleanId = text(values.nammaspotId, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleanBusiness) throw new Error("Enter your business name.");
  if (!/^NS-[A-Z0-9_-]{6,20}$/.test(cleanId)) throw new Error("Choose a valid NammaSpot ID such as NS-000001.");
  validatePassword(values.password, { nammaspotId: cleanId, name: values.owner || cleanBusiness });

  const { data, error } = await client.functions.invoke("create-seller-account", {
    body: {
      nammaspotId: cleanId,
      password: values.password,
      business: cleanBusiness,
      owner: text(values.owner,120),
      phone: normalizePhone(values.phone),
      category: text(values.category,80),
      location: text(values.location,240),
      locationUrl: text(values.locationUrl,500),
      description: text(values.description,300),
      whatsapp: normalizePhone(values.whatsapp || values.phone),
      instagram: text(values.instagram,500),
    },
  });

  if (error) {
    let message = error.message;
    if (error.context && typeof error.context.clone === "function") {
      try {
        const response = await error.context.clone();
        const body = await response.json();
        message = body?.error || body?.message || message;
      } catch {}
    }
    throw new Error(message || "Seller account creation failed.");
  }
  if (!data?.ok) throw new Error(data?.error || "Seller account creation failed.");

  // The account is created with email confirmation already completed on the server.
  // Sign in immediately so the existing RLS-protected trigger/profile flow can be used.
  await signInSeller(cleanId, values.password);
  return { nammaspotId: cleanId };
}

export async function verifySellerRegistrationOtp() {
  throw new Error("Email verification is not used for NammaSpot seller signup.");
}

export async function signOut() {
  if (!supabase) { setCurrentDemoUser(null); return; }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUpSeller(values) {
  if (!supabase) throw new BackendNotConfiguredError();
  return startSellerRegistration(values);
}

export async function getCurrentProfile() {
  if (!supabase) {
    const user = currentDemoUser();
    return user ? { id:user.id,name:user.name,email:user.email,phone:user.phone,role:user.role } : null;
  }
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) return null;
  const { data,error } = await client.from("users").select("id,name,email,phone,role").eq("id",session.user.id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getMySeller() {
  if (!supabase) {
    const user = currentDemoUser();
    if (!user) throw new Error("Please sign in.");
    const row = demoState().sellers.find((s) => s.user_id === user.id);
    return row ? { ...row, products: demoState().products.filter((p) => p.seller_id === row.id) } : null;
  }
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) throw new Error("Please sign in.");
  const { data,error } = await client.from("sellers").select(sellerSelect).eq("user_id",session.user.id).maybeSingle();
  if (error) throw error;
  return data ? sellerOf(data) : null;
}

export async function updateSellerImages(sellerId, values) {
  if (!supabase) throw new BackendNotConfiguredError();
  const client = needBackend();
  const session = await getSession();
  if (!session?.user) throw new Error("Please sign in.");
  const { data: current, error: readError } = await client.from("sellers")
    .select("profile_image_url,cover_image_url")
    .eq("id", sellerId)
    .eq("user_id", session.user.id)
    .single();
  if (readError) throw readError;
  const payload = {
    ...(values.profile_image_url !== undefined ? { profile_image_url: values.profile_image_url || null } : {}),
    ...(values.cover_image_url !== undefined ? { cover_image_url: values.cover_image_url || null } : {}),
  };
  const { data, error } = await client.from("sellers").update(payload).eq("id", sellerId).eq("user_id", session.user.id).select("profile_image_url,cover_image_url").single();
  if (error) throw error;
  for (const oldUrl of [current?.profile_image_url, current?.cover_image_url]) {
    if (oldUrl && !Object.values(payload).includes(oldUrl)) {
      try { await removeOwnedSellerMedia(oldUrl); } catch {}
    }
  }
  return data;
}

export async function updateMySeller(sellerId, values) {
  if (!supabase) {
    const state = demoState(); const index = state.sellers.findIndex((s) => s.id === sellerId);
    if (index < 0) throw new Error("Seller profile not found.");
    state.sellers[index] = { ...state.sellers[index], business_name:text(values.business_name,160), name:text(values.business_name,160), owner_name:text(values.owner_name,120), category:text(values.category_id,80) || state.sellers[index].category, category_id:text(values.category_id,80), location:text(values.location,240), location_url:text(values.location_url,500), city:text(values.city,80) || "Chennai", description:text(values.description,600), phone:text(values.contact,40), contact:text(values.contact,40), whatsapp_phone:text(values.whatsapp_phone,40), instagram_url:text(values.instagram_url,500), opening_time:values.opening_time || "", closing_time:values.closing_time || "" };
    saveDemo(state); return { ...state.sellers[index], products:state.products.filter((p) => p.seller_id === sellerId) };
  }
  const client = needBackend();
  const { data,error } = await client.from("sellers").update({ business_name:text(values.business_name,160), owner_name:text(values.owner_name,120), category_id:values.category_id || null, location:text(values.location,240), location_url:text(values.location_url,500), city:text(values.city,80), description:text(values.description,600), contact:text(values.contact,40), whatsapp_phone:text(values.whatsapp_phone,40), instagram_url:text(values.instagram_url,500), opening_time:values.opening_time || null, closing_time:values.closing_time || null }).eq("id",sellerId).select("*,category:categories(id,name)").single();
  if (error) throw error;
  return data;
}

export async function listMyProducts(sellerId) {
  if (!supabase) return productsOf(demoState().products.filter((p) => p.seller_id === sellerId));
  const client = needBackend();
  const { data,error } = await client.from("products").select("id,seller_id,product_name,description,price,availability,image_url,category_id,created_at").eq("seller_id",sellerId).order("created_at",{ascending:false});
  if (error) throw error; return productsOf(data ?? []);
}

export async function createProduct(values) {
  if (!supabase) {
    const state=demoState(); const product={id:uid("product"),seller_id:values.seller_id,product_name:text(values.product_name,160),name:text(values.product_name,160),description:text(values.description,1000),price:Number(values.price),availability:Boolean(values.availability),available:Boolean(values.availability),image_url:text(values.image_url,800),category_id:values.category_id || null,created_at:new Date().toISOString()};
    state.products.unshift(product); saveDemo(state); return productsOf([product])[0];
  }
  const client = needBackend();
  const productName = text(values.product_name,160);
  if (!productName) throw new Error("Enter a product name.");
  const { data,error } = await client.from("products").insert({
    seller_id:values.seller_id,
    name:productName,
    product_name:productName,
    description:text(values.description,1000),
    price:Number(values.price),
    available:Boolean(values.availability),
    availability:Boolean(values.availability),
    image_url:text(values.image_url,800) || null,
    category_id:values.category_id || null
  }).select("id,seller_id,name,product_name,description,price,available,availability,image_url,category_id,created_at").single();
  if (error) throw error; return productsOf([data])[0];
}

export async function updateProduct(productId,values) {
  if (!supabase) {
    const state=demoState(); const index=state.products.findIndex((p)=>p.id===productId);
    if(index<0) throw new Error("Product not found.");
    state.products[index]={...state.products[index],product_name:text(values.product_name,160),name:text(values.product_name,160),description:text(values.description,1000),price:Number(values.price),availability:Boolean(values.availability),available:Boolean(values.availability),image_url:text(values.image_url,800),category_id:values.category_id || null};
    saveDemo(state); return productsOf([state.products[index]])[0];
  }
  const client=needBackend();
  const productName = text(values.product_name,160);
  if (!productName) throw new Error("Enter a product name.");
  const {data,error}=await client.from("products").update({
    name:productName,
    product_name:productName,
    description:text(values.description,1000),
    price:Number(values.price),
    available:Boolean(values.availability),
    availability:Boolean(values.availability),
    image_url:text(values.image_url,800)||null,
    category_id:values.category_id||null
  }).eq("id",productId).select("id,seller_id,name,product_name,description,price,available,availability,image_url,category_id,created_at").single();
  if(error) throw error; return productsOf([data])[0];
}

function sellerMediaPathFromUrl(url, userId) {
  if (!url || !userId) return null;
  const marker = "/storage/v1/object/public/seller-media/";
  const index = String(url).indexOf(marker);
  if (index < 0) return null;
  const path = decodeURIComponent(String(url).slice(index + marker.length));
  return path.startsWith(userId + "/") ? path : null;
}

async function removeOwnedSellerMedia(url) {
  const session = await getSession();
  const path = sellerMediaPathFromUrl(url, session?.user?.id);
  if (!path) return;
  const { error } = await supabase.storage.from("seller-media").remove([path]);
  if (error) throw error;
}

export async function deleteProduct(productId) {
  if (!supabase) { const state=demoState(); state.products=state.products.filter((p)=>p.id!==productId); saveDemo(state); return; }
  const client=needBackend();
  const { data: product, error: fetchError } = await client.from("products").select("id,image_url").eq("id",productId).single();
  if (fetchError) throw fetchError;
  if (product?.image_url) await removeOwnedSellerMedia(product.image_url);
  const {error}=await client.from("products").delete().eq("id",productId);
  if(error) throw error;
}

export async function createEnquiry(values) {
  if (!supabase) {
    const state=demoState();
    state.enquiries.unshift({id:uid("enquiry"),user_id:currentDemoUser()?.id||null,seller_id:values.seller_id,product_id:values.product_id||null,customer_name:text(values.customer_name,120),customer_contact:text(values.customer_contact,160),message:text(values.message,1000),status:"pending",enquiry_date:new Date().toISOString(),product:{product_name:demoState().products.find((p)=>p.id===values.product_id)?.name||""}});
    saveDemo(state); return {id:state.enquiries[0].id,status:"pending"};
  }
  const client=needBackend(); const session=await getSession(); const {data,error}=await client.from("enquiries").insert({user_id:session?.user?.id||null,seller_id:values.seller_id,product_id:values.product_id||null,customer_name:text(values.customer_name,120),customer_contact:text(values.customer_contact,160),message:text(values.message,1000),status:"pending"}).select("id,status").single(); if(error) throw error; return data;
}

export async function getMyEnquiries(sellerId) {
  if (!supabase) return demoState().enquiries.filter((e)=>e.seller_id===sellerId);
  const client=needBackend(); const {data,error}=await client.from("enquiries").select("id,customer_name,customer_contact,message,status,enquiry_date,product:products(product_name)").eq("seller_id",sellerId).order("enquiry_date",{ascending:false}); if(error) throw error; return data||[];
}

export async function updateEnquiryStatus(id,status) {
  if (!supabase) { const state=demoState(); const item=state.enquiries.find((e)=>e.id===id); if(item)item.status=status; saveDemo(state); return; }
  const client=needBackend(); const {error}=await client.from("enquiries").update({status}).eq("id",id); if(error) throw error;
}

export async function listMyFavourites() {
  if (!supabase) { const user=currentDemoUser(); return user ? demoState().favourites.filter((x)=>x.user_id===user.id).map((x)=>x.seller_id) : []; }
  const client=needBackend(); const session=await getSession(); if(!session?.user)return []; const {data,error}=await client.from("favourites").select("seller_id").eq("user_id",session.user.id); if(error)throw error; return (data||[]).map((x)=>x.seller_id);
}

export async function saveFavourite(sellerId) {
  if (!supabase) { const state=demoState(); const user=currentDemoUser(); if(!user) return; if(!state.favourites.some((x)=>x.user_id===user.id&&x.seller_id===sellerId))state.favourites.push({user_id:user.id,seller_id:sellerId}); saveDemo(state); return; }
  const client=needBackend(); const session=await getSession(); if(!session?.user)throw new Error("Please sign in to sync saved sellers."); const {error}=await client.from("favourites").insert({user_id:session.user.id,seller_id:sellerId}); if(error&&error.code!=="23505")throw error;
}

export async function removeFavourite(sellerId) {
  if (!supabase) { const state=demoState(); const user=currentDemoUser(); state.favourites=state.favourites.filter((x)=>x.user_id!==user?.id||x.seller_id!==sellerId); saveDemo(state); return; }
  const client=needBackend(); const session=await getSession(); if(!session?.user)return; const {error}=await client.from("favourites").delete().eq("user_id",session.user.id).eq("seller_id",sellerId); if(error)throw error;
}

export async function isCurrentUserAdmin() {
  if (!supabase) return currentDemoUser()?.role === "admin";
  const client=needBackend(); const session=await getSession(); if(!session?.user)return false; const {data,error}=await client.from("admins").select("user_id").eq("user_id",session.user.id).maybeSingle(); if(error)throw error; return Boolean(data);
}

export async function changeCurrentUserPassword(newPassword) {
  if (!supabase) throw new BackendNotConfiguredError();
  validatePassword(newPassword);
  const client = needBackend();
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function adminOtpUsageAlerts() {
  if (!supabase) return [];
  const client = needBackend();
  const { data, error } = await client.rpc("admin_otp_usage_alerts");
  if (error) throw error;
  return data ?? [];
}

export async function adminStorageUsage() {
  if (!supabase) return null;
  const client = needBackend();
  const { data, error } = await client.rpc("admin_storage_usage");
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function adminListSellers() {
  if (!supabase) return demoState().sellers.map((s)=>({id:s.id,slug:s.slug,business_name:s.business_name,owner_name:s.owner_name,contact:s.contact||s.phone,whatsapp_phone:s.whatsapp_phone||s.whatsapp||s.contact||s.phone,verification_status:s.verification_status,verified:s.verified,created_at:s.created_at||"",location:s.location,category:{name:s.category}}));
  const client=needBackend(); const {data,error}=await client.from("sellers").select("id,slug,business_name,owner_name,contact,whatsapp_phone,verification_status,verified,created_at,location,category:categories(name)").order("created_at",{ascending:false}).limit(100); if(error)throw error; return data||[];
}

export async function adminDeleteSuspendedSeller(sellerId) {
  if (!supabase) {
    const state = demoState();
    const seller = state.sellers.find((item) => item.id === sellerId);
    if (!seller) throw new Error("Seller not found.");
    if (seller.verification_status !== "suspended") throw new Error("Only suspended seller accounts can be permanently deleted.");
    const userId = seller.user_id;
    state.favourites = state.favourites.filter((item) => item.seller_id !== sellerId);
    state.enquiries = state.enquiries.filter((item) => item.seller_id !== sellerId);
    state.products = state.products.filter((item) => item.seller_id !== sellerId);
    state.sellers = state.sellers.filter((item) => item.id !== sellerId);
    if (userId) state.users = state.users.filter((item) => item.id !== userId);
    if (currentDemoUser()?.id === userId) setCurrentDemoUser(null);
    saveDemo(state);
    return { success: true, seller_id: sellerId };
  }
  const client = needBackend();
  const { data, error } = await client.functions.invoke("admin-delete-suspended-seller", {
    body: { seller_id: sellerId },
  });
  if (error) {
    if (error.context && typeof error.context.json === "function") {
      try {
        const body = await error.context.clone().json();
        throw new Error(body?.error || body?.message || error.message);
      } catch (responseError) {
        if (responseError instanceof Error && responseError.message) throw responseError;
      }
    }
    throw error;
  }
  if (!data?.success) throw new Error(data?.error || "Permanent deletion failed.");
  return data;
}

export async function adminUpdateSellerStatus(id,status) {
  if (!supabase) { const state=demoState(); const item=state.sellers.find((s)=>s.id===id); if(item){item.verification_status=status;item.verified=status==="approved";} saveDemo(state); return; }
  const client=needBackend(); const {error}=await client.from("sellers").update({verification_status:status,verified:status==="approved"}).eq("id",id); if(error)throw error;
}

export async function adminListCategories() {
  if (!supabase) return demoState().categories.map((name)=>({id:name,name}));
  const client=needBackend(); const {data,error}=await client.from("categories").select("id,name").order("name"); if(error)throw error; return data||[];
}

export async function adminAddCategory(name) {
  if (!supabase) { const state=demoState(); const value=text(name,80); if(value&&!state.categories.includes(value))state.categories.push(value); saveDemo(state); return; }
  const client=needBackend(); const {error}=await client.from("categories").insert({name:text(name,80)}); if(error)throw error;
}

export async function adminRenameCategory(id,name) {
  if (!supabase) { const state=demoState(); const index=state.categories.findIndex((x)=>x===id); if(index>=0)state.categories[index]=text(name,80); saveDemo(state); return; }
  const client=needBackend(); const {error}=await client.from("categories").update({name:text(name,80)}).eq("id",id); if(error)throw error;
}

export async function adminDeleteCategory(id) {
  if (!supabase) { const state=demoState(); state.categories=state.categories.filter((x)=>x!==id); saveDemo(state); return; }
  const client=needBackend(); const {error}=await client.from("categories").delete().eq("id",id); if(error)throw error;
}export async function signInAdmin(email,password) {
  if (!supabase) {
    if (text(email,320).toLowerCase() === "admin@nammaspot.local" && password === "nammaspot-demo") {
      const user = { id:"demo-admin", name:"NammaSpot Admin", email:text(email,320).toLowerCase(), phone:"", role:"admin" };
      setCurrentDemoUser(user);
      return { session:{user}, demo:true };
    }
    throw new Error("Invalid admin login.");
  }
  const client=needBackend();
  const {data,error}=await client.auth.signInWithPassword({email:text(email,320).toLowerCase(),password});
  if(error) throw error;
  const {data:admin,error:adminError}=await client.from("admins").select("user_id").eq("user_id",data.user.id).maybeSingle();
  if(adminError) throw adminError;
  if(!admin) {
    await client.auth.signOut();
    throw new Error("This account is not a NammaSpot admin.");
  }
  return data;
}

export async function signIn(email,password) {
  if (!supabase) {
    if (text(email,320).toLowerCase() === "admin@nammaspot.local" && password === "nammaspot-demo") {
      const user = { id:"demo-admin", name:"NammaSpot Admin", email:text(email,320).toLowerCase(), phone:"", role:"admin" };
      setCurrentDemoUser(user);
      return { session:{user}, demo:true };
    }
    throw new Error("Seller login uses your NammaSpot ID and password.");
  }
  return signInAdmin(email,password);
}
