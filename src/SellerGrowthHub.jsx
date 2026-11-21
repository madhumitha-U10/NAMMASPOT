import React, { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Activity, ArrowUpRight, CheckCircle2, Copy, Download, ExternalLink, MessageCircle, Package, Share2, ShoppingBag, Sparkles, Users } from "lucide-react";

function formatStatus(value) {
  return String(value || "new").toLowerCase() === "pending" ? "new" : String(value || "new").toLowerCase();
}

export default function SellerGrowthHub({ seller, products = [], enquiries = [], onNavigate }) {
  const [notice, setNotice] = useState("");
  const publicUrl = typeof window !== "undefined" && seller?.slug
    ? window.location.origin + "/s/" + seller.slug
    : "";

  const metrics = useMemo(() => {
    const newEnquiries = enquiries.filter((item) => ["new", "pending"].includes(formatStatus(item.status))).length;
    const replied = enquiries.filter((item) => ["replied", "responded"].includes(formatStatus(item.status))).length;
    const available = products.filter((item) => item.available !== false).length;
    return { newEnquiries, replied, available };
  }, [products, enquiries]);

  const profileTasks = [
    ["Business description", Boolean(seller?.description?.trim())],
    ["Business location", Boolean(seller?.location?.trim() || seller?.city?.trim())],
    ["Contact number", Boolean(seller?.phone?.trim())],
    ["WhatsApp number", Boolean(seller?.whatsapp_phone?.trim())],
    ["Business photo or logo", Boolean(seller?.profile_image_url)],
    ["At least 3 catalogue items", products.length >= 3],
  ];
  const completed = profileTasks.filter(([, done]) => done).length;
  const completion = Math.round((completed / profileTasks.length) * 100);

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNotice("Your catalogue link has been copied.");
    } catch {
      setNotice("Copy is unavailable in this browser. Select and copy the catalogue link below.");
    }
  };

  const shareWhatsApp = () => {
    if (!publicUrl) return;
    const message = "Explore " + (seller?.business_name || seller?.name || "my business") + " on NammaSpot: " + publicUrl;
    window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  };

  const downloadQr = () => {
    const svg = document.querySelector("#nammaspot-seller-qr svg");
    if (!svg) {
      setNotice("QR code is still loading. Please try again.");
      return;
    }
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nammaspot-catalogue-qr.svg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice("QR code downloaded. You can print it or add it to your shop display.");
  };

  return (
    <section className="ns-growth-hub">
      {notice && <div className="ns-growth-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
      <div className="ns-growth-welcome">
        <div>
          <span className="eyebrow">YOUR BUSINESS AT A GLANCE</span>
          <h2>Welcome, {seller?.owner_name || seller?.business_name || "seller"}.</h2>
          <p>Here are a few simple ways to keep your NammaSpot catalogue useful and easy to discover.</p>
        </div>
        <span className="ns-growth-welcome-icon"><Sparkles size={23}/></span>
      </div>

      <div className="ns-growth-metrics" aria-label="Seller activity summary">
        <article className="ns-growth-metric"><span><Package size={17}/> Catalogue items</span><strong>{products.length}</strong><small>{metrics.available} currently available</small></article>
        <article className="ns-growth-metric"><span><Users size={17}/> Enquiries</span><strong>{enquiries.length}</strong><small>{metrics.newEnquiries} need your attention</small></article>
        <article className="ns-growth-metric"><span><MessageCircle size={17}/> Replied</span><strong>{metrics.replied}</strong><small>Marked as replied</small></article>
      </div>
      <p className="ns-growth-data-note"><Activity size={14}/> These are counts from your current catalogue and enquiry records. Catalogue visits and QR scans are not tracked yet.</p>

      <div className="ns-growth-columns">
        <article className="ns-growth-panel">
          <div className="ns-growth-panel-head"><div><span className="eyebrow">PROFILE CHECKLIST</span><h3>Make your profile customer-ready</h3></div><strong className="ns-growth-percent">{completion}%</strong></div>
          <div className="ns-growth-progress" role="progressbar" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100"><span style={{ width: completion + "%" }}/></div>
          <ul className="ns-growth-checklist">
            {profileTasks.map(([label, done]) => <li key={label} className={done ? "done" : ""}><CheckCircle2 size={17}/><span>{label}</span>{!done && <button type="button" onClick={() => onNavigate("profile")}>Add</button>}</li>)}
          </ul>
        </article>

        <article className="ns-growth-panel ns-growth-actions-panel">
          <span className="eyebrow">QUICK ACTIONS</span>
          <h3>Keep your business moving</h3>
          <button type="button" className="ns-growth-action" onClick={() => onNavigate("products")}><span><Package size={18}/><span><strong>Update your catalogue</strong><small>Add products, prices and availability</small></span></span><ArrowUpRight size={17}/></button>
          <button type="button" className="ns-growth-action" onClick={() => onNavigate("enquiries")}><span><MessageCircle size={18}/><span><strong>Check customer enquiries</strong><small>{metrics.newEnquiries ? metrics.newEnquiries + " new or pending" : "No new enquiries right now"}</small></span></span><ArrowUpRight size={17}/></button>
          <button type="button" className="ns-growth-action" onClick={() => onNavigate("growth")}><span><Share2 size={18}/><span><strong>Share your catalogue</strong><small>Get your link and printable QR code</small></span></span><ArrowUpRight size={17}/></button>
        </article>
      </div>

      <article className="ns-growth-tip">
        <span className="ns-growth-tip-icon"><Sparkles size={19}/></span>
        <div><strong>A small tip for more enquiries</strong><p>Keep product photos clear, prices up to date and availability accurate. Share your catalogue link in your WhatsApp status and Instagram bio.</p></div>
      </article>
    </section>
  );
}

export function SellerGrowthSharing({ seller }) {
  const [notice, setNotice] = useState("");
  const publicUrl = typeof window !== "undefined" && seller?.slug ? window.location.origin + "/s/" + seller.slug : "";
  const businessName = seller?.business_name || seller?.name || "My business";
  const shareText = "Discover " + businessName + " on NammaSpot. Browse the catalogue here: " + publicUrl;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNotice("Catalogue link copied.");
    } catch {
      setNotice("Select and copy the catalogue link shown below.");
    }
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: businessName + " on NammaSpot", text: shareText, url: publicUrl }).catch(() => {});
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank", "noopener,noreferrer");
    }
  };

  const downloadQr = () => {
    const svg = document.querySelector("#nammaspot-growth-qr svg");
    if (!svg) { setNotice("QR code is loading. Try again in a moment."); return; }
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "nammaspot-" + String(seller?.slug || "catalogue") + "-qr.svg";
    link.click();
    URL.revokeObjectURL(objectUrl);
    setNotice("QR code downloaded.");
  };

  return (
    <section className="ns-growth-share">
      <div className="ns-growth-share-intro"><span className="eyebrow">GET DISCOVERED</span><h2>Take your catalogue everywhere.</h2><p>Share your NammaSpot link online or display this QR code at your shop, stall, packaging or business card.</p></div>
      <div className="ns-growth-share-card">
        <div className="ns-growth-qr" id="nammaspot-growth-qr"><QRCodeSVG value={publicUrl || "https://nammaspot.vercel.app"} size={190} level="H" includeMargin/></div>
        <div className="ns-growth-share-copy"><span className="eyebrow">YOUR PUBLIC CATALOGUE</span><h3>{businessName}</h3><p>Customers can scan this code to open your NammaSpot catalogue.</p><code>{publicUrl}</code><div className="button-row"><button type="button" className="primary-button" onClick={downloadQr}><Download size={16}/> Download QR</button><button type="button" className="secondary-button" onClick={copyLink}><Copy size={16}/> Copy link</button></div><button type="button" className="ns-growth-whatsapp" onClick={share}><Share2 size={16}/> Share catalogue</button>{notice && <p className="ns-growth-share-notice" role="status">{notice}</p>}</div>
      </div>
      <div className="ns-growth-share-tips"><h3>Where can you use your QR?</h3><div><span>01</span><p>Display it near your shop counter or stall.</p></div><div><span>02</span><p>Add it to packaging, thank-you cards or printed flyers.</p></div><div><span>03</span><p>Share your catalogue link in WhatsApp and Instagram.</p></div></div>
    </section>
  );
}
