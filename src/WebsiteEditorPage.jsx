import {useEffect,useState} from "react";
import {ArrowLeft,CheckCircle,Plus,Trash2,ExternalLink,Clock} from "lucide-react";
import {getMySeller,updateMySeller,listMyProducts} from "./lib/api";
import {getMyMicrosite,saveMicrosite,saveHours,saveSpecialDates,setProductFeatured,sellerPublicUrl} from "./lib/microsite";

const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const emptyHours=DAYS.map((_,i)=>({day_of_week:i,is_open:false,ranges:[]}));
const validateMap=(v)=>{const s=String(v||"").trim();if(!s)return "";let u;try{u=new URL(s)}catch{throw new Error("Location URL is not valid.")}if(!["http:","https:"].includes(u.protocol))throw new Error("Location URL must use http or https.");return s};

export default function WebsiteEditorPage({go}){
  const [seller,setSeller]=useState(null),[products,setProducts]=useState([]),[data,setData]=useState({tagline:"",about:"",experience:"",services:"",business_type:"",area_served:"",theme:"classic",business_highlights:[],social_facebook_url:"",social_youtube_url:""}),[hours,setHours]=useState(emptyHours),[specials,setSpecials]=useState([]),[tab,setTab]=useState("profile"),[state,setState]=useState({loading:true,busy:false,error:"",ok:""});
  const load=async()=>{setState(s=>({...s,loading:true,error:""}));try{const s=await getMySeller();if(!s)throw new Error("Seller profile not found.");const [m,p]=await Promise.all([getMyMicrosite(s.id),listMyProducts(s.id)]);setSeller(s);setProducts(p);setData(x=>({...x,...(m.settings||{})}));setHours(m.hours.length?m.hours:emptyHours);setSpecials(m.specialDates||[]);setState(s=>({...s,loading:false}));}catch(e){setState(s=>({...s,loading:false,error:e.message||"Could not load seller settings."}))}};
  useEffect(()=>{load()},[]);
  const save=async()=>{setState(s=>({...s,busy:true,error:"",ok:""}));try{const loc=validateMap(seller.location_url);const clean={...data,social_facebook_url:data.social_facebook_url.trim(),social_youtube_url:data.social_youtube_url.trim()};await updateMySeller(seller.id,{business_name:seller.business_name,owner_name:seller.owner_name,category_id:seller.category_id,location:seller.location,location_url:loc,city:seller.city,description:seller.description,contact:seller.phone,whatsapp_phone:seller.whatsapp_phone,instagram_url:seller.instagram_url});await saveMicrosite(seller.id,clean);await saveHours(seller.id,hours);await saveSpecialDates(seller.id,specials);setState(s=>({...s,busy:false,ok:"Seller profile updates saved."}));}catch(e){setState(s=>({...s,busy:false,error:e.message||"Could not save updates."}))}};
  if(state.loading)return <main className="page"><div className="page-title"><h1>Loading seller settings…</h1></div></main>;
  if(state.error&&!seller)return <main className="page"><div className="page-title"><h1>Seller settings</h1><div className="inline-error">{state.error}</div></div></main>;
  const addSpecial=()=>setSpecials([...specials,{special_date:"",label:"Special timing / customer update",is_closed:true,ranges:[]}]);
  return <main className="page dashboard-page website-editor-page">
    <button className="back-button" onClick={()=>go("/dashboard")}><ArrowLeft size={17}/> Dashboard</button>
    <div className="dashboard-head"><div><div className="eyebrow">SELLER PROFILE</div><h1>Keep your NammaSpot profile updated.</h1><p>Your profile, catalogue, timings and customer message appear on your NammaSpot seller page.</p></div>{seller&&<a className="secondary-button" href={sellerPublicUrl(seller.slug)} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Preview seller page</a>}</div>
    <div className="dashboard-tabs">{["catalogue","profile","hours","social"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x==="profile"?"Profile & message":x==="hours"?"Date & time":x[0].toUpperCase()+x.slice(1)}</button>)}</div>

    {tab==="profile"&&<section className="seller-form">
      <div className="form-grid"><label>Customer message / update<textarea maxLength={180} value={data.tagline||""} onChange={e=>setData({...data,tagline:e.target.value})} placeholder="Example: Open today 10 AM–8 PM. Orders accepted till 7 PM. DM us for custom orders."/><small>This is shown prominently to customers. Type any current date, time, opening update or short message here.</small></label><label>Area / Town / City<input value={seller.location||""} onChange={e=>setSeller({...seller,location:e.target.value})} placeholder="RS Puram, Coimbatore"/></label><label>Google Maps / Location URL<input type="url" value={seller.location_url||""} onChange={e=>setSeller({...seller,location_url:e.target.value})} placeholder="Paste Google Maps share link"/><small>Paste a public map link. No latitude/longitude is required.</small></label></div>
      <label>About your business<textarea maxLength={1500} value={data.about||""} onChange={e=>setData({...data,about:e.target.value})} placeholder="Tell customers briefly what you sell and what makes your business useful."/></label>
      <label>Services<textarea maxLength={600} value={data.services||""} onChange={e=>setData({...data,services:e.target.value})}/></label>
      <div className="form-grid"><label>Business type<input maxLength={120} value={data.business_type||""} onChange={e=>setData({...data,business_type:e.target.value})}/></label><label>Experience<input maxLength={160} value={data.experience||""} onChange={e=>setData({...data,experience:e.target.value})}/></label><label>Area served<input maxLength={180} value={data.area_served||""} onChange={e=>setData({...data,area_served:e.target.value})}/></label></div>
    </section>}

    {tab==="hours"&&<section className="seller-form">
      <div className="dashboard-item"><div><div className="eyebrow">OPENING HOURS</div><strong>Set your usual hours once.</strong><p>Choose the days you are open and enter one opening and closing time. You can still add a one-day special update below.</p></div><Clock size={22}/></div>
      <div className="hours-simple">
        <div className="hours-time-grid">
          <label>Open from<input type="time" value={hours.find(h=>h.is_open)?.ranges?.[0]?.open||"09:00"} onChange={e=>{const open=e.target.value;setHours(hours.map(h=>h.is_open?{...h,ranges:[{open,close:h.ranges?.[0]?.close||"18:00"}]}:h))}}/></label>
          <label>Close at<input type="time" value={hours.find(h=>h.is_open)?.ranges?.[0]?.close||"18:00"} onChange={e=>{const close=e.target.value;setHours(hours.map(h=>h.is_open?{...h,ranges:[{open:h.ranges?.[0]?.open||"09:00",close}]}:h))}}/></label>
        </div>
        <div className="hours-day-picker" aria-label="Days open">
          {DAYS.map((d,i)=>{const h=hours[i];return <button type="button" key={d} className={h.is_open?"selected":""} onClick={()=>setHours(hours.map((x,n)=>n===i?{...x,is_open:!x.is_open,ranges:!x.is_open?[{open:hours.find(y=>y.is_open)?.ranges?.[0]?.open||"09:00",close:hours.find(y=>y.is_open)?.ranges?.[0]?.close||"18:00"}]:[]}:x))}>{d.slice(0,3)}</button>})}
        </div>
        <p className="muted-note">Example: Mon–Sat, 9:00 AM–6:00 PM. Customers see this compactly on your seller profile.</p>
      </div>
      <h2>One-day update</h2><p className="muted-note">For a holiday or temporary change, enter it once. No weekly schedule editing is needed.</p>
      {specials.map((d,i)=><div className="special-date-row" key={i}><input type="date" value={d.special_date||""} onChange={e=>setSpecials(specials.map((x,n)=>n===i?{...x,special_date:e.target.value}:x))}/><input value={d.label||""} maxLength={120} placeholder="Example: Tomorrow open 9 AM–2 PM" onChange={e=>setSpecials(specials.map((x,n)=>n===i?{...x,label:e.target.value}:x))}/><label className="check-row"><input type="checkbox" checked={d.is_closed!==false} onChange={e=>setSpecials(specials.map((x,n)=>n===i?{...x,is_closed:e.target.checked}:x))}/> Closed</label><button type="button" className="danger-button" onClick={()=>setSpecials(specials.filter((_,n)=>n!==i))}><Trash2 size={14}/></button></div>)}
      <button type="button" className="secondary-button" onClick={addSpecial}><Plus size={15}/> Add one-day update</button>
    </section>}

    {tab==="catalogue"&&<section className="seller-form"><h2>Catalogue</h2><p className="muted-note">Choose products to feature near the top of your NammaSpot catalogue.</p>{products.map(p=><article className="website-product-admin" key={p.id}><div><strong>{p.name}</strong><p>{p.description}</p></div><label className="check-row"><input type="checkbox" checked={Boolean(p.featured)} onChange={async e=>{try{await setProductFeatured(p.id,e.target.checked);setProducts(products.map(x=>x.id===p.id?{...x,featured:e.target.checked}:x))}catch(err){setState(s=>({...s,error:err.message}))}}}/> Featured</label></article>)}</section>}

    {tab==="social"&&<section className="seller-form"><label>Facebook URL<input type="url" value={data.social_facebook_url||""} onChange={e=>setData({...data,social_facebook_url:e.target.value})}/></label><label>YouTube URL<input type="url" value={data.social_youtube_url||""} onChange={e=>setData({...data,social_youtube_url:e.target.value})}/></label></section>}
    {state.error&&<div className="inline-error">{state.error}</div>}{state.ok&&<div className="form-status"><CheckCircle size={18}/>{state.ok}</div>}<button className="primary-button" onClick={save} disabled={state.busy}>{state.busy?"Saving…":"Save profile updates"}</button>
  </main>;
}
