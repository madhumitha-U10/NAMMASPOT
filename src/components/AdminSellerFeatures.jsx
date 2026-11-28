import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, ShieldCheck, Store, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const FEATURES = [
  { key: "offers", label: "Offers section", description: "Dedicated promotions on the public seller page." },
  { key: "polls", label: "Catalogue polls", description: "Customer preference polls with expiry and voting." },
  { key: "subcategories", label: "Catalogue subcategories", description: "Seller-specific sections inside the catalogue." },
  { key: "advanced_catalogue", label: "Advanced catalogue", description: "Additional catalogue controls and enhanced organisation." },
];
const statusLabel = (value) => ({ pending: "Awaiting review", approved: "Approved", rejected: "Rejected", suspended: "Suspended", not_requested: "Not requested" }[value] || value);
const statusClass = (value) => value === "approved" ? "status-ok" : value === "pending" ? "status-warning" : value === "suspended" ? "status-danger" : "";

export default function AdminSellerFeatures({ sellers = [] }) {
  const [rows, setRows] = useState([]);\n  const [contentQueue, setContentQueue] = useState([]);
  const [sellerId, setSellerId] = useState("");
  const [featureKey, setFeatureKey] = useState("offers");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    if (!supabase) { setError("Feature approvals need the connected production database."); return; }
    const [access, offers, polls, subcategories] = await Promise.all([
      supabase.rpc("admin_list_seller_feature_access"),
      supabase.from("seller_offers").select("id,seller_id,title,description,starts_at,ends_at,status,admin_note").eq("status","pending").order("created_at",{ascending:false}),
      supabase.from("seller_polls").select("id,seller_id,question,options,ends_at,status,admin_note").eq("status","pending").order("created_at",{ascending:false}),
      supabase.from("seller_catalogue_subcategories").select("id,seller_id,name,status").eq("status","pending").order("created_at",{ascending:false})
    ]);
    for (const result of [access, offers, polls, subcategories]) if (result.error) throw result.error;
    setRows(access.data || []);
    setContentQueue([...(offers.data||[]).map(x=>({...x,kind:"offer",label:x.title})),...(polls.data||[]).map(x=>({...x,kind:"poll",label:x.question})),...(subcategories.data||[]).map(x=>({...x,kind:"subcategory",label:x.name}))]);
  };
  useEffect(() => { load().catch((e) => setError(e.message || "Could not load feature requests.")); }, []);
  const pending = rows.filter((r) => r.status === "pending").length;\n  const pendingContent = contentQueue.length;
  const filtered = useMemo(() => rows.filter((r) => filter === "all" || r.status === filter), [rows, filter]);
  const decide = async (row, status, enabled = status === "approved") => {
    setBusy(true); setError(""); setSuccess("");
    try {
      const { error: rpcError } = await supabase.rpc("admin_set_seller_feature_access", {
        p_seller_id: row.seller_id, p_feature_key: row.feature_key, p_status: status,
        p_enabled: enabled, p_note: note.trim() || row.review_note || ""
      });
      if (rpcError) throw rpcError;
      await load();
      setSuccess(row.business_name + " · " + row.feature_key + " updated.");
      setNote("");
    } catch (e) { setError(e.message || "Could not update feature access."); }
    finally { setBusy(false); }
  };
  const moderateContent = async (item, status) => {
    setBusy(true); setError(""); setSuccess("");
    try {
      const table = item.kind === "offer" ? "seller_offers" : item.kind === "poll" ? "seller_polls" : "seller_catalogue_subcategories";
      const payload = item.kind === "subcategory" ? { status } : { status, admin_note: note.trim() };
      const { error: updateError } = await supabase.from(table).update(payload).eq("id", item.id);
      if (updateError) throw updateError;
      await load(); setSuccess("Content " + status + " successfully."); setNote("");
    } catch (e) { setError(e.message || "Could not moderate content."); }
    finally { setBusy(false); }
  };
  const grant = async (event) => {
    event.preventDefault();
    if (!sellerId) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const { error: rpcError } = await supabase.rpc("admin_set_seller_feature_access", {
        p_seller_id: sellerId, p_feature_key: featureKey, p_status: "approved",
        p_enabled: true, p_note: note.trim() || "Granted by NammaSpot admin"
      });
      if (rpcError) throw rpcError;
      await load();
      setSuccess("Feature access approved for the selected seller.");
      setNote("");
    } catch (e) { setError(e.message || "Could not grant feature access."); }
    finally { setBusy(false); }
  };

  return <section className="admin-feature-management">
    <div className="dashboard-section-head">
      <div><div className="eyebrow">SELLER GROWTH PROGRAMME</div><h2>Feature access & approvals</h2><p>Approve features seller by seller. No seller receives an advanced feature automatically.</p></div>
      <span className="status-pill status-warning">{pending + pendingContent} pending</span>
    </div>
    <div className="admin-feature-stats">
      <article><span>Requests received</span><strong>{rows.length}</strong></article>
      <article><span>Awaiting review</span><strong>{pending}</strong></article>
      <article><span>Active permissions</span><strong>{rows.filter(r=>r.status==="approved"&&r.enabled).length}</strong></article>
    </div>
    <form className="admin-feature-grant" onSubmit={grant}>
      <div><h3>Grant a feature to a specific seller</h3><p>Use this for invited sellers or approved pilot participants.</p></div>
      <div className="form-grid">
        <label>Seller<select value={sellerId} onChange={e=>setSellerId(e.target.value)} required><option value="">Choose seller</option>{sellers.filter(s=>s.verification_status==="approved").map(s=><option key={s.id} value={s.id}>{s.business_name}</option>)}</select></label>
        <label>Feature<select value={featureKey} onChange={e=>setFeatureKey(e.target.value)}>{FEATURES.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></label>
      </div>
      <label>Admin note (optional)<input value={note} onChange={e=>setNote(e.target.value)} maxLength={500} placeholder="Pilot group, reason, or conditions"/></label>
      <button className="primary-button" disabled={busy||!sellerId}><ShieldCheck size={16}/>{busy?"Saving…":"Approve for this seller"}</button>
    </form>
    <div className="admin-feature-toolbar">
      <div><h3>Feature requests</h3><p>Review each request and enable or pause permissions independently.</p></div>
      <select aria-label="Filter feature requests" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select>
    </div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    {success && <div className="form-status" role="status">{success}</div>}
    <section className="admin-feature-editor">
      <div className="admin-feature-toolbar"><div><h3>Content moderation queue</h3><p>Review seller offers, catalogue polls and subcategories before they appear publicly.</p></div><span className="status-pill status-warning">{contentQueue.length} pending</span></div>
      <label className="admin-feature-note">Decision note (offers and polls)<input value={note} onChange={e=>setNote(e.target.value)} maxLength={500} placeholder="Optional reason or approval condition"/></label>
      <div className="admin-feature-list">
        {contentQueue.map(item=><article className="admin-feature-row" key={item.kind+item.id}>
          <div className="admin-feature-main"><div className="admin-feature-icon"><Store size={19}/></div><div><strong>{item.label}</strong><small>{sellers.find(s=>s.id===item.seller_id)?.business_name || "Seller"} · {item.kind}</small>{item.description&&<small>{item.description}</small>}{item.options&&<small>{item.options.join(" · ")}</small>}{item.ends_at&&<small>Ends {new Date(item.ends_at).toLocaleString("en-IN")}</small>}</div></div>
          <div className="admin-feature-actions"><span className="status-pill status-warning">Pending review</span><div className="button-row"><button className="primary-button" disabled={busy} onClick={()=>moderateContent(item,"approved")}><CheckCircle2 size={15}/>Approve</button><button className="secondary-button" disabled={busy} onClick={()=>moderateContent(item,"rejected")}><XCircle size={15}/>Reject</button></div></div>
        </article>)}
        {!contentQueue.length&&<div className="empty-state"><CheckCircle2 size={22}/><strong>No content waiting for review</strong><p>Seller-submitted content will appear here.</p></div>}
      </div>
    </section>
    <div className="admin-feature-list">
      {filtered.map(row=><article className="admin-feature-row" key={row.access_id}>
        <div className="admin-feature-main"><div className="admin-feature-icon"><Store size={19}/></div><div><strong>{row.business_name}</strong><small>{row.owner_name || "Seller"} · {row.slug}</small><span>{FEATURES.find(f=>f.key===row.feature_key)?.label || row.feature_key}</span>{row.review_note && <small>Admin note: {row.review_note}</small>}</div></div>
        <div className="admin-feature-actions"><span className={"status-pill "+statusClass(row.status)}>{statusLabel(row.status)}{row.enabled&&row.status==="approved"?" · Active":""}</span>
          <div className="button-row">
            {row.status!=="approved"&&<button className="primary-button" disabled={busy} onClick={()=>decide(row,"approved",true)}><CheckCircle2 size={15}/>Approve</button>}
            {row.status==="approved"&&row.enabled&&<button className="secondary-button" disabled={busy} onClick={()=>decide(row,"suspended",false)}>Pause access</button>}
            {row.status!=="rejected"&&<button className="secondary-button" disabled={busy} onClick={()=>decide(row,"rejected",false)}><XCircle size={15}/>Reject</button>}
            {row.status==="suspended"&&<button className="secondary-button" disabled={busy} onClick={()=>decide(row,"approved",true)}>Restore</button>}
          </div>
        </div>
      </article>)}
      {!filtered.length&&<div className="empty-state"><Clock3 size={22}/><strong>No feature requests in this view</strong><p>Seller requests and admin-granted permissions will appear here.</p></div>}
    </div>
    <p className="muted-note">Permissions are checked by the database as well as the interface. Disabling a feature here prevents new content from being published for that seller.</p>
  </section>;
}
