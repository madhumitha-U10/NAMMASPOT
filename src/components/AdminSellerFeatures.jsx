import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Search, ShieldCheck, Store, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const FEATURES = [
  { key: "offers", label: "Offers" },
  { key: "polls", label: "Polls" },
  { key: "subcategories", label: "Catalogue Sections" },
  { key: "advanced_catalogue", label: "Featured Products" },
];
const statusLabel = row => row.status === "approved" ? (row.enabled ? "On" : "Approved · seller decides") : row.status === "pending" ? "Pending" : row.status === "suspended" ? "Paused" : row.status === "rejected" ? "Rejected" : "Not requested";
const statusClass = row => row.status === "approved" ? "status-ok" : row.status === "pending" ? "status-warning" : row.status === "suspended" ? "status-danger" : "";

export default function AdminSellerFeatures() {
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    if (!supabase) throw new Error("Growth Tools need the connected database.");
    const { data, error: loadError } = await supabase.rpc("admin_list_seller_feature_access");
    if (loadError) throw loadError;
    setRows(data || []);
  };
  useEffect(() => { let alive = true; load().catch(e => alive && setError(e.message || "Could not load requests.")); return () => { alive = false; }; }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.seller_id)) map.set(row.seller_id, {
        seller_id: row.seller_id, business_name: row.business_name, owner_name: row.owner_name, slug: row.slug, rows: [],
      });
      map.get(row.seller_id).rows.push(row);
    }
    return [...map.values()].map(group => ({
      ...group,
      rows: FEATURES.map(feature => group.rows.find(row => row.feature_key === feature.key) || {
        seller_id: group.seller_id, feature_key: feature.key, status: "not_requested", enabled: false,
      }),
    }));
  }, [rows]);

  const filtered = useMemo(() => groups.filter(group => {
    const text = (group.business_name + " " + group.owner_name + " " + group.slug).toLowerCase();
    const matchesSearch = !search.trim() || text.includes(search.trim().toLowerCase());
    const matchesStatus = filter === "all" || group.rows.some(row => row.status === filter);
    return matchesSearch && matchesStatus;
  }), [groups, search, filter]);

  const pendingGroups = groups.filter(group => group.rows.some(row => row.status === "pending")).length;
  const activeCount = rows.filter(row => row.status === "approved" && row.enabled).length;

  const approveBundle = async group => {
    setBusy(group.seller_id); setError(""); setSuccess("");
    try {
      const { data, error: rpcError } = await supabase.rpc("admin_approve_seller_growth_bundle", {
        p_seller_id: group.seller_id, p_note: note.trim(),
      });
      if (rpcError) throw rpcError;
      if (!data) throw new Error("There are no pending tools in this request.");
      await load();
      setSuccess(group.business_name + " · all pending tools approved. The seller can now switch them on.");
      setNote("");
    } catch (e) { setError(e.message || "Could not approve this request."); }
    finally { setBusy(""); }
  };

  const decideOne = async (group, row, status) => {
    setBusy(group.seller_id + row.feature_key); setError(""); setSuccess("");
    try {
      const { error: rpcError } = await supabase.rpc("admin_set_seller_feature_access", {
        p_seller_id: group.seller_id,
        p_feature_key: row.feature_key,
        p_status: status,
        p_enabled: false,
        p_note: note.trim() || (status === "approved" ? "Approved individually; seller controls activation." : ""),
      });
      if (rpcError) throw rpcError;
      await load();
      setSuccess(group.business_name + " · " + FEATURES.find(f => f.key === row.feature_key)?.label + " updated.");
      setNote("");
    } catch (e) { setError(e.message || "Could not update this tool."); }
    finally { setBusy(""); }
  };

  return <section className="admin-feature-management">
    <div className="dashboard-section-head">
      <div><div className="eyebrow">SELLER TOOLS</div><h2>Growth Tools</h2><p>Review one request per seller. Approval gives access; sellers choose what to turn on.</p></div>
      <span className="status-pill status-warning">{pendingGroups} waiting</span>
    </div>

    <div className="admin-feature-stats">
      <article><span>Seller requests</span><strong>{groups.length}</strong></article>
      <article><span>Waiting for review</span><strong>{pendingGroups}</strong></article>
      <article><span>Tools switched on</span><strong>{activeCount}</strong></article>
    </div>

    {error && <div className="inline-error" role="alert">{error}</div>}
    {success && <div className="form-status" role="status"><CheckCircle2 size={16}/>{success}</div>}

    <div className="admin-growth-toolbar">
      <label className="admin-growth-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a seller…"/></label>
      <select aria-label="Filter seller requests" value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All sellers</option><option value="pending">Waiting</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Paused</option>
      </select>
    </div>
    <label className="admin-feature-note">Admin note (optional)<input value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="Add a short note for the seller"/></label>

    <div className="admin-feature-groups">
      {filtered.map(group => {
        const pending = group.rows.filter(row => row.status === "pending");
        return <article className="admin-feature-group" key={group.seller_id}>
          <div className="admin-feature-group-head">
            <div className="admin-feature-seller">
              <span className="admin-feature-icon"><Store size={19}/></span>
              <span><strong>{group.business_name}</strong><small>{group.owner_name || "Seller"} · {group.slug}</small></span>
            </div>
            {pending.length > 0 && <button type="button" className="primary-button" disabled={Boolean(busy)} onClick={() => approveBundle(group)}>
              <ShieldCheck size={16}/>{busy === group.seller_id ? "Approving…" : "Approve all"}
            </button>}
          </div>
          <div className="admin-feature-group-rows">
            {group.rows.map(row => <div className="admin-feature-row" key={row.feature_key}>
              <strong>{FEATURES.find(feature => feature.key === row.feature_key)?.label}</strong>
              <div className="admin-feature-actions">
                <span className={"status-pill " + statusClass(row)}>{statusLabel(row)}</span>
                <div className="button-row">
                  {row.status === "pending" && <button type="button" className="secondary-button" disabled={Boolean(busy)} onClick={() => decideOne(group, row, "approved")}><CheckCircle2 size={14}/>Approve</button>}
                  {row.status === "approved" && <button type="button" className="secondary-button" disabled={Boolean(busy)} onClick={() => decideOne(group, row, "suspended")}>Pause access</button>}
                  {(row.status === "pending" || row.status === "approved") && <button type="button" className="danger-button" disabled={Boolean(busy)} onClick={() => decideOne(group, row, "rejected")}><XCircle size={14}/>Reject</button>}
                  {row.status === "suspended" && <button type="button" className="secondary-button" disabled={Boolean(busy)} onClick={() => decideOne(group, row, "approved")}>Restore</button>}
                </div>
              </div>
            </div>)}
          </div>
        </article>;
      })}
      {!filtered.length && <div className="empty-state"><Clock3 size={22}/><strong>No seller requests found</strong><p>New Growth Tools requests will appear here.</p></div>}
    </div>
    <p className="muted-note">Turning off or pausing a tool hides its public section. Existing seller content stays saved.</p>
  </section>;
}
