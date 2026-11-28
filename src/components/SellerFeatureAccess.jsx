import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, Send, Tag, Vote, Layers3 } from "lucide-react";
import { supabase } from "../lib/supabase";

const FEATURES = [
  { key: "offers", label: "Offers section", description: "Display seasonal and special offers on your public seller page." },
  { key: "polls", label: "Catalogue polls", description: "Ask customers which products, colours or collections they prefer." },
  { key: "subcategories", label: "Catalogue subcategories", description: "Organise products into smaller catalogue sections." },
  { key: "advanced_catalogue", label: "Advanced catalogue", description: "Request access to additional catalogue organisation tools." },
];
const stateLabel = (row) => row?.status==="approved"&&row.enabled?"Approved":row?.status==="pending"?"Pending review":row?.status==="suspended"?"Paused":row?.status==="rejected"?"Rejected":"Not enabled";
export default function SellerFeatureAccess({ seller }) {
  const [rows,setRows]=useState([]);
  const [offers,setOffers]=useState([]);
  const [polls,setPolls]=useState([]);
  const [subcategories,setSubcategories]=useState([]);
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [offer,setOffer]=useState({title:"",description:"",starts_at:"",ends_at:""});
  const [poll,setPoll]=useState({question:"",options:["",""],ends_at:""});
  const [subcategory,setSubcategory]=useState("");
  const load=async()=>{
    if(!supabase||!seller?.id)return;
    const [a,o,p,c]=await Promise.all([
      supabase.from("seller_feature_access").select("feature_key,status,enabled,requested_at,reviewed_at,review_note").eq("seller_id",seller.id),
      supabase.from("seller_offers").select("id,title,status,starts_at,ends_at,admin_note").eq("seller_id",seller.id).order("created_at",{ascending:false}),
      supabase.from("seller_polls").select("id,question,options,status,ends_at,admin_note").eq("seller_id",seller.id).order("created_at",{ascending:false}),
      supabase.from("seller_catalogue_subcategories").select("id,name,status").eq("seller_id",seller.id).order("sort_order")
    ]);
    for(const x of [a,o,p,c])if(x.error)throw x.error;
    setRows(a.data||[]);setOffers(o.data||[]);setPolls(p.data||[]);setSubcategories(c.data||[]);
  };
  useEffect(()=>{load().catch(e=>setError(e.message||"Could not load feature access."));},[seller?.id]);
  const requestAll=async()=>{
    const toRequest=FEATURES.filter(feature=>{
      const row=rows.find(item=>item.feature_key===feature.key);
      return row?.status!=="pending" && !(row?.status==="approved"&&row?.enabled);
    });
    if(!toRequest.length){setNotice("Your growth tools request is already with the admin or approved.");return;}
    setBusy("bundle");setError("");setNotice("");
    try{
      for(const feature of toRequest){
        const {error:rpcError}=await supabase.rpc("seller_request_feature",{p_feature_key:feature.key});
        if(rpcError)throw rpcError;
      }
      await load();
      setNotice("Your single Growth Tools request has been sent. NammaSpot admin will review the features for your business.");
    }catch(e){
      await load().catch(()=>{});
      setError(e.message||"Some feature requests could not be submitted. Refresh to check the current status.");
    }finally{setBusy("");}
  };
  const createOffer=async(e)=>{
    e.preventDefault();setBusy("offer");setError("");setNotice("");
    try{const {error:e1}=await supabase.from("seller_offers").insert({...offer,starts_at:new Date(offer.starts_at).toISOString(),ends_at:new Date(offer.ends_at).toISOString(),seller_id:seller.id,status:"pending"});if(e1)throw e1;setOffer({title:"",description:"",starts_at:"",ends_at:""});await load();setNotice("Offer submitted. It will appear publicly after admin approval.");}
    catch(e1){setError(e1.message||"Could not submit offer.");}finally{setBusy("");}
  };
  const createPoll=async(e)=>{
    e.preventDefault();setBusy("poll");setError("");setNotice("");
    try{const options=poll.options.map(x=>x.trim()).filter(Boolean);if(options.length<2)throw new Error("Add at least two poll options.");const {error:e1}=await supabase.from("seller_polls").insert({seller_id:seller.id,question:poll.question.trim(),options,ends_at:new Date(poll.ends_at).toISOString(),status:"pending",show_results:true});if(e1)throw e1;setPoll({question:"",options:["",""],ends_at:""});await load();setNotice("Poll submitted. It will appear publicly after admin approval.");}
    catch(e1){setError(e1.message||"Could not submit poll.");}finally{setBusy("");}
  };
  const createSubcategory=async(e)=>{
    e.preventDefault();setBusy("subcategory");setError("");setNotice("");
    try{const {error:e1}=await supabase.from("seller_catalogue_subcategories").insert({seller_id:seller.id,name:subcategory.trim(),status:"pending"});if(e1)throw e1;setSubcategory("");await load();setNotice("Subcategory submitted for admin approval.");}
    catch(e1){setError(e1.message||"Could not submit subcategory.");}finally{setBusy("");}
  };
  const approved=(key)=>rows.some(x=>x.feature_key===key&&x.status==="approved"&&x.enabled);
  return <section className="seller-feature-access">
    <div className="dashboard-section-head"><div><div className="eyebrow">GROW YOUR CATALOGUE</div><h2>Seller growth features</h2><p>Request the complete Growth Tools bundle once. Admin can approve the features for your business.</p></div><span className="status-pill">Admin controlled</span></div>
    {error&&<div className="inline-error" role="alert">{error}</div>}
    {notice&&<div className="form-status" role="status"><CheckCircle2 size={17}/>{notice}</div>}
    <div className="seller-growth-request-card">
      <div><strong>One request. All growth tools.</strong><p>Includes Offers, Catalogue Polls, Subcategories and Advanced Catalogue. You do not need to send separate requests.</p></div>
      <button className="primary-button" disabled={Boolean(busy)||seller?.verification_status!=="approved"||FEATURES.every(f=>{const r=rows.find(x=>x.feature_key===f.key);return r?.status==="pending"||(r?.status==="approved"&&r?.enabled);})} onClick={requestAll}>
        <Send size={16}/>{busy==="bundle"?"Sending request…":"Request all growth tools"}
      </button>
    </div>
    <div className="seller-feature-grid">{FEATURES.map(feature=>{
      const row=rows.find(item=>item.feature_key===feature.key);
      const enabled=row?.status==="approved"&&row?.enabled;
      const pending=row?.status==="pending";
      return <article className="seller-feature-card" key={feature.key}>
        <div className="seller-feature-card-head"><span>{feature.label}</span><span className={"status-pill "+(enabled?"status-ok":pending?"status-warning":"")}>{stateLabel(row)}</span></div>
        <p>{feature.description}</p>
        {enabled?<div className="seller-feature-enabled"><CheckCircle2 size={16}/>Enabled for your business</div>:pending?<div className="seller-feature-pending"><Clock3 size={16}/>Included · waiting for admin</div>:<div className="seller-feature-pending"><LockKeyhole size={16}/>Included in the combined request</div>}
        {row?.review_note&&<small className="muted-note">Admin note: {row.review_note}</small>}
      </article>;
    })}</div>
    {approved("offers")&&<section className="seller-feature-editor"><div className="dashboard-section-head"><div><h3><Tag size={17}/> Create an offer</h3><p>Submitted offers remain private until approved by admin.</p></div></div>
      <form onSubmit={createOffer} className="seller-feature-form"><label>Offer title<input value={offer.title} onChange={e=>setOffer({...offer,title:e.target.value})} maxLength={100} required/></label><label>Description<textarea value={offer.description} onChange={e=>setOffer({...offer,description:e.target.value})} maxLength={500}/></label><div className="form-grid"><label>Starts at<input type="datetime-local" value={offer.starts_at} onChange={e=>setOffer({...offer,starts_at:e.target.value})} required/></label><label>Ends at<input type="datetime-local" value={offer.ends_at} onChange={e=>setOffer({...offer,ends_at:e.target.value})} required/></label></div><button className="primary-button" disabled={busy==="offer"}>{busy==="offer"?"Submitting…":"Submit offer for approval"}</button></form>
      <div className="seller-feature-submissions">{offers.map(x=><div key={x.id}><strong>{x.title}</strong><span className="status-pill">{x.status}</span>{x.admin_note&&<small>{x.admin_note}</small>}</div>)}</div>
    </section>}
    {approved("polls")&&<section className="seller-feature-editor"><div className="dashboard-section-head"><div><h3><Vote size={17}/> Create a catalogue poll</h3><p>Ask one clear question and provide 2–6 choices. Admin approval is required before publishing.</p></div></div>
      <form onSubmit={createPoll} className="seller-feature-form"><label>Poll question<input value={poll.question} onChange={e=>setPoll({...poll,question:e.target.value})} maxLength={240} required/></label>{poll.options.map((value,i)=><label key={i}>Option {i+1}<input value={value} onChange={e=>setPoll({...poll,options:poll.options.map((x,j)=>j===i?e.target.value:x)})} maxLength={80}/></label>)}<div className="button-row"><button type="button" className="secondary-button" disabled={poll.options.length>=6} onClick={()=>setPoll({...poll,options:[...poll.options,""]})}>Add option</button><button type="button" className="secondary-button" disabled={poll.options.length<=2} onClick={()=>setPoll({...poll,options:poll.options.slice(0,-1)})}>Remove last</button></div><label>Poll closes at<input type="datetime-local" value={poll.ends_at} onChange={e=>setPoll({...poll,ends_at:e.target.value})} required/></label><button className="primary-button" disabled={busy==="poll"}>{busy==="poll"?"Submitting…":"Submit poll for approval"}</button></form>
      <div className="seller-feature-submissions">{polls.map(x=><div key={x.id}><strong>{x.question}</strong><span className="status-pill">{x.status}</span>{x.admin_note&&<small>{x.admin_note}</small>}</div>)}</div>
    </section>}
    {approved("subcategories")&&<section className="seller-feature-editor"><div className="dashboard-section-head"><div><h3><Layers3 size={17}/> Catalogue subcategories</h3><p>Request seller-specific sections such as Sarees, Kurtis or Handmade Snacks.</p></div></div>
      <form onSubmit={createSubcategory} className="seller-feature-form"><label>Subcategory name<input value={subcategory} onChange={e=>setSubcategory(e.target.value)} maxLength={60} required/></label><button className="primary-button" disabled={busy==="subcategory"}>{busy==="subcategory"?"Submitting…":"Submit subcategory for approval"}</button></form>
      <div className="seller-feature-submissions">{subcategories.map(x=><div key={x.id}><strong>{x.name}</strong><span className="status-pill">{x.status}</span></div>)}</div>
    </section>}
    <p className="muted-note"><LockKeyhole size={14}/> Database permissions prevent unapproved sellers from creating these items or showing them publicly.</p>
  </section>;
}
