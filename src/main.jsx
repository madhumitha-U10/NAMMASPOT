import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
const QRCodeSVG = lazy(() => import("qrcode.react").then((module) => ({ default: module.QRCodeSVG })));
import {
  Search, MapPin, Heart, Share2, Phone, MessageCircle, Plus,
  ArrowLeft, Menu, X, Store, ChevronRight, Home, Compass, Grid2X2,
  Sparkles, CheckCircle, LogIn, LogOut, LayoutDashboard, ShieldCheck,
  Trash2, Pencil, ExternalLink, Clock, Send, AlertCircle, Eye, EyeOff
} from "lucide-react";
import "./styles.css";
import "./microsite.css";
const SellerMicrositePage = lazy(() => import("./SellerMicrositePage.jsx"));
const WebsiteEditorPage = lazy(() => import("./WebsiteEditorPage.jsx"));
import {
  isSupabaseConfigured,
  isProductionConfigurationError,
  BackendNotConfiguredError,
  getPublicSellers,
  getPublicSeller,
  getCategories,
  getCurrentProfile,
  getMySeller,
  getMyEnquiries,
  signInSeller,
  signInAdmin,
  setSellerPassword,
  startSellerPasswordSetup,
  verifySellerPasswordSetupOtp,
  startSellerRegistration,
  verifySellerRegistrationOtp,
  signOut,
  updateMySeller,
  updateSellerImages,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createEnquiry,
  updateEnquiryStatus,
  saveFavourite,
  removeFavourite,
  listMyFavourites,
  isCurrentUserAdmin,
  adminListSellers,
  adminUpdateSellerStatus,
  adminDeleteSuspendedSeller,
  adminListCategories,
  adminAddCategory,
  adminRenameCategory,
  adminDeleteCategory,
  adminStorageUsage,
  adminOtpUsageAlerts,
  uploadSellerMedia,
  getSellerStorageUsage
} from "./lib/api";
import { categoryNames } from "./lib/seed";
import CategoryIcon from "./components/brand/CategoryIcon.jsx";
import { addProductGalleryImage, deleteProductGalleryImage, getMyMicrosite, saveMicrosite } from "./lib/microsite";
import { formatBytes, SELLER_STORAGE_QUOTA_LABEL, SELLER_STORAGE_WARNING_LABEL, MAX_SELLER_IMAGE_LABEL } from "./lib/storage";

const popularCategories = ["Bakery", "Mehendi", "Crochet", "Makeup", "Art"];


function App() {
  const [path, setPath] = useState(() => location.pathname + location.search);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState(() => readLocalSaved());
  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onPop = () => setPath(location.pathname + location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    localStorage.setItem("nammaspot-saved", JSON.stringify(saved));
  }, [saved]);


  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let alive = true;
    getCurrentProfile().then(async (next) => {
      if (!alive) return;
      setProfile(next);
      if (next) {
        try {
          const remote = await listMyFavourites();
          if (alive && remote.length) setSaved(remote);
        } catch {}
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const go = (next) => {
    history.pushState({}, "", next);
    setPath(next);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const toggleSave = async (sellerId) => {
    const already = saved.includes(sellerId);
    setSaved((items) => already ? items.filter((id) => id !== sellerId) : [...items, sellerId]);
    if (!isSupabaseConfigured || !profile) return;

    try {
      if (already) await removeFavourite(sellerId);
      else await saveFavourite(sellerId);
    } catch (error) {
      setNotice(error instanceof BackendNotConfiguredError ? "Saved locally." : "Saved locally; sync failed for now.");
    }
  };

  const onSignOut = async () => {
    try {
      await signOut();
      setProfile(null);
      setNotice("Signed out.");
      go("/");
    } catch {
      setNotice("Could not sign out. Please try again.");
    }
  };

  const route = getRoute(path);

  useEffect(() => {
    const privateRoutes = new Set(["login", "register", "dashboard", "admin-login", "admin-dashboard", "admin", "saved", "not-found"]);
    setMeta("robots", privateRoutes.has(route) ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    if (route === "seller") return;
    const metadata = {
      home: ["NammaSpot — Namma Ooru. Namma People. Namma Spot.", "Discover local sellers, home businesses, crafts, food and makers across Chennai and Tamil Nadu."],
      explore: ["Explore Local Sellers · NammaSpot", "Explore local businesses, products, makers and home sellers across Tamil Nadu."],
      categories: ["Shop by Category · NammaSpot", "Discover local sellers by category on NammaSpot."],
      featured: ["Featured Local Sellers · NammaSpot", "Meet featured local sellers and small businesses on NammaSpot."],
      saved: ["Saved Sellers · NammaSpot", "Your saved local sellers on NammaSpot."],
      login: ["Seller Login · NammaSpot", "Sign in to manage your NammaSpot seller account."],
      register: ["Create Seller Account · NammaSpot", "Create a NammaSpot seller account and publish your local business catalogue after approval."],
      dashboard: ["Seller Dashboard · NammaSpot", "Manage your NammaSpot business profile, catalogue and enquiries."],
      "admin-login": ["Admin Login · NammaSpot", "Authorized NammaSpot administration access."],
      "admin-dashboard": ["Admin Console · NammaSpot", "Authorized NammaSpot administration console."],
      "website-editor": ["Seller Profile Settings · NammaSpot", "Manage your NammaSpot seller profile settings."],
      "not-found": ["Page Not Found · NammaSpot", "This NammaSpot page could not be found."]
    };
    const [title, description] = metadata[route] || metadata.home;
    document.title = title;
    setMeta("description", description);
    setCanonical(location.origin + (location.pathname === "/" ? "/" : location.pathname));
    setPropertyMeta("og:title", title);
    setPropertyMeta("og:description", description);
    setPropertyMeta("og:url", location.origin + location.pathname);
    setPropertyMeta("og:image", location.origin + "/og-image.svg");
    setPropertyMeta("og:type", route === "seller" ? "profile" : "website");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", location.origin + "/og-image.svg");
  }, [route, path]);

  if (isProductionConfigurationError) {
    return <main className="page" role="alert" style={{maxWidth:680,margin:"12vh auto",padding:24}}>
      <div className="eyebrow">NAMMASPOT CONFIGURATION ERROR</div>
      <h1>Production backend is not configured</h1>
      <p>NammaSpot has stopped instead of showing demo data. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the Vercel Production environment, then redeploy.</p>
    </main>;
  }

  return (
    <div className="app-shell">
      {!isSupabaseConfigured && (
        <div className="demo-bar">
          Preview mode · connect Supabase to activate seller accounts, enquiries, QR dashboard and admin moderation.
        </div>
      )}

      <header className="topbar">
        <button className="brand" onClick={() => go("/")} aria-label="NammaSpot home"><span className="brand-mark">N</span><span>NammaSpot</span></button>

        <nav className={menu ? "desktop-nav open" : "desktop-nav"} aria-label="Primary navigation">
          <button onClick={() => go("/")}>Home</button>
          <button className={route === "explore" ? "nav-active" : ""} onClick={() => go("/explore")}>Explore</button>
          <button className={route === "categories" ? "nav-active" : ""} onClick={() => go("/categories")}>Categories</button>
          <button className={route === "featured" ? "nav-active" : ""} onClick={() => go("/featured")}>Featured</button>
          <button className={route === "saved" ? "nav-active" : ""} onClick={() => go("/saved")}>Saved</button>
          {profile?.role === "seller" && <button onClick={() => go("/dashboard")}><LayoutDashboard size={15}/> Dashboard</button>}
          {profile?.role === "admin" && <button onClick={() => go("/nammaspot-control-panel/dashboard")}><ShieldCheck size={15}/> Admin Console</button>}
          {profile ? (
            <button onClick={onSignOut}><LogOut size={15}/> Sign out</button>
          ) : (
            <button onClick={() => go("/login")}><LogIn size={15}/> Seller login</button>
          )}
          <button className="seller-cta" onClick={() => go("/register")}>List your business</button>
        </nav>

        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={() => go("/explore")}><Search size={22}/></button>
          <button className="icon-button menu-toggle" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu((value) => !value)}>
            {menu ? <X size={23}/> : <Menu size={23}/>}
          </button>
        </div>
      </header>

      {notice && <button className="notice" onClick={() => setNotice("")}>{notice}</button>}

      {route === "home" && <HomePage go={go} query={query} setQuery={setQuery}/>}
      {route === "explore" && <ExplorePage go={go} query={query} setQuery={setQuery} saved={saved} toggleSave={toggleSave}/>}
      {route === "categories" && <CategoriesPage go={go}/>}
      {route === "featured" && <FeaturedPage go={go} saved={saved} toggleSave={toggleSave}/>}
      {route === "saved" && <SavedPage go={go} saved={saved} toggleSave={toggleSave}/>}
      {route === "login" && <LoginPage go={go} onSignedIn={(next) => setProfile(next)} />}
      {route === "register" && <RegisterPage go={go}/>}
      {route === "dashboard" && <DashboardPage go={go} profile={profile}/>}
      {route === "admin-login" && <AdminLoginPage go={go} onSignedIn={(next) => setProfile(next)} />}
      {route === "admin-dashboard" && <AdminPage go={go}/>}
      {route === "seller" && <Suspense fallback={<main className="page" aria-live="polite">Loading seller catalogue…</main>}><SellerMicrositePage go={go} slug={getSellerSlug(path)}/></Suspense>}
      {route === "website-editor" && <Suspense fallback={<main className="page" aria-live="polite">Loading settings…</main>}><WebsiteEditorPage go={go}/></Suspense>}
      {route === "not-found" && <main className="page"><Empty title="Page not found" text="That NammaSpot page does not exist." actionLabel="Back home" onAction={() => go("/")}/></main>}

      <MobileBottomNav path={path} go={go}/>
    </div>
  );
}

function getRoute(path) {
  if (path === "/") return "home";
  if (path.startsWith("/explore")) return "explore";
  if (path.startsWith("/categories")) return "categories";
  if (path.startsWith("/featured")) return "featured";
  if (path.startsWith("/saved")) return "saved";
  if (path.startsWith("/login")) return "login";
  if (path === "/register") return "register";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard/website")) return "website-editor";
  if (path.startsWith("/dashboard")) return "dashboard";
  if (path.startsWith("/nammaspot-control-panel/login")) return "admin-login";
  if (path.startsWith("/nammaspot-control-panel/dashboard") || path.startsWith("/admin-console")) return "admin-dashboard";
  if (path.startsWith("/admin")) return "not-found";
  if (path.startsWith("/s/")) return "seller";
  return "not-found";
}

function getSellerSlug(path) {
  return decodeURIComponent(path.split("/")[2] || "");
}

function readLocalSaved() {
  try {
    return JSON.parse(localStorage.getItem("nammaspot-saved") || "[]");
  } catch {
    return [];
  }
}

function useAsync(loader, deps) {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: "", data: null });
    loader()
      .then((data) => alive && setState({ loading: false, error: "", data }))
      .catch((error) => alive && setState({ loading: false, error: friendlyError(error), data: null }));
    return () => { alive = false; };
  }, deps);
  return state;
}

function HomePage({ go, query, setQuery }) {
  const state = useAsync(() => getPublicSellers(), []);
  const sellers = (state.data || []).slice(0, 3);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">CHENNAI · TAMIL NADU</div>
          <h1>Namma Ooru.<br/>Namma People.<br/><em>Namma Spot.</em></h1>
          <p className="hero-copy">
            Discover the authentic flavours, crafts and talents of Chennai&apos;s vibrant local scene.
            Handcrafted by the community, for the community.
          </p>
          <div className="hero-search-wrap">
            <div className="hero-search">
              <Search size={24}/>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && go(query.trim() ? "/explore?search=" + encodeURIComponent(query.trim()) : "/explore")}
                placeholder="Try 'bridal mehendi Adyar' or 'eggless cake'"
                aria-label="Search local sellers and products"
              />
            </div>
          </div>
          <button className="hero-search-button" onClick={() => go(query.trim() ? "/explore?search=" + encodeURIComponent(query.trim()) : "/explore")}>Search</button>
          <div className="quick-chips" aria-label="Popular categories">
            {popularCategories.map((category) => (
              <button key={category} onClick={() => go("/explore?search=" + encodeURIComponent(category))}>{category}</button>
            ))}
          </div>
          <div className="neighbourhood-chips" aria-label="Explore Chennai neighbourhoods">
            <span>YOUR SIDE OF CHENNAI</span>
            {["Adyar", "T. Nagar", "Anna Nagar", "Mylapore", "Velachery", "OMR"].map((area) => (
              <button key={area} onClick={() => { setQuery(""); go("/explore?area=" + encodeURIComponent(area)); }}>{area}</button>
            ))}
          </div>
          <div className="home-trust-row" aria-label="How NammaSpot works">
            <span><CheckCircle size={15}/> Real local sellers</span>
            <span><Compass size={15}/> Browse catalogues</span>
            <span><MessageCircle size={15}/> Contact directly</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AROUND CHENNAI</div>
            <h2>Little finds, local stories.</h2>
          </div>
          <button className="text-link" onClick={() => go("/explore")}>Explore all <ChevronRight size={17}/></button>
        </div>

        {state.loading ? <CardSkeletonRow/> :
          state.error ? <ErrorState message={state.error} retry={() => location.reload()}/> :
          sellers.length ? <div className="seller-preview-grid">{sellers.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go}/>)}</div> :
          <Empty title="Local sellers are coming soon" text="Check back soon for the first NammaSpot catalogues." actionLabel="Explore" onAction={() => go("/explore")}/>}
      </section>

      <section className="story-strip">
        <div className="story-icon"><Store size={28}/></div>
        <div>
          <div className="eyebrow">FOR LOCAL MAKERS</div>
          <h2>Your work deserves a spot.</h2>
          <p>Put your products, story and contact details in one simple digital catalogue.</p>
        </div>
        <button onClick={() => go("/register")}>List your business <ChevronRight size={18}/></button>
      </section>
    </main>
  );
}

function ExplorePage({ go, query, setQuery, saved, toggleSave }) {
  const params = new URLSearchParams(location.search);
  const category = params.get("cat") || "All";
  const near = params.get("near") || "";
  const urlQuery = params.get("search") || "";
  const area = params.get("area") || "";
  useEffect(() => { if (urlQuery) setQuery(urlQuery); }, [urlQuery, setQuery]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(location.search);
      if (query.trim()) next.set("search", query.trim());
      else next.delete("search");
      const suffix = next.toString();
      history.replaceState({}, "", location.pathname + (suffix ? "?" + suffix : "") + location.hash);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  const activeNear = area || near;
  const options = useMemo(() => ({ query, category, near: activeNear }), [query, category, activeNear]);
  const state = useAsync(() => getPublicSellers(options), [options]);

  const categories = Array.from(new Set(["All", ...popularCategories, ...categoryNames]));

  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">{activeNear ? "NEARBY · " + activeNear.toUpperCase() : "DISCOVER"}</div>
        <h1>{near ? "Local around Chennai." : "Find your kind of local."}</h1>
        <p>Search by seller, product, category or neighbourhood.</p>
      </div>

      <div className="explore-search">
        <Search size={21}/>
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sellers, products or places"/>
        {query && <button onClick={() => setQuery("")}>Clear</button>}
      </div>

      <div className="category-row">
        {categories.map((cat) => (
          <button key={cat} className={cat === category ? "active" : ""} onClick={() => go(cat === "All" ? "/explore" : "/explore?cat=" + encodeURIComponent(cat))}>
            {cat}
          </button>
        ))}
        <button className={near ? "active" : ""} onClick={() => go(near ? "/explore" : "/explore?near=Chennai")}>Near me</button>
      </div>

      {state.loading ? <CardSkeletonRow detailed/> :
        state.error ? <ErrorState message={state.error} retry={() => location.reload()}/> :
        state.data?.length ? <div className="seller-list">{state.data.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved={saved.includes(seller.id)} detailed/>)}</div> :
        <Empty title="No sellers found" text="Try a different search or category." actionLabel="Clear filters" onAction={() => go("/explore")}/>}
    </main>
  );
}

const chennaiCategories = [
  "Food & Bakery", "Mehendi", "Bridal Makeup", "Crochet & Handmade",
  "Jewellery", "Boutique & Fashion", "Home Decor", "Gifts", "Art",
  "Photography", "Beauty", "Services"
];

function CategoriesPage({ go }) {
  const state = useAsync(() => getCategories(), []);
  const knownCategoryNames = new Set([
    ...chennaiCategories, "Food", "Bakery", "Henna", "Makeup", "Crochet", "Handmade",
    "Crafts", "Jewelry", "Accessories", "Accessory", "Boutique", "Fashion",
    "Home & Decor", "Home", "Decor", "Gift", "Photo", "Service"
  ].map((name) => name.toLowerCase()));
  const customCategories = (state.data || []).map((item) => item.name).filter((name) =>
    !knownCategoryNames.has(String(name).trim().toLowerCase())
  );
  const categories = [...chennaiCategories, ...customCategories];
  return (
    <main className="page categories-page">
      <div className="page-title">
        <div className="eyebrow">MADE AROUND US · CHENNAI</div>
        <h1>Find your kind of local.</h1>
        <p>From home-baked treats to handmade treasures, meet the people and small businesses that make our neighbourhoods feel like home.</p>
      </div>
      {state.loading ? <CardSkeletonRow detailed/> :
        <div className="category-grid-large">
          {categories.map((category,index) => (
            <div className="category-card-wrap" key={category}>
              <button className="category-card-visual" onClick={() => go("/explore?cat=" + encodeURIComponent(category))} aria-label={"Explore " + category}>
                <span className="category-card-number">{String(index + 1).padStart(2,"0")}</span>
                <span className="category-icon-disc"><CategoryIcon category={category} size={46}/></span>
                <span className="category-card-copy">
                  <small>LOCAL FINDS</small>
                  <strong>{category}</strong>
                  <span>Made with care, close to home</span>
                </span>
                <span className="category-card-arrow"><ChevronRight size={19}/></span>
              </button>
            </div>
          ))}
        </div>}
    </main>
  );
}
function FeaturedPage({ go, saved, toggleSave }) {
  const state = useAsync(() => getPublicSellers(), []);
  const items = (state.data || []).filter((seller) => seller.featured);
  return (
    <main className="page">
      <div className="page-title"><div className="eyebrow">HANDPICKED</div><h1>Featured local sellers.</h1><p>A small selection worth a closer look.</p></div>
      {state.loading ? <CardSkeletonRow detailed/> :
        state.error ? <ErrorState message={state.error}/> :
        items.length ? <div className="seller-list">{items.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved={saved.includes(seller.id)} detailed/>)}</div> :
        <Empty title="Featured sellers are coming soon" text="Explore the current local catalogue instead." actionLabel="Explore sellers" onAction={() => go("/explore")}/>}
    </main>
  );
}

function SavedPage({ go, saved, toggleSave }) {
  const state = useAsync(() => getPublicSellers(), [saved.join(",")]);
  const sellers = (state.data || []).filter((seller) => saved.includes(seller.id));
  return (
    <main className="page">
      <div className="page-title"><div className="eyebrow">YOUR LIST</div><h1>Places you want to remember.</h1><p>Keep your local favourites close by.</p></div>
      {state.loading ? <CardSkeletonRow detailed/> :
        state.error ? <ErrorState message={state.error}/> :
        sellers.length ? <div className="seller-list">{sellers.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved detailed/>)}</div> :
        <Empty title="Nothing saved yet" text="Tap the heart on a seller and they will appear here." actionLabel="Explore sellers" onAction={() => go("/explore")}/>}
    </main>
  );
}

function SellerCard({ seller, index=0, go, toggleSave, saved, detailed=false }) {
  return (
    <article className={detailed ? "seller-card detailed" : "seller-card"}>
      <button className={"seller-cover cover-" + ((index % 4)+1)} onClick={() => go("/s/" + seller.slug)} aria-label={"Open " + seller.name}>
        {seller.profile_image_url && <img className="seller-cover-image" src={seller.profile_image_url} alt="" loading="lazy" />}
        <span className="seller-cover-shade" />
        <span className="category-label">{seller.category}</span>
        {seller.featured && <span className="featured-label"><Sparkles size={13}/> Featured</span>}
      </button>
      <div className="seller-card-body">
        <div className="seller-card-top">
          <button className="seller-title-button" onClick={() => go("/s/" + seller.slug)}>
            <h3>{seller.name}</h3>
            <p><MapPin size={14}/> {seller.location || "Chennai"}</p>
          </button>
          {toggleSave && <button className={saved ? "save-button is-saved" : "save-button"} onClick={() => toggleSave(seller.id)} aria-label={saved ? "Remove saved seller" : "Save seller"}><Heart size={18} fill={saved ? "currentColor" : "none"}/></button>}
        </div>
        {detailed && <p className="seller-description">{seller.description}</p>}
        <div className="product-lines">{seller.products.slice(0,2).map((product) => <span key={product.id}>{product.name} · ₹{product.price}</span>)}</div>
        <button className="card-link" onClick={() => go("/s/" + seller.slug)}>View catalogue <ChevronRight size={16}/></button>
      </div>
    </article>
  );
}

function SellerPage({ go, slug, saved, toggleSave }) {
  const state = useAsync(() => getPublicSeller(slug), [slug]);
  const [enquiryProduct,setEnquiryProduct] = useState(null);

  useEffect(() => {
    if (!state.data) return undefined;
    document.title = state.data.name + " · " + state.data.category + " · NammaSpot";
    setMeta("description", state.data.description || "Discover " + state.data.name + " on NammaSpot.");
    setCanonical(location.origin + "/s/" + state.data.slug);
    const jsonId = "nammaspot-seller-jsonld";
    const existing = document.getElementById(jsonId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = jsonId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context":"https://schema.org",
      "@type":"LocalBusiness",
      name: state.data.name,
      description: state.data.description,
      address: { "@type":"PostalAddress", addressLocality: state.data.city || state.data.location || "Chennai", addressRegion:"Tamil Nadu", addressCountry:"IN" },
      url: location.origin + "/s/" + state.data.slug,
      telephone: state.data.phone || undefined,
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
      document.title = "NammaSpot — Namma Ooru. Namma People. Namma Spot.";
    };
  }, [state.data]);

  if (state.loading) return <main className="page"><div className="page-title"><div className="eyebrow">CATALOGUE</div><h1>Loading seller…</h1></div><CardSkeletonRow detailed/></main>;
  if (state.error) return <main className="page"><ErrorState message={state.error}/></main>;
  if (!state.data) return <main className="page"><Empty title="Seller not found" text="This catalogue may no longer be available." actionLabel="Back to explore" onAction={() => go("/explore")}/></main>;

  const seller = state.data;
  return (
    <main className="seller-page">
      <button className="back-button" onClick={() => go("/explore")}><ArrowLeft size={17}/> Back to explore</button>

      <section className="seller-profile">
        <div className="profile-cover cover-1">
          <span>{seller.category}</span>
        </div>
        <div className="profile-main">
          <div className="profile-avatar">
            {seller.profile_image_url ? <img src={seller.profile_image_url} alt={seller.name + " logo"} /> : seller.name.charAt(0)}
          </div>
          <div className="profile-copy">
            <div className="eyebrow">
              {seller.category} {seller.verified && "· VERIFIED"}
            </div>
            <h1>{seller.name}</h1>
            <p className="profile-location"><MapPin size={16}/> {seller.location || seller.city || "Chennai"}</p>
            <p>{seller.description}</p>
            {(seller.opening_time || seller.closing_time) && <p><Clock size={16}/> {seller.opening_time || "Open"} – {seller.closing_time || "Close"}</p>}
            <div className="profile-actions">
              {seller.phone && <a className="primary-button" href={"tel:" + seller.phone}><Phone size={17}/> Call</a>}
              {seller.whatsapp_phone && <a className="secondary-button" href={"https://wa.me/" + seller.whatsapp_phone.replace(/\D/g,"")} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp</a>}
              <button className="secondary-button" onClick={() => shareSeller(seller)}><Share2 size={17}/> Share</button>
              <button className={saved.includes(seller.id) ? "secondary-button saved-action" : "secondary-button"} onClick={() => toggleSave(seller.id)}><Heart size={17} fill={saved.includes(seller.id) ? "currentColor" : "none"}/>{saved.includes(seller.id) ? "Saved" : "Save"}</button>
              {seller.instagram_url && <a className="secondary-button" href={seller.instagram_url} target="_blank" rel="noreferrer"><ExternalLink size={17}/> Instagram</a>}
              {seller.location_url && <a className="secondary-button" href={seller.location_url} target="_blank" rel="noreferrer"><MapPin size={17}/> Location</a>}
            </div>
          </div>
        </div>
      </section>

      <section className="catalogue-section">
        <div className="section-heading"><div><div className="eyebrow">THE CATALOGUE</div><h2>Products & favourites.</h2></div></div>
        {seller.products.length
          ? <div className="product-grid">{seller.products.map((product,index) => <ProductCard key={product.id} product={product} index={index} onEnquire={() => setEnquiryProduct(product)}/>)}</div>
          : <Empty title="No products available yet" text="The seller has not added products to this catalogue."/>}
      </section>

      {enquiryProduct && <EnquiryModal seller={seller} product={enquiryProduct} onClose={() => setEnquiryProduct(null)}/>}
    </main>
  );
}

function ProductCard({ product, index, onEnquire }) {
  return (
    <article className="product-card">
      <div className={"product-image product-" + ((index % 3)+1)}>
        {product.image_url ? <img src={product.image_url} alt={product.name}/> : <span>{product.name.charAt(0)}</span>}
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-meta"><strong>₹{product.price}</strong><small>{product.available ? "Available" : "Currently unavailable"}</small></div>
        <button className="primary-button full-button" disabled={!product.available} onClick={onEnquire}>
          <MessageCircle size={16}/> {product.available ? "Enquire" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

function EnquiryModal({ seller, product, onClose }) {
  const [data,setData] = useState({name:"",contact:"",message:"Hi, I’m interested in " + product.name + "."});
  const [state,setState] = useState({loading:false,error:"",success:false});

  const submit = async (event) => {
    event.preventDefault();
    setState({loading:true,error:"",success:false});
    try {
      await createEnquiry({seller_id:seller.id,product_id:product.id,customer_name:data.name,customer_contact:data.contact,message:data.message});
      setState({loading:false,error:"",success:true});
    } catch (error) {
      setState({loading:false,error:friendlyError(error),success:false});
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
        <button className="modal-close" onClick={onClose} aria-label="Close enquiry form"><X/></button>
        {state.success ? (
          <div className="success-panel">
            <CheckCircle size={34}/>
            <h2>Enquiry sent.</h2>
            <p>The seller can now respond to your request.</p>
            <button className="primary-button" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="eyebrow">CONTACT SELLER</div>
            <h2 id="enquiry-title">Ask about {product.name}</h2>
            <p className="modal-copy">{seller.name}</p>
            <form className="seller-form compact-form" onSubmit={submit}>
              <label>Your name *<input value={data.name} onChange={(e)=>setData({...data,name:e.target.value})} maxLength={120} required/></label>
              <label>Phone / email *<input value={data.contact} onChange={(e)=>setData({...data,contact:e.target.value})} maxLength={160} required/></label>
              <label>Message *<textarea value={data.message} onChange={(e)=>setData({...data,message:e.target.value})} maxLength={1000} required/></label>
              {state.error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{state.error}</div>}
              <button className="primary-button full-button" disabled={state.loading}>{state.loading ? "Sending…" : <><Send size={16}/> Send enquiry</>}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function RegisterPage({ go }) {
  const [data,setData] = useState({nammaspotId:"",business:"",owner:"",phone:"",password:"",category:"Handmade",location:"",locationUrl:"",description:"",whatsapp:"",instagram:""});
  const [state,setState] = useState({loading:false,error:"",success:"",nammaspotId:""});
  const [showPassword,setShowPassword] = useState(false);
  const [step,setStep] = useState(1);

  const idValue = data.nammaspotId.toLowerCase().replace(/\s/g,"");
  const passwordChecks = {
    length: data.password.length >= 10,
    lower: /[a-z]/.test(data.password),
    upper: /[A-Z]/.test(data.password),
    number: /[0-9]/.test(data.password),
    symbol: /[^A-Za-z0-9]/.test(data.password),
    noSpace: !/\s/.test(data.password),
  };
  const validId = /^ns-[a-z0-9_-]{6,20}$/.test(idValue);
  const validPhone = data.phone.replace(/\D/g,"").length >= 10;
  const validWhatsapp = data.whatsapp.replace(/\D/g,"").length >= 10;
  const accountReady = validId && Object.values(passwordChecks).every(Boolean);
  const businessReady = Boolean(
    data.business.trim() &&
    data.owner.trim() &&
    validPhone &&
    validWhatsapp &&
    data.location.trim()
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!accountReady) {
      setStep(1);
      setState({loading:false,error:"Create a NammaSpot ID and a password that meets all the requirements shown below.",success:"",nammaspotId:""});
      return;
    }
    if (!businessReady) {
      setStep(2);
      setState({loading:false,error:"Complete all required business details: business name, your name, business phone, WhatsApp number and business location.",success:"",nammaspotId:""});
      return;
    }
    setState({loading:true,error:"",success:"",nammaspotId:""});
    try {
      const result = await startSellerRegistration(data);
      const seller = await getMySeller();
      await signOut();
      const assignedId = seller?.nammaspot_id || result.nammaspotId;
      setState({loading:false,error:"",success:"Your seller account has been created and sent for admin approval.",nammaspotId:assignedId});
    } catch (error) {
      setState({loading:false,error:friendlyError(error),success:"",nammaspotId:""});
    }
  };

  return (
    <main className="page form-page seller-signup-page">
      <button className="back-button" onClick={()=>go("/")}><ArrowLeft size={17}/> Home</button>
      <div className="page-title">
        <div className="eyebrow">BECOME A NAMMASPOT SELLER</div>
        <h1>Create your seller account</h1>
        <p className="signup-intro">Create your login first, add your business details, then build your NammaSpot catalogue. No email or OTP is required.</p>
      </div>

      <div className="signup-how-it-works" aria-label="How seller signup works">
        <div className="signup-step"><span>1</span><div><strong>Create your login</strong><small>Choose your NammaSpot ID and password</small></div></div>
        <ChevronRight size={18} aria-hidden="true"/>
        <div className="signup-step"><span>2</span><div><strong>Add your business</strong><small>Tell customers what you offer</small></div></div>
        <ChevronRight size={18} aria-hidden="true"/>
        <div className="signup-step"><span>3</span><div><strong>Get approved</strong><small>Admin reviews before you go public</small></div></div>
      </div>

      <div className="signup-before-card">
        <ShieldCheck size={20}/>
        <div><strong>What you need</strong><ul><li>A business name</li><li>A NammaSpot ID you will remember</li><li>A strong password</li><li>Your name, business phone, WhatsApp number and business location</li></ul><span>You can add your products, images, location and daily update from your seller dashboard.</span></div>
      </div>

      {state.success ? (
        <section className="seller-form signup-success-card">
          <CheckCircle size={34}/>
          <h2>Account created</h2>
          <p role="status" aria-live="polite">{state.success}</p>
          <div className="created-id"><span>Your NammaSpot ID</span><strong>{String(state.nammaspotId || "").toLowerCase()}</strong></div>
          <p className="muted-note">Save this ID. You will use it with your password every time you sign in. Your ID is shown in lowercase here; use the same ID when you log in.</p>
          <div className="button-row"><button className="primary-button" onClick={()=>go("/login")}><LogIn size={17}/> Go to seller login</button><button className="secondary-button" onClick={()=>go("/")}><Home size={17}/> Back to home</button></div>
        </section>
      ) : (
        <form className="seller-form signup-form" onSubmit={submit} noValidate>
          <div className="signup-progress" aria-label={`Step ${step} of 2`}><span className={step>=1?"active":""}>1 Account</span><span className={step>=2?"active":""}>2 Business</span></div>

          {step===1 && <section className="signup-section">
            <div className="signup-section-heading"><span className="signup-number">1</span><div><h2>Create your login</h2><p>This is how you will access your seller dashboard later.</p></div></div>
            <label>Choose your NammaSpot ID <span className="required">*</span>
              <input value={data.nammaspotId} onChange={e=>setData({...data,nammaspotId:e.target.value.toLowerCase().replace(/\s/g,"")})} placeholder="Example: ns-000001" maxLength={40} autoCapitalize="none" spellCheck="false" required aria-describedby="id-help"/>
              <small id="id-help">Your NammaSpot ID is your username for login. Use ns- followed by 6–20 lowercase letters, numbers, _ or -.</small>
            </label>
            <div className={idValue && !/^NS-[A-Z0-9_-]{6,20}$/.test(idValue) ? "field-feedback error":"field-feedback"}>{idValue ? (validId ? "✓ This ID format is ready to use" : "Use ns- followed by 6–20 lowercase letters, numbers, _ or -") : "Example: NS-000001"}</div>

            <label>Create your password <span className="required">*</span>
              <div className="password-input-wrap"><input type={showPassword?"text":"password"} value={data.password} onChange={e=>setData({...data,password:e.target.value})} autoComplete="new-password" spellCheck="false" autoCapitalize="off" aria-describedby="password-help" required/><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
              <small id="password-help">Use a password you can remember. Do not use your business name or NammaSpot ID.</small>
            </label>
            <div className="password-requirements" aria-live="polite">
              <span className={passwordChecks.length?"pass":""}>✓ At least 10 characters</span>
              <span className={passwordChecks.upper?"pass":""}>✓ One uppercase letter</span>
              <span className={passwordChecks.lower?"pass":""}>✓ One lowercase letter</span>
              <span className={passwordChecks.number?"pass":""}>✓ One number</span>
              <span className={passwordChecks.symbol?"pass":""}>✓ One symbol</span>
              <span className={passwordChecks.noSpace?"pass":""}>✓ No spaces</span>
            </div>

            <div className="signup-explanation"><strong>Important:</strong> You will log in later using only <b>NammaSpot ID + password</b>. There is no email or OTP in this seller signup.</div>
            <button type="button" className="primary-button full-button" onClick={()=>{if(!accountReady){setState(s=>({...s,error:"Complete the NammaSpot ID and password requirements above."}));return;}setState(s=>({...s,error:""}));setStep(2);}}>Continue to business details <ChevronRight size={18}/></button>
          </section>}

          {step===2 && <section className="signup-section">
            <div className="signup-section-heading"><span className="signup-number">2</span><div><h2>Tell us about your business</h2><p>These required details help NammaSpot verify your business before approval. You can complete your NammaSpot catalogue after approval.</p></div></div>
            <div className="required-details-note"><CheckCircle size={17}/><span><strong>Required before approval:</strong> business name, your name, business phone, WhatsApp number and business location.</span></div>
            <label>Business name <span className="required">*</span>
              <input value={data.business} onChange={e=>setData({...data,business:e.target.value})} maxLength={160} autoComplete="organization" required/>
              <small>This is the name customers will see on your NammaSpot seller profile.</small>
            </label>
            <div className="form-grid">
              <label>Your name <span className="required">*</span><input value={data.owner} onChange={e=>setData({...data,owner:e.target.value})} maxLength={120} autoComplete="name" required/><small>The name of the owner or main business contact.</small></label>
              <label>Business phone <span className="required">*</span><input type="tel" value={data.phone} onChange={e=>setData({...data,phone:e.target.value})} autoComplete="tel" inputMode="tel" maxLength={20} required aria-describedby="phone-help"/><small id="phone-help">Enter a reachable 10-digit Indian mobile/phone number.</small>{data.phone && !validPhone && <span className="field-feedback error">Enter at least 10 digits.</span>}</label>
              <label>WhatsApp number <span className="required">*</span><input type="tel" value={data.whatsapp} onChange={e=>setData({...data,whatsapp:e.target.value})} autoComplete="tel" inputMode="tel" maxLength={20} required aria-describedby="whatsapp-help"/><small id="whatsapp-help">Use the number customers should message on WhatsApp.</small>{data.whatsapp && !validWhatsapp && <span className="field-feedback error">Enter at least 10 digits.</span>}</label>
              <label>Business category <span className="optional">(recommended)</span><select value={data.category} onChange={e=>setData({...data,category:e.target.value})}>{categoryNames.map(c=><option key={c}>{c}</option>)}</select><small>Choose the category that best describes your business.</small></label>
              <label>Business location <span className="required">*</span><input value={data.location} onChange={e=>setData({...data,location:e.target.value})} placeholder="Example: RS Puram, Coimbatore" autoComplete="street-address" maxLength={240} required/><small>Area, town or city where customers can find you.</small></label>
            </div>
            <details className="signup-more-details"><summary>Add more business details now <span>optional</span></summary><div className="form-grid">
              <label>Google Maps / location URL<input type="url" value={data.locationUrl} onChange={e=>setData({...data,locationUrl:e.target.value})} placeholder="Paste a Google Maps share link"/></label>
              <label>Instagram URL<input type="url" value={data.instagram} onChange={e=>setData({...data,instagram:e.target.value})} placeholder="https://instagram.com/…"/></label>
            </div><label>Short business description<textarea value={data.description} onChange={e=>setData({...data,description:e.target.value})} maxLength={300} placeholder="What do you sell or offer?"/></label></details>

            <div className="signup-approval-card"><ShieldCheck size={18}/><div><strong>What happens after you submit?</strong><ol><li>Your account is created.</li><li>Your seller profile stays hidden while it is <b>pending approval</b>.</li><li>After NammaSpot admin approval, your NammaSpot seller profile can go public.</li></ol></div></div>

            {state.error && <div className="inline-error" role="alert"><AlertCircle size={17}/>{state.error}</div>}
            <div className="button-row signup-actions"><button type="button" className="secondary-button" onClick={()=>setStep(1)}><ArrowLeft size={17}/> Back</button><button className="primary-button" disabled={state.loading||!businessReady}>{state.loading ? "Creating your seller account…" : <><Plus size={18}/> Create seller account</>}</button></div>
            <p className="signup-footer-note">Please enter accurate business information. These details are reviewed by the NammaSpot admin before your seller profile is approved and made public.</p>
          </section>}
        </form>
      )}
    </main>
  );
}
function LoginPage({ go, onSignedIn }) {
  const [data,setData] = useState({nammaspotId:"",password:""});
  const [state,setState] = useState({loading:false,error:""});

  const submit = async (event) => {
    event.preventDefault();
    setState({loading:true,error:""});
    try {
      await signInSeller(data.nammaspotId, data.password);
      const profile = await getCurrentProfile();
      if (!profile || profile.role !== "seller") throw new Error("Seller profile not found.");
      const seller = await getMySeller();
      if (seller?.verification_status !== "approved") {
        await signOut();
        throw new Error("Your seller account is pending admin approval.");
      }
      onSignedIn(profile);
      go("/dashboard");
    } catch (error) {
      setState({loading:false,error:friendlyError(error)});
    }
  };

  return (
    <main className="page form-page narrow">
      <button className="back-button" onClick={()=>go("/")}><ArrowLeft size={17}/> Home</button>
      <div className="page-title">
        <div className="eyebrow">SELLER ACCESS</div>
        <h1>Welcome back.</h1>
        <p>One ID. One password. No email or OTP needed.</p>
      </div>
      <form className="seller-form" onSubmit={submit}>
        <div className="login-identity-card">
          <Store size={20}/>
          <div><strong>NammaSpot seller login</strong><span>Use the NammaSpot ID you created during signup.</span></div>
        </div>
        <label>NammaSpot ID<input value={data.nammaspotId} onChange={(e)=>setData({...data,nammaspotId:e.target.value.toLowerCase().replace(/\s/g,"")})} placeholder="ns-000001" autoCapitalize="none" required/></label>
        <label>Password<input type="password" autoComplete="current-password" value={data.password} onChange={(e)=>setData({...data,password:e.target.value})} placeholder="Your password" required/></label>
        {state.error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{state.error}</div>}
        <button className="primary-button full-button" disabled={state.loading}>{state.loading ? "Signing in…" : <><LogIn size={17}/> Sign in</>}</button>
        <button type="button" className="secondary-button full-button" onClick={()=>go("/register")}>Create seller account</button>
        <p className="login-help">Forgot your password? For this free MVP, contact the NammaSpot admin for account recovery.</p>
      </form>
    </main>
  );
}

function DashboardPage({ go }) {
  const [seller,setSeller] = useState(null);
  const [products,setProducts] = useState([]);
  const [enquiries,setEnquiries] = useState([]);
  const [categories,setCategories] = useState([]);
  const [tab,setTab] = useState("products");
  const [state,setState] = useState({loading:true,error:""});
  const [storageUsage,setStorageUsage] = useState(null);

  const load = async () => {
    try {
      const profile = await getCurrentProfile();
      if (!profile || profile.role !== "seller") { go("/login"); return; }
      const [mySeller,cats] = await Promise.all([getMySeller(),getCategories()]);
      if (!mySeller) throw new Error("Seller profile not found.");
      const [myProducts,myEnquiries] = await Promise.all([listMyProducts(mySeller.id),getMyEnquiries(mySeller.id)]);
      setSeller(mySeller);
      setProducts(myProducts);
      setEnquiries(myEnquiries);
      setCategories(cats);
      try { setStorageUsage(await getSellerStorageUsage()); } catch {}
      setState({loading:false,error:""});
    } catch (error) {
      setState({loading:false,error:friendlyError(error)});
    }
  };

  useEffect(()=>{load(); const timer=window.setInterval(load,300000); return ()=>window.clearInterval(timer);},[]);

  if (state.loading) return <main className="page"><div className="page-title"><div className="eyebrow">SELLER DASHBOARD</div><h1>Loading your spot…</h1></div><CardSkeletonRow detailed/></main>;
  if (state.error) return <main className="page"><ErrorState message={state.error} retry={load}/></main>;

  return (
    <main className="page dashboard-page">
      <div className="dashboard-head">
        <div><div className="eyebrow">SELLER DASHBOARD</div><h1>Your spot, your catalogue.</h1><p>{seller.verification_status === "approved" ? "Your public page is live." : "Your profile is " + seller.verification_status + "."}</p></div>
        <span className={"status-pill status-"+seller.verification_status}>{seller.verification_status}</span>
      </div>

      <div className="dashboard-tabs">
        {["profile","products","enquiries","public"].map((item)=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item==="public"?"Public profile":item.charAt(0).toUpperCase()+item.slice(1)}</button>)}
      </div>

      {tab==="profile" && <ProfileEditor seller={seller} categories={categories} onSaved={(next)=>setSeller((current)=>({...current,...next}))}/>}
      {tab==="products" && <ProductManager seller={seller} products={products} categories={categories} storageUsage={storageUsage} onStorageUsageChange={setStorageUsage} onChange={setProducts}/>}
      {tab==="enquiries" && <EnquiryManager enquiries={enquiries} onChange={setEnquiries}/>}
      {tab==="public" && <PublicTools seller={seller} go={go}/>}
    </main>
  );
}

function ProfileEditor({ seller,categories,onSaved }) {
  const [data,setData] = useState({
    business_name:seller.business_name, owner_name:seller.owner_name, category_id:seller.category_id || "",
    location:seller.location || "", location_url:seller.location_url || "", city:seller.city || "Chennai",
    description:seller.description || "", contact:seller.phone || "", whatsapp_phone:seller.whatsapp_phone || "",
    instagram_url:seller.instagram_url || "", opening_time:seller.opening_time || "", closing_time:seller.closing_time || "",
    profile_image_url:seller.profile_image_url || "", cover_image_url:seller.cover_image_url || ""
  });
  const [state,setState] = useState({saving:false,error:"",success:"",imageBusy:""});
  const [dailyUpdate,setDailyUpdate] = useState("");
  useEffect(() => {
    let alive = true;
    getMyMicrosite(seller.id).then((value) => {
      if (alive) setDailyUpdate(value?.settings?.tagline || "");
    }).catch(() => {});
    return () => { alive = false; };
  }, [seller.id]);
  const uploadImage = async (event, kind) => {
    const file=event.target.files?.[0];
    event.target.value="";
    if(!file) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setState(s=>({...s,error:"Unsupported image format. Use JPG, PNG or WebP."}));return;}
    if(file.size>10*1024*1024){setState(s=>({...s,error:"This image is over 10 MB. Please choose a smaller image."}));return;}
    setState(s=>({...s,error:"",imageBusy:kind}));
    try{
      const profile=await getCurrentProfile();
      const url=await uploadSellerMedia(file,profile.id);
      if(!url) throw new Error("Could not upload the image.");
      const next=await updateSellerImages(seller.id,kind==="profile"?{profile_image_url:url}:{cover_image_url:url});
      setData(d=>({...d,...next}));
      onSaved(next);
      setState(s=>({...s,imageBusy:"",success:kind==="profile"?"Logo/profile image updated.":"Cover image updated."}));
    }catch(error){setState(s=>({...s,imageBusy:"",error:friendlyError(error),success:""}));}
  };
  const save = async (event) => {
    event.preventDefault();
    setState({saving:true,error:"",success:"",imageBusy:""});
    try {
      const [next] = await Promise.all([
        updateMySeller(seller.id,data),
        saveMicrosite(seller.id,{tagline:dailyUpdate})
      ]);
      onSaved(next);
      setState({saving:false,error:"",success:"Profile saved.",imageBusy:""});
    } catch (error) {
      setState({saving:false,error:friendlyError(error),success:"",imageBusy:""});
    }
  };
  return (
    <form className="seller-form" onSubmit={save}>
      <div className="profile-media-grid">
        <div className="profile-media-card">
          <div className="profile-media-preview">{data.profile_image_url?<img src={data.profile_image_url} alt="Business logo" />:<Store size={34}/>}</div>
          <div><strong>Business logo / profile image</strong><small>Shown beside your business name on your public NammaSpot seller profile.</small></div>
          <label className="secondary-button upload-button">{state.imageBusy==="profile"?"Uploading…":"Upload logo"}<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>uploadImage(e,"profile")} hidden disabled={Boolean(state.imageBusy)}/></label>
        </div>
        <div className="profile-media-card profile-cover-card">
          <div className="profile-cover-preview">{data.cover_image_url?<img src={data.cover_image_url} alt="Business cover" />:<span>Cover image preview</span>}</div>
          <div><strong>NammaSpot profile cover image</strong><small>Shown at the top of your NammaSpot seller profile.</small></div>
          <label className="secondary-button upload-button">{state.imageBusy==="cover"?"Uploading…":"Upload cover"}<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>uploadImage(e,"cover")} hidden disabled={Boolean(state.imageBusy)}/></label>
        </div>
      </div>
      <div className="image-upload-note">JPG, PNG or WebP · selected file up to 10 MB · automatically optimized before storage.</div>
      <div className="form-grid">
        <label>Business name *<input value={data.business_name} onChange={(e)=>setData({...data,business_name:e.target.value})} required/></label>
        <label>Owner name *<input value={data.owner_name} onChange={(e)=>setData({...data,owner_name:e.target.value})} required/></label>
        <label>Category<select value={data.category_id} onChange={(e)=>setData({...data,category_id:e.target.value})}><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>City<input value={data.city} onChange={(e)=>setData({...data,city:e.target.value})}/></label>
        <label>Location<input value={data.location} onChange={(e)=>setData({...data,location:e.target.value})}/></label>
        <label>Location URL<input type="url" value={data.location_url} onChange={(e)=>setData({...data,location_url:e.target.value})}/></label>
        <label>Phone<input value={data.contact} onChange={(e)=>setData({...data,contact:e.target.value})}/></label>
        <label>WhatsApp<input value={data.whatsapp_phone} onChange={(e)=>setData({...data,whatsapp_phone:e.target.value})}/></label>
        <label>Instagram<input type="url" value={data.instagram_url} onChange={(e)=>setData({...data,instagram_url:e.target.value})}/></label>
      </div>
      <div className="profile-daily-update">
        <div className="profile-daily-update-copy">
          <div className="eyebrow">DAILY UPDATE</div>
          <strong>What should customers know today?</strong>
          <span>Type it naturally — for example, “Open from 10 AM · Visit us today.”</span>
        </div>
        <textarea
          value={dailyUpdate}
          onChange={(e)=>setDailyUpdate(e.target.value)}
          maxLength={180}
          rows={2}
          placeholder="We are open from 10 AM today · Visit us at Anna Nagar"
          aria-label="Daily update"
        />
      </div>
      <label>Description *<textarea value={data.description} onChange={(e)=>setData({...data,description:e.target.value})} maxLength={600} required/></label>
      {state.error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{state.error}</div>}
      {state.success && <div className="form-status" role="status" aria-live="polite"><CheckCircle size={18}/>{state.success}</div>}
      <button className="primary-button" disabled={state.saving||Boolean(state.imageBusy)}>{state.saving ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

function ProductManager({ seller, products, categories, storageUsage, onStorageUsageChange, onChange }) {
  const blank={product_name:"",description:"",price:"",availability:true,image_url:"",category_id:""};
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState(null);
  const [state,setState]=useState({loading:false,error:""});
  const [galleryBusy,setGalleryBusy]=useState(false);

  useEffect(() => {
    getSellerStorageUsage().then(onStorageUsageChange).catch(() => {});
  }, [onStorageUsageChange]);

  const submit=async(event)=>{
    event.preventDefault();
    if (Number(form.price)<0) { setState({loading:false,error:"Price cannot be negative."}); return; }
    setState({loading:true,error:""});
    try {
      const next=editing ? await updateProduct(editing,form) : await createProduct({...form,seller_id:seller.id});
      onChange(editing ? products.map((p)=>p.id===editing?next:p) : [next,...products]);
      setForm(blank); setEditing(null); setState({loading:false,error:""});
    } catch(error) {
      setState({loading:false,error:friendlyError(error)});
    }
  };

  const edit=(product)=>{
    setEditing(product.id);
    setForm({product_name:product.name,description:product.description,price:product.price,availability:product.available,image_url:product.image_url || "",category_id:product.category_id || ""});
  };

  const uploadGallery = async (event) => {
    const file=event.target.files?.[0];
    event.target.value="";
    if(!file || !editing) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setState({loading:false,error:"Unsupported image format. Use JPG, PNG or WebP."});return;}
    if(file.size>10*1024*1024){setState({loading:false,error:"This image is over 10 MB. Please choose a smaller image."});return;}
    setGalleryBusy(true); setState({loading:false,error:""});
    try{
      const session=await getCurrentProfile();
      const url=await uploadSellerMedia(file,session.id);
      const current=products.find(p=>p.id===editing);
      const order=(current?.images||[]).length;
      await addProductGalleryImage(editing,seller.id,url,order);
      const next=products.map(p=>p.id===editing?{...p,images:[...(p.images||[]),{id:"new-"+Date.now(),image_url:url,sort_order:order}]}:p);
      onChange(next);
      try{onStorageUsageChange(await getSellerStorageUsage());}catch{}
    }catch(error){setState({loading:false,error:friendlyError(error)});}
    finally{setGalleryBusy(false);}
  };
  const removeGallery = async (image) => {
    if(!window.confirm("Remove this catalogue image?")) return;
    try{
      await deleteProductGalleryImage(image.id);
      const next=products.map(p=>p.id===editing?{...p,images:(p.images||[]).filter(x=>x.id!==image.id)}:p);
      onChange(next);
    }catch(error){setState({loading:false,error:friendlyError(error)});}
  };

  const remove=async(id)=>{
    if (!window.confirm("Delete this product?")) return;
    setState({loading:true,error:""});
    try { await deleteProduct(id); onChange(products.filter((p)=>p.id!==id)); setState({loading:false,error:""}); }
    catch(error){setState({loading:false,error:friendlyError(error)});}
  };

  const upload = async (event) => {
    const file=event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { setState({loading:false,error:"Unsupported image format. Use JPG, PNG or WebP."}); return; }
    if (file.size > 10*1024*1024) { setState({loading:false,error:"This image is over 10 MB. Please choose a smaller image."}); return; }
    try {
      const session = await getCurrentProfile();
      const url = await uploadSellerMedia(file, session.id);
      if (url) {
        setForm((current)=>({...current,image_url:url}));
        try { onStorageUsageChange(await getSellerStorageUsage()); } catch {}
        setState({loading:false,error:""});
      }
    } catch (error) {
      setState({loading:false,error:friendlyError(error)});
    }
  };

  return (
    <div className="dashboard-content">
      <form className="seller-form compact-form" onSubmit={submit}>
        <div className="product-manager-head"><div><div className="eyebrow">{editing ? "EDIT CATALOGUE ITEM" : "ADD TO CATALOGUE"}</div><h2>{editing ? "Update this product" : "Add a product"}</h2><p className="muted-note">{seller.verification_status === "pending" ? "You can prepare your catalogue now. It will become public after admin approval." : "Add the product name, price and image. Save it once and it will appear in your catalogue."}</p></div><span className="status-pill status-approved">{products.length} item{products.length===1?"":"s"}</span></div>
        {storageUsage && <div className={"storage-usage-card storage-" + storageUsage.status}>
          <div className="storage-usage-head"><strong>Image storage</strong><span>{formatBytes(storageUsage.used_bytes)} / {SELLER_STORAGE_QUOTA_LABEL}</span></div>
          <div className="storage-usage-track" role="progressbar" aria-valuenow={Math.min(100, Number(storageUsage.used_percent) || 0)} aria-valuemin="0" aria-valuemax="100"><span style={{width: Math.min(100, Number(storageUsage.used_percent) || 0) + "%"}} /></div>
          <small>{storageUsage.status === "blocked" ? "Storage is full. Delete an old image before uploading another." : storageUsage.status === "warning" ? "You have used more than " + SELLER_STORAGE_WARNING_LABEL + ". Consider deleting unused images." : "Each stored image is compressed to " + MAX_SELLER_IMAGE_LABEL + " or less. Supported: JPG, PNG, WebP."}</small>
        </div>}
        <div className="form-grid">
          <label>Product name *<input value={form.product_name} onChange={(e)=>setForm({...form,product_name:e.target.value})} maxLength={160} required/></label>
          <label>Price ₹ *<input type="number" min="0" step="0.01" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} required/></label>
          <label>Category<select value={form.category_id} onChange={(e)=>setForm({...form,category_id:e.target.value})}><option value="">Optional</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Image URL<input type="url" value={form.image_url} onChange={(e)=>setForm({...form,image_url:e.target.value})} placeholder="https://…"/></label>
          <label>Upload primary image<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={upload}/><small className="field-help">This is the main catalogue image. JPG, PNG or WebP · selected file up to 10 MB · stored at 500 KB or less.</small></label>
        </div>
        <label>Description<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} maxLength={1000}/></label>
        <label className="check-row"><input type="checkbox" checked={form.availability} onChange={(e)=>setForm({...form,availability:e.target.checked})}/> Available</label>
        {editing && <div className="catalogue-gallery-editor">
          <div><strong>More catalogue images</strong><small>Add extra photos for this product. Customers can view these additional images on your public NammaSpot catalogue.</small></div>
          <div className="catalogue-gallery-grid">{(products.find(p=>p.id===editing)?.images||[]).map(img=><div className="catalogue-gallery-thumb" key={img.id}><img src={img.image_url} alt="" /><button type="button" className="danger-button" onClick={()=>removeGallery(img)} aria-label="Remove catalogue image"><Trash2 size={14}/></button></div>)}
            <label className="catalogue-upload-tile">{galleryBusy?"Uploading…":"＋ Add image"}<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={uploadGallery} hidden disabled={galleryBusy}/></label>
          </div>
        </div>}
        {state.error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{state.error}</div>}
        <div className="button-row"><button className="primary-button" type="submit" disabled={state.loading}>{state.loading ? "Saving…" : editing ? "Update product" : "Add product"}</button>{editing&&<button type="button" className="secondary-button" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}</div>
      </form>
      <div className="dashboard-list">
        {products.length ? products.map((product)=>
          <article className="dashboard-item" key={product.id}>
            <div className="dashboard-product-row">{product.image_url?<img className="dashboard-product-thumb" src={product.image_url} alt="" />:<div className="dashboard-product-thumb placeholder-thumb"><Store size={20}/></div>}<div><strong>{product.name}</strong><p>₹{product.price} · {product.available?"Available":"Unavailable"} · {(product.images||[]).length+ (product.image_url?1:0)} image{((product.images||[]).length+ (product.image_url?1:0))===1?"":"s"}</p><small>{product.description}</small></div></div>
            <div className="button-row"><button className="secondary-button" onClick={()=>edit(product)}><Pencil size={15}/> Edit</button><button className="danger-button" onClick={()=>remove(product.id)}><Trash2 size={15}/> Delete</button></div>
          </article>
        ) : <Empty title="No products added" text="Add your first product to publish your catalogue."/>}
      </div>
    </div>
  );
}

function EnquiryManager({ enquiries,onChange }) {
  const update=async(id,status)=>{
    try { await updateEnquiryStatus(id,status); onChange(enquiries.map((item)=>item.id===id?{...item,status}:item)); }
    catch { /* keep the existing state if the network call fails */ }
  };
  return (
    <div className="dashboard-list">
      {enquiries.length ? enquiries.map((item)=>
        <article className="dashboard-item" key={item.id}>
          <div><strong>{item.customer_name} · {item.product?.product_name || "General enquiry"}</strong><p>{item.customer_contact}</p><small>{item.message}</small></div>
          <select value={item.status} onChange={(event)=>update(item.id,event.target.value)}><option value="pending">Pending</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select>
        </article>
      ) : <Empty title="No enquiries yet" text="Customer enquiries will appear here."/>}
    </div>
  );
}

function PublicTools({ seller, go }) {
  const publicUrl=location.origin+"/s/"+seller.slug;
  const copy=async()=>{try{await navigator.clipboard.writeText(publicUrl);alert("Seller link copied.");}catch{alert(publicUrl);}};
  return (
    <div className="public-tools">
      <div className="qr-card">
        <div className="eyebrow">YOUR QR</div>
        <h2>Offline → online.</h2>
        <p>Print this QR or share it with customers. It opens the seller page.</p>
        <div className="qr-wrap"><Suspense fallback={<span className="muted">Preparing QR code…</span>}><QRCodeSVG value={publicUrl} size={190} includeMargin/></Suspense></div>
        <code>{publicUrl}</code>
        <div className="button-row">
          <button className="primary-button" onClick={copy}>Copy link</button>
          <a className="secondary-button" href={publicUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open page</a>
        </div>
      </div>
      <div className="seller-form">
        <div className="eyebrow">SHARE YOUR SPOT</div>
        <h2>{seller.name}</h2>
        <p>Your public page can be shared through QR, NFC, Instagram or WhatsApp.</p>
        <button className="primary-button" onClick={()=>go("/s/"+seller.slug)}><ExternalLink size={16}/> Preview seller page</button>
        <p className="muted-note">NFC is optional: point the tag to the same URL.</p>
      </div>
    </div>
  );
}

function AdminLoginPage({ go, onSignedIn }) {
  const [data,setData] = useState({email:"",password:""});
  const [state,setState] = useState({loading:false,error:""});

  const submit = async (event) => {
    event.preventDefault();
    setState({loading:true,error:""});
    try {
      await signInAdmin(data.email, data.password);
      const profile = await getCurrentProfile();
      const allowed = await isCurrentUserAdmin();
      if (!allowed || profile?.role !== "admin") {
        await signOut();
        throw new Error("This account is not an authorized NammaSpot admin.");
      }
      onSignedIn(profile);
      go("/nammaspot-control-panel/dashboard");
    } catch (error) {
      setState({loading:false,error:friendlyError(error)});
    }
  };

  return (
    <main className="page form-page narrow">
      <button className="back-button" onClick={()=>go("/")}><ArrowLeft size={17}/> Home</button>
      <div className="page-title">
        <div className="eyebrow">PRIVATE CONTROL PANEL</div>
        <h1>NammaSpot admin.</h1>
        <p>Authorized administrators only. This portal is not linked from the public website.</p>
      </div>
      <form className="seller-form" onSubmit={submit}>
        <label>Admin email<input type="email" autoComplete="username" value={data.email} onChange={(e)=>setData({...data,email:e.target.value})} placeholder="Admin email" required/></label>
        <label>Password<input type="password" autoComplete="current-password" value={data.password} onChange={(e)=>setData({...data,password:e.target.value})} placeholder="Admin password" required/></label>
        {state.error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{state.error}</div>}
        <button className="primary-button full-button" disabled={state.loading}>{state.loading ? "Signing in…" : <><ShieldCheck size={17}/> Enter control panel</>}</button>
        <button type="button" className="secondary-button full-button" onClick={()=>go("/")}>Back to NammaSpot</button>
      </form>
    </main>
  );
}

function AdminPage() {
  const [allowed,setAllowed]=useState(null);
  const [adminProfile,setAdminProfile]=useState(null);
  const [sellers,setSellers]=useState([]);
  const [categories,setCategories]=useState([]);
  const [tab,setTab]=useState("sellers");
  const [statusFilter,setStatusFilter]=useState("all");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [storageUsage,setStorageUsage]=useState(null);
  const [otpAlerts,setOtpAlerts]=useState([]);

  const load=async()=>{
    setLoading(true);
    setError("");
    try {
      const [ok,current] = await Promise.all([isCurrentUserAdmin(), getCurrentProfile()]);
      if (!ok) { setAllowed(false); setError("This account is not an approved NammaSpot admin."); return; }
      const [s,c,u,otp]=await Promise.all([adminListSellers(),adminListCategories(),adminStorageUsage(),adminOtpUsageAlerts()]);
      setAllowed(true);
      setAdminProfile(current);
      setSellers(s);
      setCategories(c);
      setStorageUsage(u);
      setOtpAlerts(otp);
      if (u && u.status !== "ok") {
        const key = "nammaspot-storage-alert-" + u.status;
        if (!window.sessionStorage.getItem(key)) {
          window.sessionStorage.setItem(key, "1");
          window.setTimeout(() => window.alert(
            u.status === "blocked"
              ? "NammaSpot storage safety cutoff reached. New image uploads are paused."
              : "NammaSpot storage warning: " + u.used_percent + "% of the 1 GB safety quota is used."
          ), 0);
        }
      }
    } catch(error) {
      setAllowed(false);
      setError(friendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{load(); const timer=window.setInterval(load,300000); return ()=>window.clearInterval(timer);},[]);

  const status=async(id,next)=>{
    setBusy(true);
    setError("");
    try {
      await adminUpdateSellerStatus(id,next);
      await load();
    } catch(error){setError(friendlyError(error));}
    finally{setBusy(false);}
  };

  const permanentlyDelete=async(seller)=>{
    if (seller.verification_status !== "suspended") return;
    const confirmed=window.confirm(
      "Permanently delete " + seller.business_name + "? This removes the seller account, products, enquiries, favourites, profile data, uploaded media and login account. This cannot be undone."
    );
    if (!confirmed) return;
    setBusy(true);
    setError("");
    try {
      await adminDeleteSuspendedSeller(seller.id);
      await load();
    } catch(error){setError(friendlyError(error));}
    finally{setBusy(false);}
  };

  const addCategory=async()=>{
    const name=window.prompt("Category name");
    if(!name) return;
    try { await adminAddCategory(name); setCategories(await adminListCategories()); } catch(error){setError(friendlyError(error));}
  };

  const renameCategory=async(item)=>{
    const name=window.prompt("New category name",item.name);
    if(!name || name===item.name) return;
    try { await adminRenameCategory(item.id,name); setCategories(await adminListCategories()); } catch(error){setError(friendlyError(error));}
  };

  const removeCategory=async(item)=>{
    if(!window.confirm("Delete category " + item.name + "?")) return;
    try { await adminDeleteCategory(item.id); setCategories(await adminListCategories()); } catch(error){setError(friendlyError(error));}
  };

  const counts = sellers.reduce((acc,item) => {
    const value = item.verification_status || "pending";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const visibleSellers = statusFilter === "all"
    ? sellers
    : sellers.filter((item) => (item.verification_status || "pending") === statusFilter);

  if (loading && allowed === null) return <main className="page"><div className="page-title"><div className="eyebrow">ADMIN</div><h1>Loading moderation…</h1></div><CardSkeletonRow detailed/></main>;
  if (!allowed) return <main className="page"><ErrorState message={error || "Admin access is restricted."} retry={load}/></main>;

  return (
    <main className="page admin-page admin-console-page">
      <div className="admin-console-shell">
        <aside className="admin-console-sidebar" aria-label="Admin console navigation">
          <div className="admin-console-brand"><ShieldCheck size={22}/><div><strong>NammaSpot</strong><span>Admin Console</span></div></div>
          <div className="admin-console-nav">
            <button className={tab==="sellers"?"active":""} onClick={()=>setTab("sellers")}><Store size={17}/> Seller approvals</button>
            <button className={tab==="categories"?"active":""} onClick={()=>setTab("categories")}><Grid2X2 size={17}/> Categories</button>
          </div>
          <div className="admin-console-sidebar-bottom">
            <button onClick={load} disabled={loading}>↻ Refresh data</button>
            <button onClick={()=>{signOut().then(()=>location.href="/");}}><LogOut size={16}/> Sign out</button>
          </div>
        </aside>
        <section className="admin-console-content">
      <div className="dashboard-head">
        <div>
          <div className="eyebrow">ADMIN</div>
          <h1>Keep NammaSpot trustworthy.</h1>
          <p>Approve sellers and manage platform categories.</p>
          {adminProfile?.email && <small>Signed in as {adminProfile.email}</small>}
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={load} disabled={loading}>↻ {loading ? "Refreshing…" : "Refresh"}</button>
          <ShieldCheck size={34} color="#7e2424"/>
        </div>
      </div>

      {error && <div className="inline-error" role="alert" aria-live="assertive"><AlertCircle size={17}/>{error}</div>}

      {otpAlerts.length > 0 && (
        <div className="dashboard-item" role="alert" aria-live="polite">
          <div>
            <div className="eyebrow">OTP USAGE ALERT</div>
            <strong>Email OTP usage crossed 20 requests in an hour.</strong>
            <p>The latest warning recorded {otpAlerts[0].sms_count} email OTP requests in the current hourly window. Check email activity before usage grows further.</p>
          </div>
          <span className="status-pill status-warning">20+ EMAILS</span>
        </div>
      )}

      {storageUsage && (
        <div className="dashboard-item" role="status" aria-live="polite">
          <div>
            <div className="eyebrow">STORAGE SAFETY</div>
            <strong>{storageUsage.used_percent}% of 1 GB used</strong>
            <p>
              {storageUsage.status === "ok" && "Everything is within the safe range."}
              {storageUsage.status === "warning" && "Warning: storage has crossed 80%. Review unused images soon."}
              {storageUsage.status === "critical" && "Critical: storage has crossed 90%. New uploads will be blocked at the safety cutoff."}
              {storageUsage.status === "blocked" && "Safety cutoff reached. New image uploads are paused to protect the Free-plan quota."}
            </p>
          </div>
          <span className={"status-pill status-" + storageUsage.status}>{storageUsage.status}</span>
        </div>
      )}

      {tab==="sellers" &&
        <>
          <div className="category-row" aria-label="Seller status filters">
            {[
              ["all","All",sellers.length],
              ["pending","Pending",counts.pending || 0],
              ["approved","Approved",counts.approved || 0],
              ["rejected","Rejected",counts.rejected || 0],
              ["suspended","Suspended",counts.suspended || 0],
            ].map(([value,label,count]) => (
              <button key={value} className={statusFilter===value ? "active" : ""} onClick={()=>setStatusFilter(value)}>
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="dashboard-list">
            {loading ? <CardSkeletonRow detailed/> :
              visibleSellers.length ? visibleSellers.map((seller)=>
                <article className="dashboard-item" key={seller.id}>
                  <div>
                    <strong>{seller.business_name}</strong>
                    <p><b>Owner:</b> {seller.owner_name || "Not provided"}</p>
                    <p><b>Business phone:</b> {seller.contact || "Not provided"}</p>
                    <p><b>WhatsApp:</b> {seller.whatsapp_phone || seller.contact || "Not provided"}</p>
                    <p><b>Location:</b> {seller.location || "Not provided"}</p>
                    <small>{seller.category?.name || "Uncategorised"} · {seller.verification_status || "pending"}</small>
                  </div>
                  <div className="button-row">
                    {seller.verification_status !== "approved" && <button disabled={busy} className="primary-button" onClick={()=>status(seller.id,"approved")}>approve</button>}
                    {seller.verification_status !== "rejected" && <button disabled={busy} className="secondary-button" onClick={()=>status(seller.id,"rejected")}>reject</button>}
                    {seller.verification_status !== "suspended" && <button disabled={busy} className="secondary-button" onClick={()=>status(seller.id,"suspended")}>suspend</button>}
                    {seller.verification_status === "suspended" && <button disabled={busy} className="danger-button" onClick={()=>permanentlyDelete(seller)}><Trash2 size={15}/> Delete permanently</button>}
                  </div>
                </article>
              ) : <Empty
                title={statusFilter === "all" ? "No sellers found" : "No " + statusFilter + " sellers"}
                text={statusFilter === "all"
                  ? "The admin query returned zero seller rows. Use Refresh and check the signed-in admin account."
                  : "There are no sellers in this status right now."}
              />}
          </div>
        </>}

      {tab==="categories" &&
        <div className="dashboard-list">
          <button className="primary-button" onClick={addCategory}><Plus size={16}/> Add category</button>
          {categories.map((item)=>
            <article className="dashboard-item" key={item.id}><strong>{item.name}</strong><div className="button-row"><button className="secondary-button" onClick={()=>renameCategory(item)}><Pencil size={15}/> Rename</button><button className="danger-button" onClick={()=>removeCategory(item)}><Trash2 size={15}/> Delete</button></div></article>
          )}
        </div>}
        </section>
      </div>
    </main>
  );
}
function CardSkeletonRow({ detailed=false }) {
  return <div className={detailed ? "seller-list" : "seller-preview-grid"}>{[1,2,3].map((item)=><div className="skeleton-card" key={item}><div className="skeleton-cover"/><div className="skeleton-body"><span/><span/><span/></div></div>)}</div>;
}

function ErrorState({ message,retry }) {
  return <div className="error-state"><AlertCircle size={28}/><h2>Something went wrong.</h2><p>{message}</p>{retry&&<button className="secondary-button" onClick={retry}>Try again</button>}</div>;
}

function Empty({ title,text,actionLabel,onAction }) {
  return <div className="empty-state"><Heart size={27}/><h2>{title}</h2><p>{text}</p>{actionLabel&&<button className="secondary-button" onClick={onAction}>{actionLabel}</button>}</div>;
}

function MobileBottomNav({ path,go }) {
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
    <button className={path==="/"?"active":""} onClick={()=>go("/")}><Home size={22}/><span>Home</span></button>
    <button className={path.startsWith("/explore")?"active":""} onClick={()=>go("/explore")}><Compass size={22}/><span>Explore</span></button>
    <button className={path.startsWith("/saved")?"active":""} onClick={()=>go("/saved")}><Heart size={22}/><span>Saved</span></button>
    <button className={path.startsWith("/explore?near")?"active":""} onClick={()=>go("/explore?near=Chennai")}><MapPin size={22}/><span>Near me</span></button>
    <button className={path.startsWith("/featured")?"active":""} onClick={()=>go("/featured")}><Sparkles size={22}/><span>Featured</span></button>
  </nav>;
}

async function shareSeller(seller) {
  const url=location.origin+"/s/"+seller.slug;
  try {
    if (navigator.share) await navigator.share({title:seller.name,text:"Discover this local seller on NammaSpot",url});
    else { await navigator.clipboard.writeText(url); alert("Seller link copied."); }
  } catch {}
}

function setMeta(name,content) {
  let element=document.querySelector('meta[name="' + name + '"]');
  if (!element) { element=document.createElement("meta"); element.setAttribute("name",name); document.head.appendChild(element); }
  element.setAttribute("content",content);
}

function setPropertyMeta(property,content) {
  let element=document.querySelector('meta[property="' + property + '"]');
  if (!element) { element=document.createElement("meta"); element.setAttribute("property",property); document.head.appendChild(element); }
  element.setAttribute("content",content);
}

function setCanonical(url) {
  let link=document.querySelector('link[rel="canonical"]');
  if (!link) { link=document.createElement("link"); link.setAttribute("rel","canonical"); document.head.appendChild(link); }
  link.setAttribute("href",url);
}

function friendlyError(error) {
  if (error instanceof BackendNotConfiguredError) return "This feature needs the production backend to be connected.";
  const code = String(error?.code || error?.error_code || "").toLowerCase();
  const message = String(error?.message || error?.error_description || "").trim();
  const lower = message.toLowerCase();

  if (code === "23505") return "That value is already in use. Please try another one.";
  if (code === "over_sms_send_rate_limit" || lower.includes("sms send rate limit")) return "Too many OTP requests. Please wait a minute and try again.";
  if (code === "over_request_rate_limit") return "Too many requests. Please wait a few minutes and try again.";
  if (code === "phone_provider_disabled") return "Phone OTP is not enabled in the production backend.";
  if (code === "sms_send_failed") return "The SMS provider could not send the OTP. Please try again shortly.";
  if (code === "phone_not_confirmed") return "This phone number is not confirmed. Please complete phone verification first.";
  if (code === "phone_exists" || code === "user_already_exists") return "That phone number is already registered. Use your NammaSpot ID to log in.";
  if (code === "otp_expired") return "That OTP has expired. Request a new OTP.";
  if (code === "invalid_otp" || code === "otp_invalid") return "The OTP is incorrect. Please check it and try again.";
  if (code === "validation_failed") return message || "Please check the details and try again.";
  if (code === "not_admin" || code === "unauthorized") return "You are not authorized to perform this action.";
  if (code === "email_not_confirmed" || lower.includes("email not confirmed")) return "Please confirm your email, then try signing in.";
  if (lower.includes("invalid login")) return "The login details are incorrect.";
  if (lower.includes("nammaspot id and phone number do not match")) return "NammaSpot ID and phone number do not match.";
  if (lower.includes("pending admin approval")) return "Your seller account is still pending admin approval.";
  if (lower.includes("suspended")) return "Your seller account is suspended.";
  if (message) return message.slice(0, 240);
  return "Something went wrong. Please try again.";
}

createRoot(document.getElementById("root")).render(<App/>);
