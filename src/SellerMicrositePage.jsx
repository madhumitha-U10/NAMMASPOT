import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,MapPin,Phone,MessageCircle,Share2,CheckCircle,ExternalLink,X,ChevronLeft,ChevronRight,Send,Heart,Home,Compass,Grid2X2,Bookmark,UserRound,Search,MoreHorizontal,Navigation,Star,Package,Camera,CalendarDays} from "lucide-react";
import {QRCodeCanvas} from "qrcode.react";
import {createEnquiry,createReview,getPublicReviews} from "./lib/api";
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

function ReviewPanel({seller}) {
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [form,setForm]=useState({name:"",contact:"",rating:5,comment:""});
  const [submitting,setSubmitting]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    setLoading(true);setLoadError("");
    getPublicReviews(seller.id).then(rows=>{if(alive)setReviews(rows)}).catch(err=>{if(alive)setLoadError(err.message||"Reviews are temporarily unavailable.")}).finally(()=>{if(alive)setLoading(false)});
    return()=>{alive=false};
  },[seller.id]);
  const average=reviews.length?(reviews.reduce((sum,item)=>sum+Number(item.rating||0),0)/reviews.length).toFixed(1):null;
  const submit=async event=>{
    event.preventDefault();setSubmitting(true);setError("");setNotice("");
    try{
      await createReview({seller_id:seller.id,reviewer_name:form.name,reviewer_contact:form.contact,rating:form.rating,comment:form.comment});
      setForm({name:"",contact:"",rating:5,comment:""});
      setNotice("Thanks for sharing your experience. Your review is pending moderation and will appear after approval.");
    }catch(err){setError(err.message||"Could not submit your review. Please try again.")}
    finally{setSubmitting(false)}
  };
  return <div className="ns-review-panel">
    <div className="ns-review-summary">
      <div><div className="eyebrow">CUSTOMER FEEDBACK</div><h2>Reviews</h2><p>Help others discover local businesses with useful, respectful feedback.</p></div>
      <div className="ns-review-average"><strong>{average||"—"}</strong><span aria-label={average?average+" out of 5 stars":"No ratings yet"}>{average?"★".repeat(Math.round(Number(average)))+"☆".repeat(5-Math.round(Number(average))):"☆☆☆☆☆"}</span><small>{reviews.length} approved {reviews.length===1?"review":"reviews"}</small></div>
    </div>
    {loading?<p className="muted-note">Loading reviews…</p>:loadError?<div className="inline-error" role="alert">{loadError}</div>:reviews.length?<div className="ns-review-list">{reviews.map(review=><article className="ns-review-card" key={review.id}><div className="ns-review-card-head"><strong>{esc(review.reviewer_name)}</strong><span className="ns-review-stars" aria-label={review.rating+" out of 5 stars"}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div><p>{esc(review.comment)}</p><small>{new Date(review.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</small></article>)}</div>:<div className="ns-review-empty"><strong>Be the first to leave a review</strong><p>There are no approved reviews yet. Your feedback can help the next customer.</p></div>}
    <div className="ns-review-form-wrap"><h3>Share your experience</h3><p className="muted-note">Reviews are checked before publishing. Your phone/email is kept private and is only used to help prevent duplicate reviews.</p>
      <form className="seller-form ns-review-form" onSubmit={submit}>
        <label>Your name *<input required minLength={2} maxLength={80} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Display name"/></label>
        <label>Phone or email *<input required maxLength={160} value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Kept private" autoComplete="email"/></label>
        <label>Rating *<select required value={form.rating} onChange={e=>setForm({...form,rating:Number(e.target.value)})}><option value={5}>★★★★★ — Excellent</option><option value={4}>★★★★☆ — Good</option><option value={3}>★★★☆☆ — Okay</option><option value={2}>★★☆☆☆ — Needs improvement</option><option value={1}>★☆☆☆☆ — Poor</option></select></label>
        <label>Your review *<textarea required minLength={5} maxLength={1000} rows={4} value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} placeholder="What should other customers know?"/></label>
        {error&&<div className="inline-error" role="alert">{error}</div>}
        {notice&&<div className="inline-success" role="status">{notice}</div>}
        <button className="primary-button" disabled={submitting}>{submitting?"Submitting…":"Submit review"}</button>
      </form>
    </div>
  </div>;
}

export default function SellerMicrositePage({go,slug}){
  const [state,setState]=useState({loading:true,error:"",data:null});
  const [language,setLanguage]=useState(()=>localStorage.getItem("nammaspot-language")==="ta"?"ta":"en");
  const isTamil=language==="ta";
  const [product,setProduct]=useState(null),[enquire,setEnquire]=useState(null),[saved,setSaved]=useState(false);
  const [shareOpen,setShareOpen]=useState(false);
  useEffect(()=>{localStorage.setItem("nammaspot-language",language);document.documentElement.lang=language},[language]);
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
    const jsonId="nammaspot-seller-jsonld";
    document.getElementById(jsonId)?.remove();
    const schema={
      "@context":"https://schema.org",
      "@type":"LocalBusiness",
      "@id":url+"#business",
      name:seller.business_name||"Local seller",
      description:desc,
      url,
      image,
      telephone:seller.contact||seller.phone||undefined,
      address:{"@type":"PostalAddress",addressLocality:seller.city||seller.location||"Tamil Nadu",addressRegion:"Tamil Nadu",addressCountry:"IN"},
      sameAs:seller.instagram_url?[seller.instagram_url]:undefined,
      hasOfferCatalog:{"@type":"OfferCatalog",name:"Catalogue",itemListElement:(data.products||[]).slice(0,50).map(p=>({"@type":"Offer","itemOffered":{"@type":"Product",name:p.name||p.product_name||"Local product",image:p.image_url||undefined}}))}
    };
    const jsonScript=document.createElement("script");
    jsonScript.id=jsonId;
    jsonScript.type="application/ld+json";
    jsonScript.textContent=JSON.stringify(schema).replace(/</g,"\\u003c");
    document.head.appendChild(jsonScript);
    return ()=>jsonScript.remove();
  },[seller,settings,data]);
  if(state.loading)return <main className="page"><div className="page-title"><div className="eyebrow">NAMMASPOT SELLER</div><h1>Loading seller…</h1></div></main>;
  if(state.error)return <main className="page"><div className="error-state"><h2>Could not load this seller</h2><p>{state.error}</p><button className="secondary-button" onClick={()=>go("/explore")}>Back to Explore</button></div></main>;
  if(!data)return <main className="page"><div className="empty-state"><h2>Seller not found</h2><p>This NammaSpot seller page is unavailable.</p></div></main>;
  const products=data.products||[];
  const share=()=>setShareOpen(true);
  const wa=seller.whatsapp_phone?"https://wa.me/"+seller.whatsapp_phone.replace(/\D/g,""):null;
  return <main className="seller-microsite ns-seller-profile ns-reference-layout">
    <aside className="ns-left-sidebar">
      <button className="ns-side-brand" onClick={()=>go("/")}>NammaSpot</button>
      <div className="ns-side-tagline">Local Sellers <span>•</span> Real People <span>•</span> Genuine Products</div>
      <nav className="ns-side-nav" aria-label="NammaSpot navigation">
        <button className="active" onClick={()=>go("/")}><Home size={18}/> {isTamil?"முகப்பு":"Home"}</button>
        <button onClick={()=>go("/explore")}><Compass size={18}/> {isTamil?"தேடுக":"Explore"}</button>
        <button onClick={()=>go("/categories")}><Grid2X2 size={18}/> {isTamil?"வகைகள்":"Categories"}</button>
        <button onClick={()=>go("/explore?near=1")}><Navigation size={18}/> {isTamil?"அருகில்":"Nearby"}</button>
        <button onClick={()=>go("/saved")}><Bookmark size={18}/> {isTamil?"சேமித்தவை":"Saved"}</button>
      </nav>
      <div className="ns-side-divider"/>
      <button className="ns-side-account" onClick={()=>go("/login")}><UserRound size={18}/> {isTamil?"என் கணக்கு":"My Account"}</button>
      <button className="ns-language-toggle" type="button" onClick={()=>setLanguage(isTamil?"en":"ta")}>{isTamil?"English":"தமிழ்"}</button>
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
          {seller.category?.name && <div className="eyebrow">{esc(seller.category.name)}</div>}
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
        <ReviewPanel seller={seller}/>
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

    {shareOpen&&<SellerShareModal seller={seller} url={sellerPublicUrl(seller.slug)} onClose={()=>setShareOpen(false)}/>}
    {product&&<ProductModal product={product} onClose={()=>setProduct(null)} onEnquire={()=>{setProduct(null);setEnquire(product)}}/>}
    {enquire&&<Enquiry seller={seller} product={enquire==="general"?null:enquire} onClose={()=>setEnquire(null)}/>}
  </main>;
}


function SellerShareModal({seller,url,onClose}){
  const qrCanvasRef=useRef(null);
  const [imageUrl,setImageUrl]=useState("");
  const [state,setState]=useState({loading:true,error:"",notice:""});
  const shopName=String(seller.business_name||"Local seller").trim().slice(0,180);
  useEffect(()=>{
    let cancelled=false;
    setState({loading:true,error:"",notice:""});
    setImageUrl("");
    const build=()=>{
      try{
        const qr=qrCanvasRef.current;
        if(!qr)throw new Error("The QR code is not ready yet. Please try again.");
        const output=document.createElement("canvas");
        output.width=1080;output.height=1350;
        const ctx=output.getContext("2d");
        if(!ctx)throw new Error("Your browser cannot create the share image.");
        const roundRect=(x,y,w,h,r,fill,stroke,lineWidth=2)=>{
          ctx.beginPath();ctx.roundRect(x,y,w,h,r);
          if(fill){ctx.fillStyle=fill;ctx.fill()}
          if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke()}
        };
        const centered=(text,y,font,color)=>{
          ctx.font=font;ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,540,y);
        };
        const wrapText=(text,maxWidth,font,maxLines=2)=>{
          ctx.font=font;
          const words=String(text||"").trim().split(/\s+/).filter(Boolean);
          const lines=[];let line="";
          for(const word of words){
            const candidate=line?line+" "+word:word;
            if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=word}else line=candidate;
          }
          if(line)lines.push(line);
          if(lines.length>maxLines){
            const trimmed=lines.slice(0,maxLines);
            let last=trimmed[maxLines-1];
            while(last&&ctx.measureText(last+"…").width>maxWidth)last=last.slice(0,-1);
            trimmed[maxLines-1]=last.trimEnd()+"…";
            return trimmed;
          }
          return lines;
        };
        const fitNameFont=(text,maxWidth)=>{
          let size=58;
          while(size>36){ctx.font="800 "+size+"px Arial, sans-serif";if(ctx.measureText(text).width<=maxWidth)break;size-=2}
          return "800 "+size+"px Arial, sans-serif";
        };
        // Warm paper base and restrained burgundy editorial accents.
        ctx.fillStyle="#FBF6EE";ctx.fillRect(0,0,1080,1350);
        ctx.fillStyle="#F0E3D6";ctx.beginPath();ctx.arc(1010,95,170,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#E9D7CA";ctx.beginPath();ctx.arc(65,1280,120,0,Math.PI*2);ctx.fill();
        roundRect(28,28,1024,1294,34,"#FFFCF7","#E5D4C8",3);
        // Brand masthead.
        roundRect(68,66,944,136,25,"#762C3A",null);
        ctx.textAlign="left";ctx.textBaseline="middle";
        ctx.fillStyle="#FFFFFF";ctx.font="800 54px Arial, sans-serif";ctx.fillText("NammaSpot",104,118);
        ctx.fillStyle="#F7E7DB";ctx.font="500 22px Arial, sans-serif";ctx.fillText("DISCOVER SOMETHING YOU'LL LOVE.",106,160);
        // Small editorial kicker.
        centered("A SHOP WORTH DISCOVERING",250,"700 22px Arial, sans-serif","#8A4A51");
        // Shop name, sized and wrapped for long real-world names.
        const nameLines=wrapText(shopName,850,"800 58px Arial, sans-serif",3);
        let nameY=nameLines.length===1?316:nameLines.length===2?300:282;
        nameLines.forEach((line)=>{
          centered(line,nameY,fitNameFont(line,850),"#302622");
          nameY+=62;
        });
        const category=String(seller.category?.name||"CATALOGUE").trim().toUpperCase().slice(0,60);
        const location=String(seller.location||seller.city||"").trim().replace(/\s+/g," ").slice(0,70);
        const meta=location?category+"  ·  "+location:category;
        centered(meta,Math.max(390,nameY+12),"600 21px Arial, sans-serif","#76675E");
        // QR panel is deliberately plain, with a clear quiet zone and no overlay.
        const qrSize=390,qrX=(1080-qrSize)/2,qrY=Math.max(445,nameY+52);
        roundRect(qrX-28,qrY-28,qrSize+56,qrSize+56,28,"#FFFFFF","#E9DDD2",3);
        const qrImage=new window.Image();
        qrImage.onload=()=>{
          if(cancelled)return;
          ctx.fillStyle="#FFFFFF";ctx.fillRect(qrX,qrY,qrSize,qrSize);
          ctx.drawImage(qrImage,qrX,qrY,qrSize,qrSize);
          // Clear action block with a strong, single next step.
          const actionY=qrY+qrSize+70;
          centered("SCAN TO EXPLORE",actionY,"800 34px Arial, sans-serif","#762C3A");
          centered("Browse the catalogue. Find your next favourite.",actionY+43,"500 23px Arial, sans-serif","#65564E");
          roundRect(148,actionY+83,784,72,18,"#F3E6DD",null);
          centered("Discover this shop on NammaSpot",actionY+119,"700 25px Arial, sans-serif","#762C3A");
          ctx.fillStyle="#DCC9BC";ctx.fillRect(150,1230,780,2);
          centered(new URL(url).hostname,1267,"700 22px Arial, sans-serif","#762C3A");
          centered("GOOD FINDS START HERE",1297,"500 15px Arial, sans-serif","#8A7A70");
          try{const result=output.toDataURL("image/png");if(!cancelled){setImageUrl(result);setState({loading:false,error:"",notice:""})}}
          catch{if(!cancelled)setState({loading:false,error:"Could not export the QR image in this browser.",notice:""})}
        };
        qrImage.onerror=()=>{if(!cancelled)setState({loading:false,error:"Could not prepare the QR image. Please try again.",notice:""})};
        qrImage.src=qr.toDataURL("image/png");
      }catch(error){if(!cancelled)setState({loading:false,error:error.message||"Could not create the share image.",notice:""})}
    };
    const timer=window.setTimeout(build,0);
    return()=>{cancelled=true;window.clearTimeout(timer)};
  },[url,shopName]);
  const dialogRef=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const dialog=dialogRef.current;
    const focusable=()=>Array.from(dialog?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')||[]).filter(el=>el.offsetParent!==null);
    focusable()[0]?.focus();
    const onKey=e=>{
      if(e.key==="Escape"){onClose();return}
      if(e.key==="Tab"){
        const items=focusable();if(!items.length){e.preventDefault();dialog?.focus();return}
        const first=items[0],last=items[items.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>{window.removeEventListener("keydown",onKey);previous?.focus?.()};
  },[onClose]);
  const blobFromData=()=>{if(!imageUrl)throw new Error("The share image is still being prepared.");const parts=imageUrl.split(",");const bytes=window.atob(parts[1]);const array=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)array[i]=bytes.charCodeAt(i);return new window.Blob([array],{type:"image/png"})};
  const download=()=>{
    try{const blob=blobFromData(),blobUrl=URL.createObjectURL(blob),a=document.createElement("a");a.href=blobUrl;a.download="nammaspot-"+(seller.slug||"shop")+"-qr.png";document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(blobUrl),1500);setState(s=>({...s,error:"",notice:"Download started. Check your Downloads folder."}))}
    catch(error){setState(s=>({...s,error:error.message||"Could not download the image.",notice:""}))}
  };
  const shareImage=async()=>{
    try{
      const blob=blobFromData(),file=new window.File([blob],"nammaspot-"+(seller.slug||"shop")+"-qr.png",{type:"image/png"});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:shopName+" · NammaSpot",text:"Discover this shop on NammaSpot"});
        setState(s=>({...s,error:"",notice:"QR image shared successfully."}));
      }else{
        download();
        setState(s=>({...s,error:"",notice:"Image sharing is not supported here, so the branded QR image was downloaded instead."}));
      }
    }catch(error){
      if(error?.name==="AbortError"){setState(s=>({...s,error:"",notice:"Sharing cancelled."}));return}
      setState(s=>({...s,error:error.message||"Sharing failed. Try downloading the image instead.",notice:""}));
    }
  };
  const copyLink=async()=>{
    try{
      if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url)}
      else{
        const input=document.createElement("textarea");input.value=url;input.setAttribute("readonly","");input.style.position="fixed";input.style.opacity="0";document.body.appendChild(input);input.select();
        const ok=document.execCommand("copy");input.remove();if(!ok)throw new Error("Clipboard access is unavailable. Copy the shop link manually.");
      }
      setState(s=>({...s,error:"",notice:"Shop link copied."}));
    }catch(error){setState(s=>({...s,error:error.message||"Could not copy the link.",notice:""}))}
  };
  const printQr=()=>{
    try{
      if(!imageUrl)throw new Error("The share image is still being prepared.");
      const win=window.open("","_blank");
      if(!win)throw new Error("Your browser blocked the print window. Allow pop-ups and try again.");
      const safeName=shopName.replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
      win.document.write("<!doctype html><html><head><title>"+safeName+" · NammaSpot QR</title><meta name='viewport' content='width=device-width, initial-scale=1'><style>body{font-family:Arial,sans-serif;text-align:center;margin:24px;color:#302622}img{width:min(100%,600px);height:auto} @media print{body{margin:0}img{width:100%;max-width:180mm}}</style></head><body><img alt='NammaSpot QR code for "+safeName+"' src='"+imageUrl+"'><script>window.addEventListener(\"load\",()=>window.print(),{once:true})<\/script></body></html>");
      win.document.close();
      setState(s=>({...s,error:"",notice:"Print window opened."}));
    }catch(error){setState(s=>({...s,error:error.message||"Could not open print view.",notice:""}))}
  };
  return <div className="modal-backdrop ns-share-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <section ref={dialogRef} tabIndex={-1} className="modal ns-share-modal" role="dialog" aria-modal="true" aria-labelledby="ns-share-title" aria-describedby="ns-share-description">
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close QR sharing"><X size={19}/></button>
      <div className="eyebrow">SHARE YOUR SPOT</div>
      <h2 id="ns-share-title">Share your shop</h2>
      <p id="ns-share-description" className="muted-note">A branded QR image that opens this seller’s real NammaSpot catalogue.</p>
      <div className="ns-share-preview" aria-live="polite">
        {state.loading&&<div className="ns-share-loading"><span className="ns-share-spinner" aria-hidden="true"/>Creating your QR image…</div>}
        {state.error&&<div className="inline-error" role="alert">{state.error}</div>}
        {imageUrl&&<img src={imageUrl} alt={"NammaSpot branded QR code for "+shopName} />}
      </div>
      <div className="ns-share-url"><span>Shop link</span><code>{url}</code></div>
      <div className="ns-share-actions">
        <button type="button" className="primary-button" onClick={shareImage} disabled={!imageUrl||state.loading}><Share2 size={16}/> Share QR image</button>
        <button type="button" className="secondary-button" onClick={download} disabled={!imageUrl||state.loading}><ExternalLink size={16}/> Download image</button>
        <button type="button" className="secondary-button" onClick={copyLink}><CheckCircle size={16}/> Copy shop link</button>
        <button type="button" className="secondary-button" onClick={printQr} disabled={!imageUrl||state.loading}><ExternalLink size={16}/> Print QR</button>
      </div>
      {state.notice&&<p className="ns-share-notice" role="status" aria-live="polite">{state.notice}</p>}
      <div className="ns-share-qr-source" aria-hidden="true"><QRCodeCanvas ref={qrCanvasRef} value={url} size={360} level="H" includeMargin bgColor="#ffffff" fgColor="#111111"/></div>
    </section>
  </div>;
}

function MiniProduct({p,onOpen}){return <article className="microsite-product-card" tabIndex="0" onClick={onOpen} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onOpen()}}><div className="microsite-product-image">{p.image_url?<img src={p.image_url} alt={p.name||p.product_name} loading="lazy"/>:<span>{(p.name||p.product_name||"?").charAt(0)}</span>}</div><div><small>{p.category?.name||"Local"}</small><h3>{esc(p.name||p.product_name)}</h3>{p.description&&<p>{esc(p.description).slice(0,120)}</p>}{p.price!=null&&<strong>₹{p.price}</strong>}</div></article>}
