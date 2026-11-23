import React, { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
const KEY = "nammaspot-recent-sellers";
export default function RecentSellerStrip({ go }) {
  const [items,setItems]=useState([]);
  useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem(KEY)||"[]");setItems(Array.isArray(stored)?stored.filter(item=>item?.id&&item?.slug).slice(0,6):[]);}catch{setItems([]);}},[]);
  if(!items.length)return null;
  return <section className="recent-seller-strip" aria-label="Recently viewed sellers">
    <div className="recent-seller-heading"><span><Clock size={16}/> Recently viewed</span><small>Pick up where you left off</small></div>
    <div className="recent-seller-list">{items.map(item=><button type="button" key={item.id} className="recent-seller-item" onClick={()=>go("/s/"+item.slug)}>
      <span className="recent-seller-avatar">{item.image?<img src={item.image} alt=""/>:String(item.name||"S").charAt(0)}</span>
      <span className="recent-seller-copy"><strong>{item.name}</strong>{item.location&&<small><MapPin size={12}/>{item.location}</small>}</span>
    </button>)}</div>
  </section>;
}
