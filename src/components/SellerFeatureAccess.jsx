import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, Send } from "lucide-react";
import { supabase } from "../lib/supabase";

const FEATURES = [
  { key: "offers", label: "Offers section", description: "Display seasonal and special offers on your public seller page." },
  { key: "polls", label: "Catalogue polls", description: "Ask customers which products, colours or collections they prefer." },
  { key: "subcategories", label: "Catalogue subcategories", description: "Organise products into smaller catalogue sections." },
  { key: "advanced_catalogue", label: "Advanced catalogue", description: "Request access to additional catalogue organisation tools." },
];
export default function SellerFeatureAccess({ seller }) {
  const [rows,setRows]=useState([]);
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const load=async()=>{
    if(!supabase||!seller?.id)return;
    const {data,error:queryError}=await supabase.from("seller_feature_access").select("feature_key,status,enabled,requested_at,reviewed_at,review_note").eq("seller_id",seller.id);
    if(queryError)throw queryError;
    setRows(data||[]);
  };
  useEffect(()=>{load().catch(e=>setError(e.message||"Could not load feature access."));},[seller?.id]);
  const request=async(key)=>{
    setBusy(key);setError("");setNotice("");
    try{
      const {error:rpcError}=await supabase.rpc("seller_request_feature",{p_feature_key:key});
      if(rpcError)throw rpcError;
      await load();setNotice("Your request has been sent to NammaSpot admin for review.");
    }catch(e){setError(e.message||"Could not submit your request.");}
    finally{setBusy("");}
  };
  return <section className="seller-feature-access">
    <div className="dashboard-section-head"><div><div className="eyebrow">GROW YOUR CATALOGUE</div><h2>Seller growth features</h2><p>Request additional tools. NammaSpot admin reviews each feature separately for your business.</p></div><span className="status-pill">Admin controlled</span></div>
    {error&&<div className="inline-error" role="alert">{error}</div>}
    {notice&&<div className="form-status" role="status"><CheckCircle2 size={17}/>{notice}</div>}
    <div className="seller-feature-grid">{FEATURES.map(feature=>{
      const row=rows.find(item=>item.feature_key===feature.key);
      const approved=row?.status==="approved"&&row?.enabled;
      const pending=row?.status==="pending";
      return <article className="seller-feature-card" key={feature.key}>
        <div className="seller-feature-card-head"><span>{feature.label}</span><span className={"status-pill "+(approved?"status-ok":pending?"status-warning":"")}>{approved?"Enabled":pending?"Pending":row?.status==="rejected"?"Not approved":row?.status==="suspended"?"Paused":"Not enabled"}</span></div>
        <p>{feature.description}</p>
        {approved?<div className="seller-feature-enabled"><CheckCircle2 size={16}/>Available in your seller tools</div>:pending?<div className="seller-feature-pending"><Clock3 size={16}/>Waiting for admin approval</div>:<button className="secondary-button" disabled={Boolean(busy)||seller?.verification_status!=="approved"} onClick={()=>request(feature.key)}><Send size={15}/>{busy===feature.key?"Sending…":"Request access"}</button>}
        {row?.review_note&&<small className="muted-note">Admin note: {row.review_note}</small>}
      </article>;
    })}</div>
    <p className="muted-note"><LockKeyhole size={14}/> Features stay unavailable until an admin approves access for your seller account.</p>
  </section>;
}
