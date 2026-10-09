import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,MapPin,Phone,MessageCircle,Share2,Clock,CheckCircle,ExternalLink,X,ChevronLeft,ChevronRight,Send,Heart,Home,Compass,Grid2X2,Bookmark,UserRound,Search,MoreHorizontal,Navigation,Star,Package,Camera,CalendarDays} from "lucide-react";
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
  const touchStart=useRef(null);
  const previous=()=>setI(v=>Math.max(0,v-1));
  const next=()=>setI(v=>Math.min(imgs.length-1,v+1));
  const onTouchStart=e=>{touchStart.current=e.changedTouches?.[0]?.clientX ?? null};
  const onTouchEnd=e=>{if(touchStart.current==null)return;const end=e.changedTouches?.[0]?.clientX ?? touchStart.current;const delta=end-touchStart.current;touchStart.current=null;if(Math.abs(delta)<45)return;if(delta<0)next();else previous()};
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <section className="modal microsite-product-modal" aria-label="Product image viewer">
      <button className="modal-close" onClick={onClose} aria-label="Close"><X/></button>
      <div className="microsite-gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button className="gallery-nav" disabled={i===0} onClick={previous} aria-label="Previous image"><ChevronLeft/></button>
        <div className="microsite-gallery-stage">
          {imgs[i] ? <img src={imgs[i]} alt={product.name||product.product_name} /> : <span>No product image</span>}
        </div>
        <button className="gallery-nav" disabled={i===imgs.length-1} onClick={next} aria-label="Next image"><ChevronRight/></button>
      </div>
      {imgs.length>1&&<div className="microsite-gallery-count" aria-live="polite">{i+1} / {imgs.length}</div>}
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
  useEffect(()=>{
    if(!seller)return;
    const url=sellerPublicUrl(seller.slug);
    const title=(seller.business_name||"Local seller")+" · Catalogue · NammaSpot";
    const desc=(seller.description||settings.tagline||"Discover this local seller and their catalogue on NammaSpot.").replace(/\s+/g," ").slice(0,155);
    const image=seller.cover_image_url||seller.profile_image_url||location.origin+"/og-image.svg";
    document.title=title;
    const setMeta=(selector,attribute,value)=>{let el=document.querySelector(selector);if(!el){el=document.createElement("meta");const [kind,key]=selector.match(/\[(name|property)="([^"]+)"\]/).slice(1);el.setAttribute(kind,key);document.head.appendChild(el)}el.setAttribute("content",value)};
    setMeta('meta[name="description"]',"name",desc);
    setMeta('meta[name="robots"]',"name","index,follow,max-image-preview:large");
    setMeta('meta[property="og:title"]',"property",title);
    setMeta('meta[property="og:description"]',"property",desc);
    setMeta('meta[property="og:url"]',"property",url);
    setMeta('meta[property="og:image"]',"property",image);
    setMeta('meta[property="og:type"]',"property","profile");
    setMeta('meta[name="twitter:card"]',"name","summary_large_image");
    setMeta('meta[name="twitter:title"]',"name",title);
    setMeta('meta[name="twitter:description"]',"name",desc);
    setMeta('meta[name="twitter:image"]',"name",image);
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical)}
    canonical.href=url;
  },[seller,settings]);
  if(state.loading)return <main className="page"><div className="page-title"><div className="eyebrow">NAMMASPOT SELLER</div><h1>Loading seller…</h1></div></main>;
  if(state.error)return <main className="page"><div className="error-state"><h2>Could not load this seller</h2><p>{state.error}</p><button className="secondary-button" onClick={()=>go("/explore")}>Back to Explore</button></div></main>;
  if(!data)return <main className="page"><div className="empty-state"><h2>Seller not found</h2><p>This NammaSpot seller page is unavailable.</p></div></main>;
  const products=data.products||[];
  const share=async()=>{const url=sellerPublicUrl(seller.slug);try{if(navigator.share)await navigator.share({title:seller.business_name,text:"Discover this local seller on NammaSpot",url});else{await navigator.clipboard.writeText(url);alert("Seller link copied.");}}catch{}};
  const wa=seller.whatsapp_phone?"https://wa.me/"+seller.whatsapp_phone.replace(/\D/g,""):null;
  return <main className="seller-microsite ns-seller-profile ns-reference-layout">
    <aside className="ns-left-sidebar">
      <button className="ns-side-brand" onClick={()=>go("/")}>NammaSpot</button>
      <div className="ns-side-tagline">Local Sellers <span>•</span> Real People <span>•</span> Genuine Products</div>
      <nav className="ns-side-nav" aria-label="NammaSpot navigation">
        <button className="active" onClick={()=>go("/")}><Home size={18}/> Home</button>
        <button onClick={()=>go("/explore")}><Compass size={18}/> Explore</button>
        <button onClick={()=>go("/categories")}><Grid2X2 size={18}/> Categories</button>
        <button onClick={()=>go("/nearby")}><Navigation size={18}/> Nearby</button>
        <button onClick={()=>go("/saved")}><Bookmark size={18}/> Saved</button>
      </nav>
      <div className="ns-side-divider"/>
      <button className="ns-side-account" onClick={()=>go("/account")}><UserRound size={18}/> My Account</button>
      <div className="ns-side-local-note">Support Local<br/>Discover Local ♡</div>
    </aside>

    <section className="ns-center-column">
      <header className="ns-reference-topbar">
        <button className="ns-mobile-back" onClick={()=>go("/explore")} aria-label="Back"><ArrowLeft size={18}/></button>
        <div className="ns-reference-search"><Search size={17}/><input aria-label="Search NammaSpot" placeholder="Search for sellers, products, categories..." onFocus={()=>go("/explore")}/></div>
        <div className="ns-reference-top-actions">
          <span className="ns-location"><MapPin size={16}/> Chennai <span>⌄</span></span>
          <button className="icon-button" onClick={()=>setSaved(!saved)} aria-label="Save seller"><Heart size={20} fill={saved?"currentColor":"none"}/></button>
          <button className="icon-button" onClick={share} aria-label="Share seller"><Share2 size={19}/></button>
          <button className="ns-account-dot" aria-label="Account"><UserRound size={18}/></button>
        </div>
      </header>

      <div className="ns-seller-cover">
        {seller.cover_image_url&&<img src={seller.cover_image_url} alt="" />}
      </div>

      <section className="ns-reference-seller-head">
        <div className="ns-reference-avatar">{seller.profile_image_url?<img src={seller.profile_image_url} alt={seller.business_name+" logo"}/>:seller.business_name?.charAt(0)}</div>
        <div className="ns-reference-seller-copy">
          <div className="eyebrow">{seller.category?.name||"LOCAL SELLER"}</div>
          <h1>{esc(seller.business_name)} {seller.verified&&<CheckCircle className="ns-inline-verified" size={17}/>}</h1>
          <div className="ns-handle">{seller.slug?("@"+seller.slug):"@local-seller"} <span className="ns-verified-pill">{seller.verified?"✓ Verified Seller":"NammaSpot Seller"}</span></div>
          <div className="ns-reference-location"><MapPin size={15}/>{esc(seller.location||"Chennai, Tamil Nadu")}</div>
          <p>{esc(seller.description||"Local seller on NammaSpot")}</p>
          <div className="ns-reference-stats">
            <span><b>{products.length}</b> Products</span>
            <span><b>Local</b> Seller</span>
            <span><b>{seller.category?.name||"Local"}</b> Category</span>
          </div>
        </div>
        <div className="ns-reference-actions">
          {settings.tagline && <div className="ns-daily-update" title="Seller daily update">
            <CalendarDays size={14}/>
            <div><small>{new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short"}).format(new Date())}</small><span>{esc(settings.tagline)}</span></div>
          </div>}
          {wa&&<a className="primary-button" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a>}
          {seller.contact&&<a className="secondary-button" href={"tel:"+seller.contact}><Phone size={16}/> Call</a>}
          <button className="secondary-button" onClick={share}><Share2 size={16}/> Share</button>
          <button className="icon-button ns-more-button" aria-label="More"><MoreHorizontal size={20}/></button>
        </div>
      </section>

      <div className="ns-reference-tabs">
        <a className="active" href="#catalogue">Catalogue</a>
        <a href="#about">About</a>
        <a href="#reviews">Reviews</a>
      </div>

      <section id="catalogue" className="ns-profile-section ns-reference-catalogue">
        <div className="ns-reference-section-head">
          <div><h2>Our Catalogue</h2><p>Browse products and services from this local seller.</p></div>
          <div className="ns-catalogue-search"><Search size={15}/><input placeholder="Search products..." aria-label="Search products"/></div>
        </div>
        {products.length?<div className="microsite-product-grid ns-reference-product-grid">{products.map(p=><MiniProduct key={p.id} p={p} onOpen={()=>setProduct(p)}/>)}</div>:<div className="empty-state"><h2>Catalogue coming soon</h2><p>This seller has not added products yet.</p></div>}
      </section>

      <section id="about" className="ns-profile-section ns-reference-about">
        <div className="eyebrow">ABOUT THIS SELLER</div>
        <h2>About</h2>
        <p>{esc(seller.description||"This local seller is part of the NammaSpot community.")}</p>
      </section>

      <section id="reviews" className="ns-profile-section ns-reference-reviews">
        <div className="eyebrow">CUSTOMER TRUST</div>
        <h2>Reviews</h2>
        <p>Customer reviews will appear here as NammaSpot gathers verified local feedback.</p>
      </section>

      <footer className="microsite-footer">NammaSpot · Local sellers, catalogues & connections</footer>
    </section>

    <aside className="ns-right-sidebar">
      <section className="ns-right-card ns-contact-card">
        <h3>Contact Seller</h3>
        <p>Have a question? Reach out directly to the seller.</p>
        {wa&&<a className="primary-button full-button" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a>}
        {seller.contact&&<a className="secondary-button full-button" href={"tel:"+seller.contact}><Phone size={16}/> Call</a>}
        <button className="secondary-button full-button" onClick={share}><Share2 size={16}/> Share</button>
      </section>

      <section className="ns-right-card" id="business-information">
        <h3>Business Information</h3>
        <div className="ns-right-label">About</div>
        <p>{esc(seller.description||"Local seller on NammaSpot")}</p>
        {seller.contact&&<a className="ns-right-contact" href={"tel:"+seller.contact}><Phone size={15}/>{seller.contact}</a>}
        {seller.whatsapp_phone&&<a className="ns-right-contact" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={15}/>{seller.whatsapp_phone}</a>}
        {seller.instagram_url&&<a className="ns-right-contact" href={seller.instagram_url} target="_blank" rel="noreferrer"><Camera size={15}/>Instagram</a>}
        <div className="ns-right-divider"/>
        <div className="ns-right-label">Opening Hours</div>
        {data.hours.length>0&&<div className="ns-right-hours">{data.hours.filter(x=>x.is_open).slice(0,1).map(h=><span key={h.day_of_week}>{days[h.day_of_week].slice(0,3)} - Sat <b>{(h.ranges||[]).map(r=>r.open+" - "+r.close).join(" · ")}</b></span>)}<span className={status?.open?"ns-open":"ns-closed"}>{status?.open?"Open now":"Closed now"}</span></div>}
        <div className="ns-right-divider"/>
        <div className="ns-right-label">Location</div>
        <p>{esc(seller.location||"Chennai, Tamil Nadu")}</p>
        {seller.location_url&&<a className="secondary-button ns-map-button" href={seller.location_url} target="_blank" rel="noreferrer"><Navigation size={14}/> View on Map</a>}
        <div className="ns-map-placeholder"><MapPin size={24}/><span>{esc(seller.location||"Chennai")}</span></div>
      </section>

      <section className="ns-right-card ns-similar-card">
        <div className="ns-similar-head"><h3>Similar Sellers</h3><button onClick={()=>go("/explore")}>See all →</button></div>
        <div className="ns-similar-items">
          <div><span><Package size={17}/></span><small>Local Seller</small><button>Follow</button></div>
          <div><span><Star size={17}/></span><small>{seller.category?.name||"Local"}</small><button>Follow</button></div>
          <div><span><Heart size={17}/></span><small>Nearby Seller</small><button>Follow</button></div>
        </div>
      </section>
    </aside>

    {product&&<ProductModal product={product} onClose={()=>setProduct(null)} onEnquire={()=>{setProduct(null);setEnquire(product)}}/>}
    {enquire&&<Enquiry seller={seller} product={enquire==="general"?null:enquire} onClose={()=>setEnquire(null)}/>}
  </main>;
}

function MiniProduct({p,onOpen}){return <article className="microsite-product-card" tabIndex="0" onClick={onOpen} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onOpen()}}><div className="microsite-product-image">{p.image_url?<img src={p.image_url} alt={p.name||p.product_name} loading="lazy"/>:<span>{(p.name||p.product_name||"?").charAt(0)}</span>}</div><div><small>{p.category?.name||"Local"}</small><h3>{esc(p.name||p.product_name)}</h3>{p.description&&<p>{esc(p.description).slice(0,120)}</p>}{p.price!=null&&<strong>₹{p.price}</strong>}</div></article>}
