import {useEffect,useMemo,useState} from "react";
import {ArrowLeft,MapPin,Phone,MessageCircle,Share2,Clock,CheckCircle,ExternalLink,X,ChevronLeft,ChevronRight,Send,Instagram,Heart} from "lucide-react";
import {createEnquiry} from "./lib/api";
import {getMicrosite,sellerPublicUrl} from "./lib/microsite";

const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const esc=(v)=>String(v||"").replace(/[<>]/g,"");

function nowStatus(hours,specialDates){
  const now=new Date(), date=now.toISOString().slice(0,10);
  const special=(specialDates||[]).find(x=>x.special_date===date);
  const day=special || (hours||[]).find(x=>Number(x.day_of_week)===now.getDay());
  if(!day) return null;
  if(day.is_open===false || day.is_closed===true) return {open:false};
  const mins=now.getHours()*60+now.getMinutes();
  const ranges=(day.ranges||[]).map(r=>[r.open,r.close]).filter(x=>x[0]&&x[1]);
  for(const [a,b] of ranges){
    const [ah,am]=a.split(":").map(Number),[bh,bm]=b.split(":").map(Number);
    if(mins>=ah*60+am&&mins<bh*60+bm)return {open:true,close:b};
  }
  const next=ranges.find(r=>{const [h,m]=r[0].split(":").map(Number);return mins<h*60+m;});
  return {open:false,next:next?.[0]};
}

function ProductModal({product,onClose,onEnquire}){
  const imgs=[product.image_url,...(product.images||[]).map(x=>x.image_url)].filter(Boolean);
  const [i,setI]=useState(0);
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <section className="modal microsite-product-modal">
      <button className="modal-close" onClick={onClose} aria-label="Close"><X/></button>
      <div className="microsite-gallery"><img src={imgs[i]||""} alt={product.name||product.product_name}/><button disabled={i===0} onClick={()=>setI(Math.max(0,i-1))} aria-label="Previous"><ChevronLeft/></button><button disabled={i===imgs.length-1} onClick={()=>setI(Math.min(imgs.length-1,i+1))} aria-label="Next"><ChevronRight/></button></div>
      <div className="microsite-thumbs">{imgs.map((u,n)=><button key={u+n} className={n===i?"active":""} onClick={()=>setI(n)}><img src={u} alt=""/></button>)}</div>
      <div className="microsite-product-copy"><div className="eyebrow">{product.category?.name||"CATALOGUE"}</div><h2>{esc(product.name||product.product_name)}</h2>{product.price!=null&&<strong className="microsite-price">₹{product.price}</strong>}<p>{esc(product.description)}</p><button className="primary-button full-button" onClick={onEnquire}><Send size={16}/> Ask about this product</button></div>
    </section>
  </div>;
}

function Enquiry({seller,product,onClose}){
  const [d,setD]=useState({name:"",contact:"",message:"Hi, I’m interested in "+(product?.name||product?.product_name||seller.business_name)+"."});
  const [s,setS]=useState({busy:false,error:"",ok:false});
  const submit=async e=>{e.preventDefault();setS({busy:true,error:"",ok:false});try{await createEnquiry({seller_id:seller.id,product_id:product?.id||null,customer_name:d.name.trim().slice(0,120),customer_contact:d.contact.trim().slice(0,160),message:d.message.trim().slice(0,1000)});setS({busy:false,error:"",ok:true})}catch(err){setS({busy:false,error:err.message||"Could not send enquiry. Please try again.",ok:false})}};
  return <div className="modal-backdrop"><section className="modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X/></button>{s.ok?<div className="success-panel"><CheckCircle size={38}/><h2>Message sent.</h2><p>Your enquiry is now with the seller. They can use the contact details you provided to respond.</p><button className="primary-button" onClick={onClose}>Done</button></div>:<><div className="eyebrow">MESSAGE THIS SELLER</div><h2>Send an enquiry</h2><p className="muted-note">Ask about availability, timing, price, custom orders or anything you need to know.</p><form className="seller-form" onSubmit={submit}><label>Name *<input required maxLength={120} value={d.name} onChange={e=>setD({...d,name:e.target.value})}/></label><label>Phone / email *<input required maxLength={160} value={d.contact} onChange={e=>setD({...d,contact:e.target.value})}/></label><label>Message *<textarea required maxLength={1000} value={d.message} onChange={e=>setD({...d,message:e.target.value})}/></label>{s.error&&<div className="inline-error">{s.error}</div>}<button className="primary-button full-button" disabled={s.busy}>{s.busy?"Sending…":"Send message"}</button></form></>}</section></div>;
}

export default function SellerMicrositePage({go,slug}){
  const [state,setState]=useState({loading:true,error:"",data:null});
  const [product,setProduct]=useState(null),[enquire,setEnquire]=useState(null),[saved,setSaved]=useState(false);
  useEffect(()=>{let alive=true;getMicrosite(slug).then(data=>alive&&setState({loading:false,error:"",data})).catch(e=>alive&&setState({loading:false,error:e.message||"Could not load this seller.",data:null}));return()=>{alive=false}},[slug]);
  const data=state.data,seller=data?.seller,settings=data?.settings||{};
  const status=useMemo(()=>data?nowStatus(data.hours,data.specialDates):null,[data]);
  useEffect(()=>{if(!seller)return;const url=sellerPublicUrl(seller.slug);document.title=(seller.business_name||"Local seller")+" · NammaSpot";const desc=(seller.description||settings.tagline||"Local seller on NammaSpot").slice(0,155);document.querySelector('meta[name="description"]')?.setAttribute("content",desc);let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement("link");c.rel="canonical";document.head.appendChild(c)}c.href=url},[seller,settings]);
  if(state.loading)return <main className="page"><div className="page-title"><div className="eyebrow">NAMMASPOT SELLER</div><h1>Loading seller…</h1></div></main>;
  if(state.error)return <main className="page"><div className="error-state"><h2>Could not load this seller</h2><p>{state.error}</p><button className="secondary-button" onClick={()=>go("/explore")}>Back to Explore</button></div></main>;
  if(!data)return <main className="page"><div className="empty-state"><h2>Seller not found</h2><p>This NammaSpot seller page is unavailable.</p></div></main>;
  const products=data.products||[];
  const share=async()=>{const url=sellerPublicUrl(seller.slug);try{if(navigator.share)await navigator.share({title:seller.business_name,text:"Discover this local seller on NammaSpot",url});else{await navigator.clipboard.writeText(url);alert("Seller link copied.");}}catch{}};
  const wa=seller.whatsapp_phone?"https://wa.me/"+seller.whatsapp_phone.replace(/\D/g,""):null;
  return <main className="seller-microsite ns-seller-profile">
    <div className="ns-profile-bar"><button className="back-button" onClick={()=>go("/explore")}><ArrowLeft size={17}/> Explore</button><span className="ns-profile-brand">NammaSpot</span><button className="icon-button" onClick={share} aria-label="Share seller"><Share2 size={19}/></button></div>
    <section className="ns-profile-header">
      <div className="ns-profile-avatar">{seller.profile_image_url?<img src={seller.profile_image_url} alt={seller.business_name+" logo"}/>:seller.business_name?.charAt(0)}</div>
      <div className="ns-profile-heading"><div className="eyebrow">{seller.category?.name||"LOCAL SELLER"} {seller.verified&&<span className="microsite-verified"><CheckCircle size={13}/> Verified</span>}</div><h1>{esc(seller.business_name)}</h1><p>{esc(seller.description||"Local seller on NammaSpot")}</p></div>
      <div className="ns-profile-actions">{seller.contact&&<a className="primary-button" href={"tel:"+seller.contact}><Phone size={16}/> Call</a>}{wa&&<a className="secondary-button" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a>}<button className="secondary-button" onClick={()=>setSaved(!saved)}><Heart size={16} fill={saved?"currentColor":"none"}/> {saved?"Saved":"Save"}</button></div>
    </section>

    {settings.tagline&&<section className="ns-customer-message"><div><div className="eyebrow">SELLER MESSAGE</div><strong>{esc(settings.tagline)}</strong><p>This message is set by the seller and can include today's date, opening time, closing time, order timing or any update for customers.</p></div><button className="primary-button" onClick={()=>setEnquire(null)}><Send size={16}/> Message seller</button></section>}

    <section className="ns-info-strip">
      {seller.location&&<div><MapPin size={18}/><span>{esc(seller.location)}</span>{seller.location_url&&<a href={seller.location_url} target="_blank" rel="noreferrer">Directions <ExternalLink size={13}/></a>}</div>}
      {data.hours.length>0&&<div><Clock size={18}/><span><b>{status?.open?"Open now":"Closed now"}</b>{status?.close&&" · Closes "+status.close}{status?.next&&!status?.open&&" · Opens "+status.next}</span></div>}
    </section>

    {data.hours.length>0&&<section className="ns-profile-section"><div className="section-heading"><div><div className="eyebrow">TIMINGS</div><h2>When you can find them.</h2></div></div><div className="ns-hours-grid">{days.map((d,i)=>{const h=data.hours.find(x=>Number(x.day_of_week)===i);return <div key={d}><b>{d}</b><span>{h?.is_open?(h.ranges||[]).map(r=>r.open+"–"+r.close).join(" · "):"Closed"}</span></div>})}</div>{data.specialDates?.length>0&&<div className="ns-special-dates"><strong>Special dates & updates</strong>{data.specialDates.map(x=><span key={x.id}>{x.special_date} · {x.label} · {x.is_closed?"Closed":(x.ranges||[]).map(r=>r.open+"–"+r.close).join(" · ")}</span>)}</div>}</section>}

    <section id="catalogue" className="ns-profile-section"><div className="section-heading"><div><div className="eyebrow">NAMMASPOT CATALOGUE</div><h2>Products & services.</h2><p>Browse what this local seller offers and ask them directly.</p></div></div>{products.length?<div className="microsite-product-grid">{products.map(p=><MiniProduct key={p.id} p={p} onOpen={()=>setProduct(p)}/>)}</div>:<div className="empty-state"><h2>Catalogue coming soon</h2><p>This seller has not added products yet.</p></div>}</section>

    <section className="ns-profile-section ns-contact-section"><div className="eyebrow">CONNECT WITH THE SELLER</div><h2>Need to ask something?</h2><p>Message the seller about products, availability, custom orders or timing.</p><div className="microsite-contact-actions">{seller.contact&&<a className="primary-button" href={"tel:"+seller.contact}><Phone size={16}/> Call</a>}{wa&&<a className="secondary-button" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a>}{seller.instagram_url&&<a className="secondary-button" href={seller.instagram_url} target="_blank" rel="noreferrer"><Instagram size={16}/> Instagram</a>}<button className="primary-button" onClick={()=>setEnquire("general")}><Send size={16}/> Send enquiry</button></div></section>
    <footer className="microsite-footer">NammaSpot · Local sellers, catalogues & connections</footer>
    {product&&<ProductModal product={product} onClose={()=>setProduct(null)} onEnquire={()=>{setProduct(null);setEnquire(product)}}/>}
    {enquire&&<Enquiry seller={seller} product={enquire==="general"?null:enquire} onClose={()=>setEnquire(null)}/>}
  </main>;
}

function MiniProduct({p,onOpen}){return <article className="microsite-product-card" tabIndex="0" onClick={onOpen} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onOpen()}}><div className="microsite-product-image">{p.image_url?<img src={p.image_url} alt={p.name||p.product_name} loading="lazy"/>:<span>{(p.name||p.product_name||"?").charAt(0)}</span>}</div><div><small>{p.category?.name||"Local"}</small><h3>{esc(p.name||p.product_name)}</h3>{p.description&&<p>{esc(p.description).slice(0,120)}</p>}{p.price!=null&&<strong>₹{p.price}</strong>}</div></article>}
