import React from "react";
import { Bell, CheckCheck, Heart, MessageCircle, Package } from "lucide-react";
function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}
export default function SellerNotifications({ notifications = [], onRead, onReadAll, onNavigate }) {
  const unread = notifications.filter(item => !item.read_at).length;
  const iconFor = type => type === "enquiry" ? <MessageCircle size={18}/> : type === "product_like" ? <Package size={18}/> : <Heart size={18}/>;
  return <section className="seller-notifications">
    <div className="seller-notifications-head"><div><span className="eyebrow">SELLER ACTIVITY</span><h2>Your notifications</h2><p>Every enquiry and new like is a little sign that customers are finding your shop.</p></div>{unread>0&&<button type="button" className="secondary-button" onClick={onReadAll}><CheckCheck size={16}/> Mark all read</button>}</div>
    {!notifications.length?<div className="seller-notifications-empty"><Bell size={24}/><strong>You're all caught up</strong><p>New shop likes, product likes and customer enquiries will appear here.</p></div>:
    <div className="seller-notifications-list">{notifications.map(item=><article className={"seller-notification-item"+(!item.read_at?" is-unread":"")} key={item.id}>
      <span className="seller-notification-icon">{iconFor(item.notification_type)}</span><div className="seller-notification-copy"><strong>{item.title}</strong><p>{item.message}</p><small>{formatWhen(item.created_at)}</small></div>
      {!item.read_at&&<button type="button" className="seller-notification-action" onClick={()=>item.notification_type==="enquiry"?onNavigate?.():onRead?.(item.id)}>{item.notification_type==="enquiry"?"View enquiry":"Mark read"}</button>}
    </article>)}</div>}
  </section>;
}
