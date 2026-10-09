import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"https://nammaspot.vercel.app","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
async function sha256(value:string){const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,"0")).join("");}
const common=new Set(["password","password123","password1234","12345678","123456789","qwerty123","qwertyui","admin123","welcome123","letmein123","nammaspot","nammaspot123"]);
const txt=(v:any,n:number)=>String(v??"").trim().slice(0,n);
const phone=(v:any)=>String(v??"").replace(/[^0-9]/g,"").replace(/^0/,"+91").replace(/^91/,"+91").replace(/^\+91/,"+91").slice(0,13);
function pass(p:string,id:string,name:string){if(p.length<10)throw Error("Password must be at least 10 characters.");if(p.length>128)throw Error("Password must be 128 characters or fewer.");if(/\s/.test(p)||!/[a-z]/.test(p)||!/[A-Z]/.test(p)||!/[0-9]/.test(p)||!/[^A-Za-z0-9]/.test(p))throw Error("Use uppercase, lowercase, a number and a symbol, with no spaces.");const x=p.toLowerCase();if(common.has(x)||[id,name].some(v=>String(v).length>=4&&x.includes(String(v).toLowerCase())))throw Error("Choose a stronger password that does not contain your NammaSpot ID or name.");}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const b=await req.json(); const business=txt(b.business,160), owner=txt(b.owner,120), p=phone(b.phone), w=phone(b.whatsapp), loc=txt(b.location,240), id=txt(b.nammaspotId,40).toUpperCase().replace(/[^A-Z0-9_-]/g,""), password=String(b.password??"");
  if(!business)throw Error("Enter your business name.");
  if(!owner)throw Error("Enter your name.");
  if(!p||p.replace(/\D/g,"").length<10)throw Error("Enter a valid business phone number.");
  if(!w||w.replace(/\D/g,"").length<10)throw Error("Enter a valid WhatsApp number.");
  if(!loc)throw Error("Enter your business location (area, town or city).");
  if(!/^NS-[A-Z0-9_-]{6,20}$/.test(id))throw Error("Choose a valid NammaSpot ID such as NS-000001.");
  pass(password,id,owner||business);
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if(!url||!key)throw Error("Seller registration service is not configured.");
  const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const rate=await admin.rpc("check_seller_registration_rate_limit",{p_ip_hash:await sha256(ip),p_phone_hash:await sha256(p),p_id_hash:await sha256(id.toLowerCase())});
  if(rate.error)throw Error("Registration is temporarily unavailable. Please try again later.");
  if(rate.data!==true)return new Response(JSON.stringify({ok:false,error:"Too many registration attempts. Please try again later."}),{status:429,headers:{...cors,"Content-Type":"application/json"}});
  const email=id.toLowerCase()+"@accounts.nammaspot.internal";
  const users=await admin.auth.admin.listUsers({page:1,perPage:1000});
  if(users.data?.users?.some((u:any)=>u.email?.toLowerCase()===email))throw Error("That NammaSpot ID is already in use. Please choose another ID.");
  const meta={role:"seller",nammaspot_id:id,name:owner,email,phone:p,business_name:business,category_name:txt(b.category,80),location:loc,location_url:txt(b.locationUrl,500),description:txt(b.description,300),whatsapp_phone:w,instagram_url:txt(b.instagram,500)};
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:meta});
  if(created.error)throw created.error;
  if(!created.data.user)throw Error("Could not create the seller account.");
  return new Response(JSON.stringify({ok:true,nammaspotId:id}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({ok:false,error:e instanceof Error?e.message:"Seller account creation failed."}),{status:400,headers:{...cors,"Content-Type":"application/json"}});}
});