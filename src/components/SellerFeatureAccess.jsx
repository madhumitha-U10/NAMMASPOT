import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Layers3, LockKeyhole, Power, Send, Sparkles, Star, Tag, Trash2, Vote } from "lucide-react";
import { supabase } from "../lib/supabase";

const FEATURES = [
  { key: "offers", label: "Offers", detail: "Show current deals on your public page.", icon: Tag },
  { key: "polls", label: "Polls", detail: "Ask customers what they prefer.", icon: Vote },
  { key: "subcategories", label: "Catalogue sections", detail: "Group products into clear sections.", icon: Layers3 },
  { key: "advanced_catalogue", label: "Featured products", detail: "Pin up to 3 products to the top of your catalogue.", icon: Star },
];

function makeAccessMap(rows) {
  return Object.fromEntries((rows || []).map(row => [row.feature_key, row]));
}

export default function SellerFeatureAccess({ seller, onAccessChange, onSubcategoriesChange }) {
  const [rows, setRows] = useState([]);
  const [offers, setOffers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [pollVoteCounts, setPollVoteCounts] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [offer, setOffer] = useState({ title: "", description: "", starts_at: "", ends_at: "" });
  const [poll, setPoll] = useState({ question: "", options: ["", ""], ends_at: "" });
  const [subcategory, setSubcategory] = useState("");

  const load = async () => {
    if (!supabase || !seller?.id) return;
    const [access, offerRows, pollRows, sectionRows, voteStats] = await Promise.all([
      supabase.from("seller_feature_access").select("feature_key,status,enabled,requested_at,reviewed_at,review_note").eq("seller_id", seller.id),
      supabase.from("seller_offers").select("id,title,description,status,starts_at,ends_at").eq("seller_id", seller.id).order("created_at", { ascending: false }),
      supabase.from("seller_polls").select("id,question,options,status,ends_at").eq("seller_id", seller.id).order("created_at", { ascending: false }),
      supabase.from("seller_catalogue_subcategories").select("id,name,status").eq("seller_id", seller.id).order("sort_order"),
      supabase.rpc("get_seller_poll_vote_counts", { p_seller_id: seller.id }),
    ]);
    for (const result of [access, offerRows, pollRows, sectionRows, voteStats]) if (result.error) throw result.error;
    setRows(access.data || []);
    setOffers(offerRows.data || []);
    setPolls(pollRows.data || []);
    setPollVoteCounts(Object.fromEntries((voteStats.data || []).map(item => [item.poll_id, Number(item.total_votes) || 0])));
    setSubcategories(sectionRows.data || []);
    onAccessChange?.(makeAccessMap(access.data));
    onSubcategoriesChange?.(sectionRows.data || []);
  };

  useEffect(() => {
    let alive = true;
    load().catch(e => { if (alive) setError(e.message || "Could not load Growth Tools."); });
    return () => { alive = false; };
  }, [seller?.id]);

  const access = useMemo(() => makeAccessMap(rows), [rows]);
  const allRequested = FEATURES.every(feature => ["pending", "approved"].includes(access[feature.key]?.status));
  const requestAll = async () => {
    setBusy("request"); setError(""); setNotice("");
    try {
      const { error: requestError } = await supabase.rpc("seller_request_growth_bundle");
      if (requestError) throw requestError;
      await load();
      setNotice("Request sent. You will be able to switch on each approved tool.");
    } catch (e) {
      setError(e.message || "Could not send your request.");
    } finally { setBusy(""); }
  };

  const toggleFeature = async (feature, enabled) => {
    setBusy(feature.key); setError(""); setNotice("");
    try {
      const { error: toggleError } = await supabase.rpc("seller_set_growth_feature_enabled", {
        p_feature_key: feature.key, p_enabled: enabled,
      });
      if (toggleError) throw toggleError;
      await load();
      setNotice(feature.label + (enabled ? " turned on." : " turned off."));
    } catch (e) {
      setError(e.message || "Could not update this tool.");
    } finally { setBusy(""); }
  };

  const createOffer = async event => {
    event.preventDefault(); setBusy("offer"); setError(""); setNotice("");
    try {
      const starts = new Date(offer.starts_at), ends = new Date(offer.ends_at);
      if (!Number.isFinite(starts.getTime()) || !Number.isFinite(ends.getTime()) || ends <= starts) {
        throw new Error("Choose an end date after the start date.");
      }
      const { error: insertError } = await supabase.from("seller_offers").insert({
        ...offer, starts_at: starts.toISOString(), ends_at: ends.toISOString(), seller_id: seller.id, status: "approved",
      });
      if (insertError) throw insertError;
      setOffer({ title: "", description: "", starts_at: "", ends_at: "" });
      await load(); setNotice("Offer saved. It will appear during its active dates.");
    } catch (e) { setError(e.message || "Could not save this offer."); }
    finally { setBusy(""); }
  };

  const createPoll = async event => {
    event.preventDefault(); setBusy("poll"); setError(""); setNotice("");
    try {
      const options = poll.options.map(value => value.trim()).filter(Boolean);
      const ends = new Date(poll.ends_at);
      if (options.length < 2) throw new Error("Add at least two choices.");
      if (!Number.isFinite(ends.getTime()) || ends <= new Date()) throw new Error("Choose a future closing time.");
      const { error: insertError } = await supabase.from("seller_polls").insert({
        seller_id: seller.id, question: poll.question.trim(), options, ends_at: ends.toISOString(),
        status: "approved", show_results: true,
      });
      if (insertError) throw insertError;
      setPoll({ question: "", options: ["", ""], ends_at: "" });
      await load(); setNotice("Poll published on your public page.");
    } catch (e) { setError(e.message || "Could not publish this poll."); }
    finally { setBusy(""); }
  };

  const createSubcategory = async event => {
    event.preventDefault(); setBusy("subcategory"); setError(""); setNotice("");
    try {
      const { error: insertError } = await supabase.from("seller_catalogue_subcategories").insert({
        seller_id: seller.id, name: subcategory.trim(), status: "approved",
      });
      if (insertError) throw insertError;
      setSubcategory(""); await load(); setNotice("Catalogue section added.");
    } catch (e) { setError(e.message || "Could not add this section."); }
    finally { setBusy(""); }
  };

  const removeItem = async (table, id, label) => {
    if (!window.confirm("Delete this " + label + "?")) return;
    setBusy(id); setError(""); setNotice("");
    try {
      const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
      if (deleteError) throw deleteError;
      await load(); setNotice(label.charAt(0).toUpperCase() + label.slice(1) + " deleted.");
    } catch (e) { setError(e.message || "Could not delete this item."); }
    finally { setBusy(""); }
  };

  return <section className="seller-feature-access">
    <div className="dashboard-section-head seller-growth-title">
      <div><div className="eyebrow">GROW YOUR SHOP</div><h2>Growth Tools</h2><p>Request access once. After approval, choose which tools to use.</p></div>
      <span className="seller-growth-count">{FEATURES.filter(f => access[f.key]?.status === "approved").length} of 4 approved</span>
    </div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    {notice && <div className="form-status" role="status"><CheckCircle2 size={16}/>{notice}</div>}

    {!allRequested && <div className="seller-growth-request-card">
      <div><strong>Get all Growth Tools</strong><p>One request covers Offers, Polls, Catalogue Sections and Featured Products.</p></div>
      <button className="primary-button" disabled={Boolean(busy) || seller?.verification_status !== "approved"} onClick={requestAll}>
        <Send size={16}/>{busy === "request" ? "Sending…" : "Request access"}
      </button>
    </div>}

    <div className="seller-feature-grid">
      {FEATURES.map(feature => {
        const row = access[feature.key];
        const approved = row?.status === "approved";
        const enabled = approved && row.enabled;
        const pending = row?.status === "pending";
        const Icon = feature.icon;
        return <article className="seller-feature-card seller-feature-toggle-card" key={feature.key}>
          <div className="seller-feature-card-head">
            <span className="seller-feature-icon"><Icon size={19}/></span>
            <span className={"status-pill " + (approved ? "status-ok" : pending ? "status-warning" : row?.status === "suspended" ? "status-danger" : "")}>
              {approved ? (enabled ? "On" : "Approved") : pending ? "In review" : row?.status === "rejected" ? "Not approved" : row?.status === "suspended" ? "Paused by admin" : "Not requested"}
            </span>
          </div>
          <strong>{feature.label}</strong><p>{feature.detail}</p>
          {approved ? <button type="button" role="switch" aria-checked={enabled} className={"seller-feature-switch " + (enabled ? "is-on" : "")} disabled={Boolean(busy)} onClick={() => toggleFeature(feature, !enabled)}>
            <span className="seller-feature-switch-track"><span/></span><span>{enabled ? "Turn off" : "Turn on"}</span>
          </button> : pending ? <div className="seller-feature-wait"><Clock3 size={15}/> Waiting for review</div> : <div className="seller-feature-wait"><LockKeyhole size={15}/>{row?.status === "rejected" ? "Included in next request" : "Included in your request"}</div>}
          {row?.review_note && <small className="seller-feature-note">{row.review_note}</small>}
        </article>;
      })}
    </div>

    {access.offers?.status === "approved" && access.offers.enabled && <section className="seller-feature-editor">
      <div className="dashboard-section-head"><div><h3><Tag size={17}/> Offers</h3><p>Add a promotion with start and end dates.</p></div></div>
      <form onSubmit={createOffer} className="seller-feature-form">
        <label>Offer title<input value={offer.title} onChange={e => setOffer({ ...offer, title: e.target.value })} maxLength={100} required/></label>
        <label>Short details<textarea value={offer.description} onChange={e => setOffer({ ...offer, description: e.target.value })} maxLength={500}/></label>
        <div className="form-grid"><label>Starts<input type="datetime-local" value={offer.starts_at} onChange={e => setOffer({ ...offer, starts_at: e.target.value })} required/></label><label>Ends<input type="datetime-local" value={offer.ends_at} onChange={e => setOffer({ ...offer, ends_at: e.target.value })} required/></label></div>
        <button className="primary-button" disabled={busy === "offer"}>{busy === "offer" ? "Saving…" : "Publish offer"}</button>
      </form>
      <div className="seller-feature-submissions">{offers.map(item => <div key={item.id}><span><strong>{item.title}</strong><small>{new Date(item.starts_at).toLocaleDateString("en-IN")} – {new Date(item.ends_at).toLocaleDateString("en-IN")}</small></span><button type="button" className="danger-button" disabled={Boolean(busy)} onClick={() => removeItem("seller_offers", item.id, "offer")} aria-label={"Delete " + item.title}><Trash2 size={15}/></button></div>)}</div>
    </section>}

    {access.polls?.status === "approved" && access.polls.enabled && <section className="seller-feature-editor">
      <div className="dashboard-section-head"><div><h3><Vote size={17}/> Polls</h3><p>Ask one question and add 2–6 choices.</p></div></div>
      <form onSubmit={createPoll} className="seller-feature-form">
        <label>Question<input value={poll.question} onChange={e => setPoll({ ...poll, question: e.target.value })} maxLength={240} required/></label>
        {poll.options.map((value, index) => <label key={index}>Choice {index + 1}<input value={value} onChange={e => setPoll({ ...poll, options: poll.options.map((old, i) => i === index ? e.target.value : old) })} maxLength={80} required={index < 2}/></label>)}
        <div className="button-row"><button type="button" className="secondary-button" disabled={poll.options.length >= 6} onClick={() => setPoll({ ...poll, options: [...poll.options, ""] })}>Add choice</button><button type="button" className="secondary-button" disabled={poll.options.length <= 2} onClick={() => setPoll({ ...poll, options: poll.options.slice(0, -1) })}>Remove last</button></div>
        <label>Closes<input type="datetime-local" value={poll.ends_at} onChange={e => setPoll({ ...poll, ends_at: e.target.value })} required/></label>
        <button className="primary-button" disabled={busy === "poll"}>{busy === "poll" ? "Publishing…" : "Publish poll"}</button>
      </form>
      <div className="seller-feature-submissions">{polls.map(item => <div key={item.id}><span><strong>{item.question}</strong><small>Closes {new Date(item.ends_at).toLocaleDateString("en-IN")} · {pollVoteCounts[item.id] || 0} {(pollVoteCounts[item.id] || 0) === 1 ? "vote" : "votes"}</small></span><button type="button" className="danger-button" disabled={Boolean(busy)} onClick={() => removeItem("seller_polls", item.id, "poll")} aria-label="Delete poll"><Trash2 size={15}/></button></div>)}</div>
    </section>}

    {access.subcategories?.status === "approved" && access.subcategories.enabled && <section className="seller-feature-editor">
      <div className="dashboard-section-head"><div><h3><Layers3 size={17}/> Catalogue Sections</h3><p>Add sections customers can browse on your public page.</p></div></div>
      <form onSubmit={createSubcategory} className="seller-feature-form seller-feature-inline-form">
        <label>Section name<input value={subcategory} onChange={e => setSubcategory(e.target.value)} maxLength={60} placeholder="e.g. Handmade gifts" required/></label>
        <button className="primary-button" disabled={busy === "subcategory"}>{busy === "subcategory" ? "Adding…" : "Add section"}</button>
      </form>
      <div className="seller-feature-submissions">{subcategories.map(item => <div key={item.id}><strong>{item.name}</strong><button type="button" className="danger-button" disabled={Boolean(busy)} onClick={() => removeItem("seller_catalogue_subcategories", item.id, "section")} aria-label={"Delete " + item.name}><Trash2 size={15}/></button></div>)}</div>
    </section>}

    <p className="muted-note seller-growth-footnote"><LockKeyhole size={14}/> Only tools approved for your shop can be switched on. Turning one off hides its public section without deleting your saved content.</p>
  </section>;
}
