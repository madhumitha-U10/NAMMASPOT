import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
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
  startSellerRegistration,
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
  adminCleanupOrphanedMedia,
  adminStoragePlans,
  adminStorageSellers,
  adminStorageFiles,
  adminStorageEvents,
  adminStorageAudit,
  adminStoragePlanAudit,
  adminPlatformStorageSettings,
  adminAssignSellerStorage,
  adminUpdateStoragePlan,
  adminUpdatePlatformStorageSettings,
  adminOtpUsageAlerts,
  adminListReviews,
  adminUpdateReviewStatus,
  uploadSellerMedia,
  getSellerStorageUsage
} from "./lib/api";
import { categoryNames } from "./lib/seed";
import CategoryIcon from "./components/brand/CategoryIcon.jsx";
import { addProductGalleryImage, deleteProductGalleryImage, getMyMicrosite, saveMicrosite } from "./lib/microsite";
import { formatBytes } from "./lib/storage";

const popularCategories = ["Bakery", "Mehendi", "Crochet", "Makeup", "Art"];
const SAVED_PRODUCTS_KEY = "nammaspot-saved-products";
function readSavedProducts() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_PRODUCTS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function writeSavedProducts(items) {
  try {
    localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(items));
    window.dispatchEvent(new window.CustomEvent("nammaspot-saved-products-change"));
  } catch {}
}


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
      setNotice(error instanceof BackendNotConfiguredError ? "Saved on this device." : "Saved on this device; sync failed for now.");
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
      home: ["NammaSpot — Namma Ooru. Namma People. Namma Spot.", "Discover independent sellers, home businesses, crafts, food and makers across Chennai and Tamil Nadu."],
      explore: ["Explore Sellers · NammaSpot", "Explore independent businesses, products, makers and home sellers across Tamil Nadu."],
      categories: ["Shop by Category · NammaSpot", "Discover sellers by category on NammaSpot."],
      featured: ["Featured Sellers · NammaSpot", "Meet featured sellers and small businesses on NammaSpot."],
      saved: ["Saved Sellers · NammaSpot", "Your saved sellers on NammaSpot."],
      login: ["Seller Login · NammaSpot", "Sign in to manage your NammaSpot seller account."],
      register: ["Create Seller Account · NammaSpot", "Create a NammaSpot seller account and publish your business catalogue after approval."],
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
    <div className={"app-shell" + ((route === "admin-dashboard" || route === "admin-login") ? " admin-app-shell" : "")}>
      {!isSupabaseConfigured && (
        <div className="demo-bar">
          Preview mode · connect Supabase to activate seller accounts, enquiries, QR dashboard and admin moderation.
        </div>
      )}

      <header className="topbar">
        <button className="brand" onClick={() => go("/")} aria-label="NammaSpot home"><span className="brand-word">NammaSpot</span></button>

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
      {route === "seller" && <Suspense fallback={<main className="page" aria-live="polite">Loading seller catalogue…</main>}><SellerMicrositePage go={go} slug={getSellerSlug(path)} savedWebsites={saved} toggleSave={toggleSave}/></Suspense>}
      {route === "website-editor" && <Suspense fallback={<main className="page" aria-live="polite">Loading settings…</main>}><WebsiteEditorPage go={go}/></Suspense>}
      {route === "not-found" && <main className="page"><Empty title="Page not found" text="That NammaSpot page does not exist." actionLabel="Back home" onAction={() => go("/")}/></main>}

      <MobileBottomNav path={path} go={go} profile={profile}/>
      {route === "seller" && <div className="ns-catalogue-install-reminder" role="region" aria-label="Install NammaSpot app"><img src="/nammaspot-icon.svg" alt="" width="40" height="40"/><div><strong>Enjoying this catalogue?</strong><span>Add NammaSpot to your home screen for quick access to local shops.</span></div><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("nammaspot-open-install-prompt"))}>Install app</button></div>}
      <InstallNammaSpotPrompt visible={["home", "explore", "categories", "featured", "saved", "seller"].includes(route)}/>
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
  // Social apps (especially Instagram) append tracking query parameters to shared links.
  // A seller slug must come only from the URL pathname, never from "?utm_source=...".
  const pathname = String(path || "").split(/[?#]/, 1)[0];
  const rawSlug = pathname.split("/")[2] || "";
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
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
  const search = (type = "seller") => go(query.trim() ? "/explore?search=" + encodeURIComponent(query.trim()) + "&type=" + type : "/explore?type=" + type);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy-column">
            
            <h1>Namma Ooru.<br/>Namma People.<br/><em>Namma Spot.</em></h1>
            <p className="hero-copy">
              Discover thoughtful finds, handmade creations and talented independent sellers around you.
            </p>
            <div className="hero-search" role="search">
              <Search size={21} aria-hidden="true"/>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && search()}
                placeholder="Search cakes, crafts, mehendi…"
                aria-label="Search sellers and products"
              />
              <button className="hero-inline-search" onClick={() => search("seller")} aria-label="Search seller websites"><Search size={19}/><span>Search</span></button>
            </div>
            <div className="search-mode-choices home-search-modes" aria-label="Choose what to search"><button type="button" onClick={() => search("seller")}><Store size={15}/> Seller websites</button><button type="button" onClick={() => search("product")}><Search size={15}/> Products</button></div>
            <div className="hero-discovery">
              <span className="hero-discovery-label">Popular</span>
              <div className="quick-chips" aria-label="Popular categories">
                {popularCategories.map((category) => (
                  <button key={category} onClick={() => go("/explore?search=" + encodeURIComponent(category))}>{category}</button>
                ))}
              </div>
            </div>
            <div className="neighbourhood-chips" aria-label="Explore Chennai neighbourhoods">
              <span>EXPLORE BY AREA</span>
              {["Adyar", "T. Nagar", "Anna Nagar", "Mylapore", "Velachery", "OMR"].map((area) => (
                <button key={area} onClick={() => { setQuery(""); go("/explore?area=" + encodeURIComponent(area)); }}>{area}</button>
              ))}
            </div>
            <div className="home-trust-row" aria-label="How NammaSpot works">
              <span><CheckCircle size={15}/> Discover sellers</span>
              <span><Compass size={15}/> Browse catalogues</span>
              <span><MessageCircle size={15}/> Contact directly</span>
            </div>
          </div>
          <aside className="hero-side-card" aria-label="Discover on NammaSpot">
            <div className="hero-side-kicker"><Sparkles size={15}/> MADE TO BE DISCOVERED</div>
            <div className="hero-side-art" aria-hidden="true">
              <span className="hero-art-orbit orbit-one"></span>
              <span className="hero-art-orbit orbit-two"></span>
              <div className="hero-art-center"><Store size={38}/></div>
              <span className="hero-art-tag tag-one">Handmade</span>
              <span className="hero-art-tag tag-two">Made with care</span>
            </div>
            <h2>Good finds.<br/><em>Great people.</em></h2>
            <p>Explore catalogues from makers, home businesses and independent sellers.</p>
            <button className="hero-side-link" onClick={() => go("/explore")}>Explore sellers <ChevronRight size={17}/></button>
          </aside>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AROUND CHENNAI</div>
            <h2>Little finds, meaningful stories.</h2>
          </div>
          <button className="text-link" onClick={() => go("/explore")}>Explore all <ChevronRight size={17}/></button>
        </div>

        {state.loading ? <CardSkeletonRow/> :
          state.error ? <ErrorState message={state.error} retry={() => location.reload()}/> :
          sellers.length ? <div className="seller-preview-grid">{sellers.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go}/>)}</div> :
          <Empty title="Sellers are coming soon" text="Check back soon for the first NammaSpot catalogues." actionLabel="Explore" onAction={() => go("/explore")}/>}
      </section>

      <section className="story-strip">
        <div className="story-icon"><Store size={28}/></div>
        <div>
          <div className="eyebrow">FOR CREATORS & SELLERS</div>
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
  const searchType = params.get("type") === "product" ? "product" : "seller";
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
  const [sort, setSort] = useState("relevant");
  const [resultType, setResultType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  const options = useMemo(() => ({ query: debouncedQuery, category, near: activeNear, sort, resultType, searchType }), [debouncedQuery, category, activeNear, sort, resultType, searchType]);
  const state = useAsync(() => getPublicSellers(options), [options]);

  const categoryState = useAsync(() => getCategories(), []);
  const categories = Array.from(new Set(["All", ...(categoryState.data || []).map((item) => item.name).filter(Boolean)]));

  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">{activeNear ? "NEARBY · " + activeNear.toUpperCase() : "DISCOVER"}</div>
        <h1>{near ? "Discover around Chennai." : "Find your next favourite."}</h1>
        <p>Find a seller website by business name, or search for a product.</p>
      </div>

      <section className="explore-tools" aria-label="Search and filter results">
        <div className="explore-search" role="search">
          <Search size={20} aria-hidden="true"/>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchType === "product" ? "Search products…" : "Search seller websites…"} aria-label={searchType === "product" ? "Search products" : "Search seller websites"}/>
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>Clear</button>}
        </div>
        <div className="explore-toolbar-row">
          <div className="search-mode-choices explore-search-modes" aria-label="Search type">
            <button type="button" className={searchType === "seller" ? "active" : ""} onClick={() => go("/explore?type=seller" + (query.trim() ? "&search=" + encodeURIComponent(query.trim()) : ""))}><Store size={15}/> Seller websites</button>
            <button type="button" className={searchType === "product" ? "active" : ""} onClick={() => go("/explore?type=product" + (query.trim() ? "&search=" + encodeURIComponent(query.trim()) : ""))}><Search size={15}/> Products</button>
          </div>
          <div className="search-controls">
            <label>Show
              <select value={resultType} onChange={(event) => setResultType(event.target.value)}>
                <option value="all">All sellers</option>
                <option value="services">Service providers</option>
                <option value="sellers">Businesses</option>
              </select>
            </label>
            <label>Sort
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="relevant">Most relevant</option>
                <option value="recent">Recently added</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
      </section>

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
        searchType === "product" ? (
          (state.data || []).flatMap((seller) => (seller.products || [])
            .filter((product) => !debouncedQuery.trim() || [product.name, product.description].some((value) => String(value || "").toLocaleLowerCase("en-IN").includes(debouncedQuery.trim().toLocaleLowerCase("en-IN"))))
            .map((product) => ({ ...product, sellerName: seller.name, sellerSlug: seller.slug, sellerLocation: seller.location }))).length ?
          <div className="product-search-grid">{(state.data || []).flatMap((seller) => (seller.products || [])
            .filter((product) => !debouncedQuery.trim() || [product.name, product.description].some((value) => String(value || "").toLocaleLowerCase("en-IN").includes(debouncedQuery.trim().toLocaleLowerCase("en-IN"))))
            .map((product) => ({ ...product, sellerName: seller.name, sellerSlug: seller.slug, sellerLocation: seller.location }))).map((product) => (
              <article className="product-search-card" key={product.id}>
                <div className="product-search-image">{product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy"/> : <span>{String(product.name || "P").charAt(0)}</span>}</div>
                <div className="product-search-info"><h2>{product.name}</h2><strong>{Number(product.price) > 0 ? "₹" + product.price : "Contact for price"}</strong><p>{product.sellerName}{product.sellerLocation ? " · " + product.sellerLocation : ""}</p><button className="card-link" onClick={() => go("/s/" + product.sellerSlug)}>View seller website <ChevronRight size={16}/></button></div>
              </article>
            ))}</div> :
          <Empty title="No matching products yet" text="Try another product name or switch to Seller websites." actionLabel="Search seller websites" onAction={() => go("/explore?type=seller" + (query.trim() ? "&search=" + encodeURIComponent(query.trim()) : ""))}/>
        ) : state.data?.length ? <div className="seller-list">{state.data.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved={saved.includes(seller.id)} detailed/>)}</div> :
        <Empty title="No matching sellers yet" text="Try a shorter search, remove a filter, or explore another category." actionLabel="Clear search and filters" onAction={() => { setQuery(""); setResultType("all"); setSort("relevant"); go("/explore"); }}/>} 
    </main>
  );
}

function CategoriesPage({ go }) {
  const state = useAsync(() => getCategories(), []);
  const categories = Array.from(new Map((state.data || [])
    .filter((item) => item && item.name)
    .map((item) => [String(item.name).trim().toLocaleLowerCase("en-IN"), String(item.name).trim()])
  ).values());
  return (
    <main className="page categories-page">
      <div className="page-title">
        <div className="eyebrow">MADE AROUND US · CHENNAI</div>
        <h1>Find your next favourite.</h1>
        <p>From home-baked treats to handmade treasures, discover the people and independent businesses bringing creativity to everyday life.</p>
      </div>
      {state.loading ? <CardSkeletonRow detailed/> :
        <div className="category-grid-large">
          {categories.map((category) => (
            <button className={"category-tile" + (category === "Other" ? " category-tile-other" : "")} key={category} onClick={() => go("/explore?cat=" + encodeURIComponent(category))} aria-label={"Browse " + category}>
              <span className="category-tile-icon"><CategoryIcon category={category} size={34}/></span>
              <span className="category-tile-name">{category}</span>
              <span className="category-tile-arrow" aria-hidden="true"><ChevronRight size={15}/></span>
            </button>
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
      <div className="page-title"><div className="eyebrow">HANDPICKED</div><h1>Featured sellers.</h1><p>A small selection worth a closer look.</p></div>
      {state.loading ? <CardSkeletonRow detailed/> :
        state.error ? <ErrorState message={state.error}/> :
        items.length ? <div className="seller-list">{items.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved={saved.includes(seller.id)} detailed/>)}</div> :
        <Empty title="Featured sellers are coming soon" text="Explore the catalogue instead." actionLabel="Explore sellers" onAction={() => go("/explore")}/>}
    </main>
  );
}

function SavedPage({ go, saved, toggleSave }) {
  const [activeTab, setActiveTab] = useState("products");
  const [savedProducts, setSavedProducts] = useState(() => readSavedProducts());
  const state = useAsync(() => getPublicSellers(), [saved.join(",")]);
  const sellers = (state.data || []).filter((seller) => saved.includes(seller.id));

  useEffect(() => {
    const refresh = () => setSavedProducts(readSavedProducts());
    window.addEventListener("nammaspot-saved-products-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nammaspot-saved-products-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const removeSavedProduct = (productId) => {
    const next = savedProducts.filter((item) => item.id !== productId);
    setSavedProducts(next);
    writeSavedProducts(next);
  };

  return (
    <main className="page saved-page">
      <div className="page-title"><div className="eyebrow">YOUR NAMMASPOT</div><h1>Your saved favourites.</h1><p>Keep products and local seller websites in one place.</p></div>
      <div className="saved-tabs" role="tablist" aria-label="Saved items">
        <button type="button" role="tab" aria-selected={activeTab === "products"} className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}><Heart size={17} fill={activeTab === "products" ? "currentColor" : "none"}/> Saved Products <span>{savedProducts.length}</span></button>
        <button type="button" role="tab" aria-selected={activeTab === "websites"} className={activeTab === "websites" ? "active" : ""} onClick={() => setActiveTab("websites")}><Store size={17}/> Saved Websites <span>{saved.length}</span></button>
      </div>
      {activeTab === "products" ? (
        savedProducts.length ? <div className="saved-product-grid">{savedProducts.map((item) => (
          <article className="saved-product-card" key={item.id}>
            <div className="saved-product-image">{item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy"/> : <span>{String(item.name || "P").charAt(0)}</span>}
              <button className="saved-product-remove" type="button" onClick={() => removeSavedProduct(item.id)} aria-label={"Remove " + item.name + " from saved products"}><Heart size={19} fill="currentColor"/></button>
            </div>
            <div className="saved-product-info"><h2>{item.name}</h2><strong>₹{item.price}</strong><p>{item.sellerName || "Local seller"}</p><button className="card-link" onClick={() => item.sellerSlug ? go("/s/" + item.sellerSlug) : go("/explore")}>View seller website <ChevronRight size={16}/></button></div>
          </article>
        ))}</div> : <Empty title="No saved products yet" text="Tap the red heart on a product to save it here." actionLabel="Explore sellers" onAction={() => go("/explore")}/>
      ) : (
        state.loading ? <CardSkeletonRow detailed/> :
        state.error ? <ErrorState message={state.error}/> :
        sellers.length ? <div className="seller-list">{sellers.map((seller,index) => <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved detailed/>)}</div> :
        <Empty title="No saved websites yet" text="Tap the heart on a seller card or seller website to save it here." actionLabel="Explore sellers" onAction={() => go("/explore")}/>
      )}
    </main>
  );
}

function SellerCard({ seller, index=0, go, toggleSave, saved, detailed=false }) {
  return (
    <article className={detailed ? "seller-card detailed" : "seller-card"}>
      <button className={"seller-cover cover-" + ((index % 4)+1) + (seller.profile_image_url ? " has-cover-photo" : "")} onClick={() => go("/s/" + seller.slug)} aria-label={"Open " + seller.name}>
        {seller.profile_image_url && <img className="seller-cover-photo" src={seller.profile_image_url} alt={seller.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.classList.remove("has-cover-photo"); }}/>}
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
        <button className="card-link" onClick={() => go("/s/" + seller.slug)}>View seller website <ChevronRight size={16}/></button>
      </div>
    </article>
  );
}

// Legacy route component kept for compatibility; the active route uses SellerMicrositePage.
// eslint-disable-next-line no-unused-vars
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
  const [showDetails, setShowDetails] = useState(false);
  return (
    <article className="product-card">
      <div className={"product-image product-" + ((index % 3)+1)}>
        {product.image_url ? <img src={product.image_url} alt={product.name}/> : <span>{product.name.charAt(0)}</span>}
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <div className="product-meta"><strong>₹{product.price}</strong><small>{product.available ? "Available" : "Currently unavailable"}</small></div>
        {showDetails && <p className="product-description-details">{product.description?.trim() || "The seller has not added product details yet."}</p>}
        <div className="product-card-actions">
          <button className="secondary-button product-details-button" type="button" aria-expanded={showDetails} onClick={() => setShowDetails(value => !value)}>
            {showDetails ? "Less" : "Details"}
          </button>
          <button className="primary-button product-enquire-button" disabled={!product.available} onClick={onEnquire}>
            {product.available ? "Enquire" : "Unavailable"}
          </button>
        </div>
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


function instagramProfileUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const input = raw.replace(/^@/, "").replace(/\s+/g, "");
  if (/^https?:\/\//i.test(input)) {
    try {
      const parsed = new URL(input);
      if (!/(^|\.)instagram\.com$/i.test(parsed.hostname)) return "";
      const handle = parsed.pathname.split("/").filter(Boolean)[0] || "";
      return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? "https://www.instagram.com/" + handle + "/" : "";
    } catch { return ""; }
  }
  const handle = input.replace(/^www\.instagram\.com\//i, "").replace(/^instagram\.com\//i, "").split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? "https://www.instagram.com/" + handle + "/" : "";
}

function instagramHandle(value) {
  const url = instagramProfileUrl(value);
  if (!url) return "";
  return url.replace(/\/$/, "").split("/").pop();
}

function RegisterPage({ go }) {
  const [data,setData] = useState({nammaspotId:"",business:"",owner:"",phone:"",password:"",category:"",location:"",locationUrl:"",description:"",whatsapp:"",instagram:""});
  const [categoryOptions,setCategoryOptions] = useState([]);
  const [state,setState] = useState({loading:false,error:"",success:"",nammaspotId:""});
  useEffect(() => {
    let active = true;
    getCategories().then((items) => {
      if (!active) return;
      const names = Array.from(new Map((items || []).filter((item) => item && item.name)
        .map((item) => [String(item.name).trim().toLocaleLowerCase("en-IN"), String(item.name).trim()])).values());
      setCategoryOptions(names);
      setData((current) => ({...current, category: names.includes(current.category) ? current.category : (names[0] || "")}));
    }).catch(() => { if (active) setCategoryOptions([]); });
    return () => { active = false; };
  }, []);
  const [showPassword,setShowPassword] = useState(false);
  const [step,setStep] = useState(1);

  const idValue = data.nammaspotId.toLowerCase().replace(/\s/g,"");
  const passwordChecks = {
    length: data.password.length >= 10,
    lower: /[a-z]/.test(data.password),
    upper: /[A-Z]/.test(data.password),
    number: /[0-9]/.test(data.password),
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
      setState({loading:false,error:"Create a NammaSpot ID and a password that meets the requirements shown below.",success:"",nammaspotId:""});
      return;
    }
    if (!businessReady) {
      setStep(2);
      setState({loading:false,error:"Complete all required business details: business name, your name, business phone, WhatsApp number and business location.",success:"",nammaspotId:""});
      return;
    }
    setState({loading:true,error:"",success:"",nammaspotId:""});
    try {
      const result = await startSellerRegistration({...data, instagram: instagramProfileUrl(data.instagram)});
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
              <small id="password-help">Use at least 10 characters with uppercase and lowercase letters, a number, and no spaces. A special symbol is not required. Do not use your business name or NammaSpot ID.</small>
            </label>
            <div className="password-requirements" aria-live="polite">
              <span className={passwordChecks.length?"pass":""}>✓ At least 10 characters</span>
              <span className={passwordChecks.upper?"pass":""}>✓ One uppercase letter</span>
              <span className={passwordChecks.lower?"pass":""}>✓ One lowercase letter</span>
              <span className={passwordChecks.number?"pass":""}>✓ One number</span>
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
              <label>Business category <span className="optional">(recommended)</span><select value={data.category} onChange={e=>setData({...data,category:e.target.value})}><option value="">Choose a category</option>{categoryOptions.map(c=><option key={c} value={c}>{c}</option>)}</select><small>{categoryOptions.length ? "Choose from categories currently managed by NammaSpot admin." : "Categories are temporarily unavailable. Please try again shortly."}</small></label>
              <label>Business location <span className="required">*</span><input value={data.location} onChange={e=>setData({...data,location:e.target.value})} placeholder="Example: RS Puram, Coimbatore" autoComplete="street-address" maxLength={240} required/><small>Area, town or city where customers can find you.</small></label>
            </div>
            <details className="signup-more-details"><summary>Add more business details now <span>optional</span></summary><div className="form-grid">
              <label>Google Maps / location URL<input type="url" value={data.locationUrl} onChange={e=>setData({...data,locationUrl:e.target.value})} placeholder="Paste a Google Maps share link"/></label>
              <label>Instagram ID <span className="optional">(optional)</span><input type="text" value={data.instagram} onChange={e=>setData({...data,instagram:e.target.value})} placeholder="@yourbusiness or Instagram profile URL" autoCapitalize="none" autoCorrect="off"/><small>Customers can tap the Instagram icon on your public profile to visit this account.</small></label>
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
  const [showPassword,setShowPassword] = useState(false);

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
        <label>Password<div className="password-input-wrap"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={data.password} onChange={(e)=>setData({...data,password:e.target.value})} placeholder="Your password" required/><button type="button" className="password-toggle" onClick={()=>setShowPassword((value)=>!value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
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
    instagram_handle:instagramHandle(seller.instagram_url || ""), opening_time:seller.opening_time || "", closing_time:seller.closing_time || "",
    profile_image_url:seller.profile_image_url || ""
  });
  const [state,setState] = useState({saving:false,error:"",success:"",imageBusy:""});
  const [cropTarget,setCropTarget] = useState(null);
  const [dailyUpdate,setDailyUpdate] = useState("");
  useEffect(() => {
    let alive = true;
    getMyMicrosite(seller.id).then((value) => {
      if (alive) setDailyUpdate(value?.settings?.tagline || "");
    }).catch(() => {});
    return () => { alive = false; };
  }, [seller.id]);
  const uploadImage = (event, kind) => {
    const input=event.target, file=input.files?.[0];
    input.value="";
    if(!file) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setState(s=>({...s,error:"Unsupported image format. Use JPG, PNG or WebP."}));return;}
    if(file.size>10*1024*1024){setState(s=>({...s,error:"This image is over 10 MB. Please choose a smaller image."}));return;}
    setState(s=>({...s,error:"",success:""}));
    setCropTarget({file,kind});
  };
  const confirmLogoCrop = async (croppedFile) => {
    if(!cropTarget) return;
    setState(s=>({...s,error:"",imageBusy:"profile",success:""}));
    try{
      const session=await getCurrentProfile();
      if(!session?.id) throw new Error("Your seller session has expired. Sign in again before uploading an image.");
      const url=await uploadSellerMedia(croppedFile,session.id);
      if(!url || !/^https:\/\//i.test(url)) throw new Error("NammaSpot could not confirm the uploaded logo URL. Please try again.");
      const next=await updateSellerImages(seller.id,{profile_image_url:url});
      setData(d=>({...d,...next}));
      onSaved(next);
      setState(s=>({...s,imageBusy:"",success:"Logo cropped and uploaded successfully."}));
      setCropTarget(null);
    }catch(error){setState(s=>({...s,imageBusy:"",error:friendlyError(error),success:""}));}
  };
  const save = async (event) => {
    event.preventDefault();
    setState({saving:true,error:"",success:"",imageBusy:""});
    try {
      const [next] = await Promise.all([
        updateMySeller(seller.id,{...data,instagram_url:instagramProfileUrl(data.instagram_handle)}),
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
          <label className="secondary-button upload-button">{cropTarget?"Preparing crop…":state.imageBusy==="profile"?"Uploading…":"Choose and crop logo"}<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>uploadImage(e,"profile")} hidden disabled={Boolean(state.imageBusy)||Boolean(cropTarget)}/></label>
        </div>
      </div>
      <div className="image-upload-note">Choose an image, adjust it inside the square grid, then confirm the crop. JPG, PNG or WebP · up to 10 MB before cropping.</div>
      {cropTarget && <ImageCropDialog file={cropTarget.file} onCancel={()=>setCropTarget(null)} onConfirm={confirmLogoCrop} busy={Boolean(state.imageBusy)} squareOnly heading="Crop your business logo"/>}
      <div className="form-grid">
        <label>Business name *<input value={data.business_name} onChange={(e)=>setData({...data,business_name:e.target.value})} required/></label>
        <label>Owner name *<input value={data.owner_name} onChange={(e)=>setData({...data,owner_name:e.target.value})} required/></label>
        <label>Category<select value={data.category_id} onChange={(e)=>setData({...data,category_id:e.target.value})}><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>City<input value={data.city} onChange={(e)=>setData({...data,city:e.target.value})}/></label>
        <label>Location<input value={data.location} onChange={(e)=>setData({...data,location:e.target.value})}/></label>
        <label>Location URL<input type="url" value={data.location_url} onChange={(e)=>setData({...data,location_url:e.target.value})}/></label>
        <label>Phone<input value={data.contact} onChange={(e)=>setData({...data,contact:e.target.value})}/></label>
        <label>WhatsApp<input value={data.whatsapp_phone} onChange={(e)=>setData({...data,whatsapp_phone:e.target.value})}/></label>
        <label>Instagram ID <span className="optional">(optional)</span><input type="text" value={data.instagram_handle} onChange={(e)=>setData({...data,instagram_handle:e.target.value})} placeholder="@yourbusiness or Instagram profile URL" autoCapitalize="none" autoCorrect="off"/><small>Customers tapping Instagram on your public profile will open this account.</small></label>
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

function ImageCropDialog({ file, onCancel, onConfirm, busy, squareOnly = false, heading = "Crop your image" }) {
  const [src, setSrc] = useState("");
  const [shape, setShape] = useState("1:1");
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [error, setError] = useState("");
  const imageRef = React.useRef(null);
  const ratios = squareOnly ? { "1:1": 1 } : { "1:1": 1, "4:5": 0.8, "3:2": 1.5, "16:9": 16/9 };
  useEffect(() => { const url = URL.createObjectURL(file); setSrc(url); return () => URL.revokeObjectURL(url); }, [file]);
  const applyCrop = async () => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth) { setError("Wait for the preview to load."); return; }
    try {
      const ratio = ratios[shape], iw = img.naturalWidth, ih = img.naturalHeight;
      let sw, sh;
      if (iw / ih > ratio) { sh = ih / zoom; sw = sh * ratio; } else { sw = iw / zoom; sh = sw / ratio; }
      const sx = Math.max(0, Math.min(iw - sw, (iw - sw) * x / 100));
      const sy = Math.max(0, Math.min(ih - sh, (ih - sh) * y / 100));
      let ow = 1200, oh = Math.round(1200 / ratio);
      if (ratio < 1) { oh = 1200; ow = Math.round(1200 * ratio); }
      const canvas = document.createElement("canvas"); canvas.width = ow; canvas.height = oh;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not prepare the crop.");
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, ow, oh);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.88));
      if (!blob) throw new Error("Could not create cropped image.");
      onConfirm(new File([blob], (file.name || "image").replace(/\.[^.]+$/, "") + "-cropped.webp", { type: "image/webp", lastModified: Date.now() }));
    } catch (e) { setError(e.message || "Could not crop this image."); }
  };
  return <div className="ns-crop-backdrop"><section className="ns-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="ns-crop-title">
    <div className="ns-crop-head"><div><span className="eyebrow">IMAGE EDITOR</span><h2 id="ns-crop-title">{heading}</h2><p>Adjust the frame before uploading.</p></div><button type="button" className="secondary-button" onClick={onCancel} disabled={busy} aria-label="Close crop editor"><X size={18}/></button></div>
    <div className="ns-crop-aspects">{Object.keys(ratios).map(k => <button type="button" key={k} className={shape===k?"active":""} onClick={() => setShape(k)}>{k}</button>)}</div>
    <div className={"ns-crop-preview" + (squareOnly ? " ns-crop-square" : "")} style={{aspectRatio: String(ratios[shape])}}>{src && <img ref={imageRef} src={src} alt="Crop preview" style={{objectPosition: x+"% "+y+"%", transform: "scale("+zoom+")"}} onError={() => setError("This image cannot be previewed.")}/>}<span className="ns-crop-grid" aria-hidden="true"/></div>
    <div className="ns-crop-controls"><label>Zoom <b>{zoom.toFixed(1)}×</b><input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label><label>Move left / right<input type="range" min="0" max="100" value={x} onChange={e=>setX(Number(e.target.value))}/></label><label>Move up / down<input type="range" min="0" max="100" value={y} onChange={e=>setY(Number(e.target.value))}/></label></div>
    {error && <p className="inline-error" role="alert">{error}</p>}<div className="ns-crop-actions"><button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button><button type="button" className="primary-button" onClick={applyCrop} disabled={busy}>{busy?"Uploading…":"Crop and upload"}</button></div>
  </section></div>;
}

function ProductManager({ seller, products, categories, storageUsage, onStorageUsageChange, onChange }) {
  const blank={product_name:"",description:"",price:"",availability:true,image_url:"",category_id:""};
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState(null);
  const [state,setState]=useState({loading:false,error:""});
  const [galleryBusy,setGalleryBusy]=useState(false);
  const [primaryImageBusy,setPrimaryImageBusy]=useState(false);
  const [cropTarget,setCropTarget]=useState(null);

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

  const uploadGallery = (event) => {
    const file=event.target.files?.[0]; event.target.value="";
    if(!file || !editing) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setState({loading:false,error:"Unsupported image format. Use JPG, PNG or WebP."});return;}
    if(file.size>10*1024*1024){setState({loading:false,error:"This image is over 10 MB. Please choose a smaller image."});return;}
    setState({loading:false,error:""}); setCropTarget({file,kind:"gallery"});
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

  const upload = (event) => {
    const input=event.target, file=input.files?.[0]; input.value="";
    if(!file) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setState({loading:false,error:"Unsupported image format. Use JPG, PNG or WebP."});return;}
    if(file.size>10*1024*1024){setState({loading:false,error:"This image is over 10 MB. Please choose a smaller image."});return;}
    setState({loading:false,error:""}); setCropTarget({file,kind:"primary"});
  };

  const confirmCrop = async (croppedFile) => {
    const target=cropTarget; if(!target) return;
    const gallery=target.kind==="gallery"; if(gallery&&!editing) return;
    gallery?setGalleryBusy(true):setPrimaryImageBusy(true); setState({loading:false,error:""});
    try {
      const session=await getCurrentProfile();
      if(!session?.id) throw new Error("Your seller session has expired. Sign in again before uploading an image.");
      const url=await uploadSellerMedia(croppedFile,session.id);
      if(!url || !/^https:\/\//i.test(url)) throw new Error("NammaSpot could not confirm the uploaded image URL. Please try again.");
      if(gallery){
        const current=products.find(p=>p.id===editing), order=(current?.images||[]).length;
        await addProductGalleryImage(editing,seller.id,url,order);
        onChange(products.map(p=>p.id===editing?{...p,images:[...(p.images||[]),{id:"new-"+Date.now(),image_url:url,sort_order:order}]}:p));
      } else { setForm(current=>({...current,image_url:url})); }
      try { onStorageUsageChange(await getSellerStorageUsage()); } catch {}
      setState({loading:false,error:""}); setCropTarget(null);
    } catch(error) { setState({loading:false,error:friendlyError(error)}); }
    finally { gallery?setGalleryBusy(false):setPrimaryImageBusy(false); }
  };

  return (
    <div className="dashboard-content">
      <form className="seller-form compact-form" onSubmit={submit}>
        <div className="product-manager-head"><div><div className="eyebrow">{editing ? "EDIT CATALOGUE ITEM" : "ADD TO CATALOGUE"}</div><h2>{editing ? "Update this product" : "Add a product"}</h2><p className="muted-note">{seller.verification_status === "pending" ? "You can prepare your catalogue now. It will become public after admin approval." : "Add the product name, price and image. Save it once and it will appear in your catalogue."}</p></div><span className="status-pill status-approved">{products.length} item{products.length===1?"":"s"}</span></div>
        {storageUsage && <div className={"storage-usage-card storage-" + storageUsage.status}>
          <div className="storage-usage-head"><strong>Image storage · {storageUsage.plan_name || "Seller plan"}</strong><span>{formatBytes(storageUsage.used_bytes)} / {formatBytes(storageUsage.quota_bytes)}</span></div>
          <div className="storage-usage-track" role="progressbar" aria-valuenow={Math.min(100, Number(storageUsage.used_percent) || 0)} aria-valuemin="0" aria-valuemax="100"><span style={{width: Math.min(100, Number(storageUsage.used_percent) || 0) + "%"}} /></div>
          <small>{formatBytes(storageUsage.remaining_bytes)} remaining · Max per image {formatBytes(storageUsage.max_file_bytes)} · {storageUsage.status === "blocked" ? "Storage limit reached. Delete unused images or contact NammaSpot support to request an upgrade." : storageUsage.status === "critical" ? "Storage nearly full. Remove unused images or contact support." : storageUsage.status === "warning" ? "Storage is getting low. Consider removing unused images." : "Supported formats: JPG, PNG and WebP."}</small>
        </div>}
        <div className="form-grid">
          <label>Product name *<input value={form.product_name} onChange={(e)=>setForm({...form,product_name:e.target.value})} maxLength={160} required/></label>
          <label>Price ₹ *<input type="number" min="0" step="0.01" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} required/></label>
          <label>Category<select value={form.category_id} onChange={(e)=>setForm({...form,category_id:e.target.value})}><option value="">Optional</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Image URL<input type="url" value={form.image_url} onChange={(e)=>setForm({...form,image_url:e.target.value})} placeholder="https://…"/></label>
          <label>Upload primary image<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={upload} disabled={primaryImageBusy||galleryBusy}/><small className="field-help">{primaryImageBusy ? "Uploading and optimizing your image…" : "This is the main catalogue image. JPG, PNG or WebP · selected file up to 10 MB · optimized to your assigned per-image limit."}</small></label>
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
        <div className="button-row"><button className="primary-button" type="submit" disabled={state.loading||primaryImageBusy||galleryBusy}>{primaryImageBusy ? "Uploading image…" : state.loading ? "Saving…" : editing ? "Update product" : "Add product"}</button>{editing&&<button type="button" className="secondary-button" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}</div>
      </form>
      {cropTarget && <ImageCropDialog file={cropTarget.file} onCancel={()=>setCropTarget(null)} onConfirm={confirmCrop} busy={primaryImageBusy||galleryBusy}/>}
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
  const [filter,setFilter] = useState("all");
  const [search,setSearch] = useState("");
  const [busyId,setBusyId] = useState("");
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const update=async(id,status)=>{
    setBusyId(id); setError(""); setNotice("");
    try {
      await updateEnquiryStatus(id,status);
      onChange(enquiries.map((item)=>item.id===id?{...item,status}:item));
      setNotice("Enquiry status updated.");
    } catch (e) {
      setError(e?.message || "Could not update this enquiry. Check your connection and try again.");
    } finally { setBusyId(""); }
  };
  const normalStatus=(status)=>status==="pending"||status==="new"?"new":status==="viewed"?"read":status==="responded"?"replied":status;
  const counts={all:enquiries.length,new:enquiries.filter(x=>normalStatus(x.status)==="new").length,read:enquiries.filter(x=>normalStatus(x.status)==="read").length,replied:enquiries.filter(x=>normalStatus(x.status)==="replied").length,closed:enquiries.filter(x=>normalStatus(x.status)==="closed").length};
  const visible=enquiries.filter(item=>{
    const status=normalStatus(item.status);
    const matchesFilter=filter==="all"||status===filter;
    const q=search.trim().toLowerCase();
    const matchesSearch=!q||[item.customer_name,item.customer_contact,item.message,item.product?.product_name].some(v=>String(v||"").toLowerCase().includes(q));
    return matchesFilter&&matchesSearch;
  });
  return (
    <section className="enquiry-manager">
      <div className="dashboard-section-head"><div><h2>Customer enquiries</h2><p>Reply to customers using the contact details they shared, then update the status so you know what needs attention.</p></div><button className="secondary-button" onClick={()=>{setSearch("");setFilter("all");setError("");setNotice("");}}>Reset</button></div>
      <div className="enquiry-summary">
        {[["all","All"],["new","New"],["read","Read"],["replied","Replied"],["closed","Closed"]].map(([key,label])=><button type="button" key={key} className={filter===key?"active":""} onClick={()=>setFilter(key)}><span>{label}</span><strong>{counts[key]}</strong></button>)}
      </div>
      <label className="enquiry-search-label">Search enquiries<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, contact, product or message…"/></label>
      {error&&<div className="inline-error" role="alert">{error}</div>}
      {notice&&<p className="inline-success" role="status">{notice}</p>}
      <div className="dashboard-list">
        {visible.length ? visible.map((item)=>{
          const status=normalStatus(item.status);
          const phone=String(item.customer_contact||"").replace(/[^+\\d]/g,"");
          const date=item.enquiry_date||item.created_at;
          return <article className="dashboard-item enquiry-item" key={item.id}>
            <div className="enquiry-item-main">
              <div className="enquiry-item-heading"><strong>{item.customer_name||"Customer"} · {item.product?.product_name||"General enquiry"}</strong><span className={"status-pill status-"+status}>{status==="new"?"New":status==="read"?"Read":status==="replied"?"Replied":"Closed"}</span></div>
              <p className="enquiry-contact">{item.customer_contact||"No contact supplied"}</p>
              <p className="enquiry-message">{item.message}</p>
              {date&&<small className="muted-note">Received {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(date))}</small>}
              <div className="button-row enquiry-actions">{phone&&<a className="secondary-button" href={"https://wa.me/"+phone.replace(/^\\+/,"")} target="_blank" rel="noreferrer"><MessageCircle size={15}/> WhatsApp</a>}{item.customer_contact&&item.customer_contact.includes("@")&&<a className="secondary-button" href={"mailto:"+item.customer_contact}><Send size={15}/> Email</a>}</div>
            </div>
            <label className="enquiry-status-control">Status<select value={status} disabled={busyId===item.id} onChange={event=>update(item.id,event.target.value)}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select>{busyId===item.id&&<small>Saving…</small>}</label>
          </article>;
        }) : <Empty title={enquiries.length?"No matching enquiries":"No enquiries yet"} text={enquiries.length?"Try another status or search term.":"New customer messages will appear here. Respond promptly and mark each one as replied or closed."}/>}
      </div>
    </section>
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
  const [statusFilter,setStatusFilter]=useState("pending");
  const [sellerSearch,setSellerSearch]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [storageUsage,setStorageUsage]=useState(null);
  const [otpAlerts,setOtpAlerts]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [categoryDraft,setCategoryDraft]=useState("");
  const [categorySearch,setCategorySearch]=useState("");
  const [editingCategoryId,setEditingCategoryId]=useState(null);
  const [editingCategoryName,setEditingCategoryName]=useState("");
  const [categoryBusy,setCategoryBusy]=useState(false);

  const load=async()=>{
    setLoading(true);
    setError("");
    try {
      const [ok,current] = await Promise.all([isCurrentUserAdmin(), getCurrentProfile()]);
      if (!ok) { setAllowed(false); setError("This account is not an approved NammaSpot admin."); return; }
      const [s,c,u,otp,r]=await Promise.all([adminListSellers(),adminListCategories(),adminStorageUsage(),adminOtpUsageAlerts(),adminListReviews()]);
      setAllowed(true);
      setAdminProfile(current);
      setSellers(s);
      setCategories(c);
      setStorageUsage(u);
      setOtpAlerts(otp);
      setReviews(r);
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
    const target = sellers.find((item)=>item.id===id);
    const actionText = next==="approved" ? "approve" : next==="rejected" ? "reject" : next==="suspended" ? "suspend" : "change the status of";
    if (target && !window.confirm("Are you sure you want to "+actionText+" "+(target.business_name || "this seller")+"?")) return;
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

  const moderateReview=async(id,next)=>{
    setBusy(true);setError("");
    try{await adminUpdateReviewStatus(id,next);setReviews(await adminListReviews())}
    catch(error){setError(friendlyError(error))}
    finally{setBusy(false)}
  };

  const addCategory=async(event)=>{
    event?.preventDefault();
    const name=categoryDraft.trim();
    if(!name) return;
    setCategoryBusy(true);setError("");
    try {
      await adminAddCategory(name);
      setCategories(await adminListCategories());
      setCategoryDraft("");
    } catch(error){setError(friendlyError(error));}
    finally{setCategoryBusy(false);}
  };

  const startRenameCategory=(item)=>{
    setEditingCategoryId(item.id);
    setEditingCategoryName(item.name || "");
  };

  const renameCategory=async(item)=>{
    const name=editingCategoryName.trim();
    if(!name || name===item.name){setEditingCategoryId(null);return;}
    setCategoryBusy(true);setError("");
    try {
      await adminRenameCategory(item.id,name);
      setCategories(await adminListCategories());
      setEditingCategoryId(null);
      setEditingCategoryName("");
    } catch(error){setError(friendlyError(error));}
    finally{setCategoryBusy(false);}
  };

  const removeCategory=async(item)=>{
    if(!window.confirm("Delete category " + item.name + "? Check that sellers using this category will not lose needed information.")) return;
    setCategoryBusy(true);setError("");
    try { await adminDeleteCategory(item.id); setCategories(await adminListCategories()); }
    catch(error){setError(friendlyError(error));}
    finally{setCategoryBusy(false);}
  };

  const visibleCategories=categories.filter((item)=>String(item.name||"").toLowerCase().includes(categorySearch.trim().toLowerCase()));

  const counts = sellers.reduce((acc,item) => {
    const value = item.verification_status || "pending";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const visibleSellers = sellers.filter((item) => {
    const matchesStatus = statusFilter === "all" || (item.verification_status || "pending") === statusFilter;
    const query = sellerSearch.trim().toLowerCase();
    const matchesSearch = !query || [item.business_name, item.owner_name, item.contact, item.whatsapp_phone, item.location, item.category?.name]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  if (loading && allowed === null) return <main className="page"><div className="page-title"><div className="eyebrow">ADMIN</div><h1>Loading moderation…</h1></div><CardSkeletonRow detailed/></main>;
  if (!allowed) return <main className="page"><ErrorState message={error || "Admin access is restricted."} retry={load}/></main>;

  return (
    <main className="page admin-page admin-console-page">
      <div className="admin-console-shell">
        <aside className="admin-console-sidebar" aria-label="Admin console navigation">
          <div className="admin-console-brand"><ShieldCheck size={22}/><div><strong>NammaSpot</strong><span>Admin Console</span></div></div>
          <div className="admin-console-nav">
            <button className={tab==="sellers"?"active":""} onClick={()=>setTab("sellers")}><Store size={17}/><span><strong>Seller management</strong><small>Review and manage accounts</small></span></button>
            <button className={tab==="reviews"?"active":""} onClick={()=>setTab("reviews")}><CheckCircle size={17}/><span><strong>Reviews & reports</strong><small>{reviews.filter(item=>item.status==="pending").length} awaiting review</small></span></button>
            <button className={tab==="categories"?"active":""} onClick={()=>setTab("categories")}><Grid2X2 size={17}/><span><strong>Categories</strong><small>Organise seller categories</small></span></button>
            <button className={tab==="storage"?"active":""} onClick={()=>setTab("storage")}><ShieldCheck size={17}/><span><strong>Storage management</strong><small>Usage, limits and cleanup</small></span></button>
          </div>
          <div className="admin-console-sidebar-bottom">
            <button onClick={load} disabled={loading}>↻ Refresh data</button>
            <button onClick={()=>{signOut().then(()=>location.href="/");}}><LogOut size={16}/> Sign out</button>
          </div>
        </aside>
        <section className="admin-console-content">
      <div className="admin-welcome">
        <div className="eyebrow">NAMMASPOT CONTROL CENTRE</div>
        <h1>NammaSpot Admin Console</h1>
        <p>Manage sellers, catalogue content, approvals, and platform storage from one place.</p>
      </div>
      <div className="admin-summary-grid" aria-label="Platform summary">
        <article className="admin-summary-card"><span>Total sellers</span><strong>{sellers.length}</strong><small>All seller accounts</small></article>
        <article className="admin-summary-card is-pending"><span>Pending approvals</span><strong>{counts.pending || 0}</strong><small>Need your review</small></article>
        <article className="admin-summary-card is-approved"><span>Approved sellers</span><strong>{counts.approved || 0}</strong><small>Can use NammaSpot</small></article>
        <article className="admin-summary-card is-suspended"><span>Suspended sellers</span><strong>{counts.suspended || 0}</strong><small>Access currently paused</small></article>
        <article className="admin-summary-card"><span>Categories</span><strong>{categories.length}</strong><small>Available category records</small></article>
        <article className="admin-summary-card"><span>Pending reviews</span><strong>{reviews.filter(item=>item.status==="pending").length}</strong><small>Customer feedback to review</small></article>
      </div>
      <div className="dashboard-head">
        <div>
          <div className="eyebrow">CURRENT SECTION</div>
          <h1>{tab==="sellers" ? "Seller management" : tab==="storage" ? "Storage management" : tab==="reviews" ? "Reviews & reports" : "Category management"}</h1>
          <p>{tab==="sellers" ? "Review new sellers first, then manage approved or restricted accounts." : tab==="storage" ? "Set limits and remove failed or unused uploads safely." : tab==="reviews" ? "Review customer feedback before it appears publicly." : "Keep seller categories organised and easy to browse."}</p>
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
            <strong>{storageUsage.used_percent}% of {formatBytes(storageUsage.quota_bytes)} configured allowance used</strong>
            <p>
              {storageUsage.status === "ok" && "Everything is within the safe range."}
              {storageUsage.status === "warning" && "Warning: configured storage warning threshold has been reached. Review unused images soon."}
              {storageUsage.status === "critical" && "Critical: configured storage threshold has been reached. New uploads may be blocked at the emergency cutoff."}
              {storageUsage.status === "blocked" && "Emergency threshold reached. New uploads are blocked by the database safety policy."}
            </p>
          </div>
          <span className={"status-pill status-" + storageUsage.status}>{storageUsage.status}</span>
        </div>
      )}

      {tab==="sellers" &&
        <section className="admin-sellers-management">
          <div className="admin-sellers-heading">
            <div>
              <h2>Manage sellers</h2>
              <p>Start with “Needs review”. Approve genuine businesses, reject incomplete applications, or suspend accounts when needed.</p>
            </div>
            <div className="admin-seller-total"><strong>{counts.pending || 0}</strong><span>Awaiting review</span></div>
          </div>
          <div className="admin-seller-status-tabs" aria-label="Filter sellers by status">
            {[
              ["pending","Needs review",counts.pending || 0],
              ["approved","Approved",counts.approved || 0],
              ["suspended","Suspended",counts.suspended || 0],
              ["rejected","Rejected",counts.rejected || 0],
              ["all","All sellers",sellers.length],
            ].map(([value,label,count]) => (
              <button type="button" key={value} className={statusFilter===value ? "active" : ""} onClick={()=>setStatusFilter(value)}>
                <span>{label}</span><b>{count}</b>
              </button>
            ))}
          </div>
          <label className="admin-seller-search"><Search size={18}/><input type="search" value={sellerSearch} onChange={(e)=>setSellerSearch(e.target.value)} placeholder="Search business, owner, phone, or location" aria-label="Search sellers"/></label>
          <div className="admin-seller-results-line"><strong>{visibleSellers.length} {visibleSellers.length===1 ? "seller" : "sellers"}</strong><span>{statusFilter==="pending" ? "Waiting for your review" : statusFilter==="all" ? "All account statuses" : "Showing " + statusFilter + " accounts"}</span></div>
          <div className="dashboard-list admin-seller-list">
            {loading ? <CardSkeletonRow detailed/> :
              visibleSellers.length ? visibleSellers.map((seller)=> {
                const sellerStatus = seller.verification_status || "pending";
                return <article className="dashboard-item admin-seller-card" key={seller.id}>
                  <div className="admin-seller-details">
                    <div className="admin-seller-title-row"><strong>{seller.business_name || "Unnamed business"}</strong><span className={"status-pill " + (sellerStatus==="approved" ? "status-ok" : sellerStatus==="pending" ? "status-warning" : "")}>{sellerStatus.charAt(0).toUpperCase()+sellerStatus.slice(1)}</span></div>
                    <p><span>Owner</span>{seller.owner_name || "Not provided"}</p>
                    <p><span>Phone</span>{seller.contact || "Not provided"}{(seller.whatsapp_phone && seller.whatsapp_phone!==seller.contact) ? " · WhatsApp: "+seller.whatsapp_phone : ""}</p>
                    <p><span>Location</span>{seller.location || "Not provided"}</p>
                    <small>{seller.category?.name || "Uncategorised"}</small>
                  </div>
                  <div className="admin-seller-actions">
                    {sellerStatus !== "approved" && <button type="button" disabled={busy} className="primary-button" onClick={()=>status(seller.id,"approved")}>{sellerStatus==="suspended" ? "Restore access" : "Approve seller"}</button>}
                    {sellerStatus === "pending" && <button type="button" disabled={busy} className="secondary-button" onClick={()=>status(seller.id,"rejected")}>Reject</button>}
                    {sellerStatus === "approved" && <button type="button" disabled={busy} className="secondary-button" onClick={()=>status(seller.id,"suspended")}>Suspend access</button>}
                    {sellerStatus === "rejected" && <button type="button" disabled={busy} className="secondary-button" onClick={()=>status(seller.id,"suspended")}>Suspend</button>}
                    {sellerStatus === "suspended" && <button type="button" disabled={busy} className="danger-button" onClick={()=>permanentlyDelete(seller)}><Trash2 size={15}/> Delete permanently</button>}
                  </div>
                </article>;
              }) : <Empty
                title={sellerSearch.trim() ? "No matching sellers" : statusFilter === "all" ? "No sellers found" : "No " + (statusFilter==="pending" ? "sellers waiting for review" : statusFilter + " sellers")}
                text={sellerSearch.trim() ? "Try a business name, owner name, phone number, or location." : statusFilter === "pending" ? "New seller applications will appear here when submitted." : "There are no sellers in this view right now."}
              />}
          </div>
        </section>}

      {tab==="reviews" &&
        <section className="admin-review-queue">
          <div className="dashboard-section-head"><div><h2>Customer review moderation</h2><p>Only approve feedback that is relevant, respectful and does not expose private information. Reviews become public after approval.</p></div><button className="secondary-button" onClick={async()=>{try{setReviews(await adminListReviews())}catch(error){setError(friendlyError(error))}}}>Refresh reviews</button></div>
          <div className="category-row" aria-label="Review status summary">
            <span className="status-pill status-warning">Pending {reviews.filter(item=>item.status==="pending").length}</span>
            <span className="status-pill status-ok">Approved {reviews.filter(item=>item.status==="approved").length}</span>
            <span className="status-pill">Rejected {reviews.filter(item=>item.status==="rejected").length}</span>
          </div>
          <div className="dashboard-list">
            {reviews.length?reviews.map(review=><article className="dashboard-item admin-review-item" key={review.id}>
              <div className="admin-review-copy">
                <div className="enquiry-item-heading"><strong>{review.reviewer_name}</strong><span className={"status-pill "+(review.status==="pending"?"status-warning":review.status==="approved"?"status-ok":"")}>{review.status}</span></div>
                <p className="admin-review-rating">{"★".repeat(Number(review.rating))}{"☆".repeat(5-Number(review.rating))} · {review.rating}/5</p>
                <p>{review.comment}</p>
                <small>For: {review.seller?.business_name||"Seller"} · {review.created_at?new Date(review.created_at).toLocaleString("en-IN"):"Date unavailable"}</small>
              </div>
              <div className="button-row">
                {review.status!=="approved"&&<button disabled={busy} className="primary-button" onClick={()=>moderateReview(review.id,"approved")}>Approve</button>}
                {review.status!=="rejected"&&<button disabled={busy} className="secondary-button" onClick={()=>moderateReview(review.id,"rejected")}>Reject</button>}
              </div>
            </article>):<Empty title="No reviews submitted yet" text="Customer feedback will appear here when someone submits a review from a seller page."/>}
          </div>
        </section>}
      {tab==="storage" && <AdminStorageManagement />}
      {tab==="categories" &&
        <section className="admin-category-management">
          <div className="dashboard-section-head">
            <div><h2>Category management</h2><p>Add and maintain the categories customers use to discover local sellers. Use clear names and avoid duplicates.</p></div>
            <span className="admin-category-count">{categories.length} categories</span>
          </div>
          <form className="admin-category-create" onSubmit={addCategory}>
            <label htmlFor="admin-category-new">Add a category</label>
            <div className="admin-category-create-row">
              <input id="admin-category-new" value={categoryDraft} onChange={(event)=>setCategoryDraft(event.target.value)} placeholder="e.g. Handmade gifts" maxLength={60} required />
              <button className="primary-button" type="submit" disabled={categoryBusy||!categoryDraft.trim()}><Plus size={16}/>{categoryBusy?"Saving…":"Add category"}</button>
            </div>
            <small>Use a short, customer-friendly name. The existing category system remains unchanged.</small>
          </form>
          <label className="admin-seller-search"><Search size={18}/><input type="search" value={categorySearch} onChange={(event)=>setCategorySearch(event.target.value)} placeholder="Find a category" aria-label="Search categories"/></label>
          <div className="admin-category-list">
            {visibleCategories.map((item)=>
              <article className="dashboard-item admin-category-row" key={item.id}>
                {editingCategoryId===item.id ? (
                  <form className="admin-category-edit" onSubmit={(event)=>{event.preventDefault();renameCategory(item);}}>
                    <input aria-label={"Rename "+item.name} value={editingCategoryName} onChange={(event)=>setEditingCategoryName(event.target.value)} maxLength={60} required autoFocus/>
                    <div className="button-row"><button className="primary-button" type="submit" disabled={categoryBusy||!editingCategoryName.trim()}>{categoryBusy?"Saving…":"Save"}</button><button className="secondary-button" type="button" onClick={()=>setEditingCategoryId(null)} disabled={categoryBusy}>Cancel</button></div>
                  </form>
                ) : (
                  <><div className="admin-category-name"><Grid2X2 size={18}/><strong>{item.name}</strong></div><div className="button-row"><button className="secondary-button" type="button" onClick={()=>startRenameCategory(item)} disabled={categoryBusy}><Pencil size={15}/> Rename</button><button className="danger-button" type="button" onClick={()=>removeCategory(item)} disabled={categoryBusy}><Trash2 size={15}/> Delete</button></div></>
                )}
              </article>
            )}
            {!visibleCategories.length&&<Empty title="No matching categories" text={categorySearch?"Try another search term.":"Add the first category using the form above."}/>}
          </div>
        </section>}
        </section>
      </div>
    </main>
  );
}

function AdminStorageManagement() {
  const [rows,setRows]=useState([]);
  const [plans,setPlans]=useState([]);
  const [audit,setAudit]=useState([]);
  const [planAudit,setPlanAudit]=useState([]);
  const [events,setEvents]=useState([]);
  const [fileDetails,setFileDetails]=useState({});
  const [settings,setSettings]=useState(null);
  const [overview,setOverview]=useState(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [cleaning,setCleaning]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [search,setSearch]=useState("");
  const [planFilter,setPlanFilter]=useState("all");
  const [usageFilter,setUsageFilter]=useState("all");
  const [planDrafts,setPlanDrafts]=useState({});
  const [platformDraft,setPlatformDraft]=useState(null);
  const [edits,setEdits]=useState({});
  const mbToBytes=(value)=>Math.round(Number(value)*1000000);
  const bytesToMb=(value)=>Number(value||0)/1000000;

  const load=async()=>{
    setLoading(true);setError("");
    try {
      const [nextRows,nextPlans,nextAudit,nextPlanAudit,nextSettings,nextOverview,nextEvents]=await Promise.all([
        adminStorageSellers(),adminStoragePlans(),adminStorageAudit(),adminStoragePlanAudit(),adminPlatformStorageSettings(),adminStorageUsage(),adminStorageEvents()
      ]);
      setRows(nextRows);setPlans(nextPlans);setAudit(nextAudit);setPlanAudit(nextPlanAudit);setSettings(nextSettings);setOverview(Array.isArray(nextOverview)?nextOverview[0]:nextOverview);setEvents(nextEvents);
      setPlanDrafts(Object.fromEntries(nextPlans.filter(p=>p.code!=="custom").map(p=>[p.code,{quota:bytesToMb(p.quota_bytes),max:bytesToMb(p.max_file_bytes)}])));
      setPlatformDraft({allowance:bytesToMb(nextSettings.configured_storage_allowance_bytes)/1000,warning:nextSettings.warning_percent,critical:nextSettings.critical_percent,emergency:nextSettings.emergency_percent});
      setEdits(Object.fromEntries(nextRows.map(r=>[r.seller_id,{planCode:r.plan_code,quota:bytesToMb(r.quota_bytes),max:bytesToMb(r.max_file_bytes),reason:""}])));
    } catch(e){setError(friendlyError(e));}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const visible=rows.filter(r=>{
    const q=search.trim().toLowerCase();
    const matchSearch=!q||[r.business_name,r.nammaspot_id,r.seller_id].some(v=>String(v||"").toLowerCase().includes(q));
    const matchPlan=planFilter==="all"||r.plan_code===planFilter;
    const pct=Number(r.used_percent||0);
    const matchUsage=usageFilter==="all"||(usageFilter==="near"&&pct>=80&&pct<100)||(usageFilter==="over"&&pct>=100)||(usageFilter==="healthy"&&pct<80);
    return matchSearch&&matchPlan&&matchUsage;
  });
  const totalUsed=rows.reduce((n,r)=>n+Number(r.used_bytes||0),0);
  const totalQuota=rows.reduce((n,r)=>n+Number(r.quota_bytes||0),0);
  const countPlan=(code)=>rows.filter(r=>r.plan_code===code).length;
  const setEdit=(id,patch)=>setEdits(prev=>({...prev,[id]:{...prev[id],...patch}}));

  const toggleFiles=async(row)=>{
    if(fileDetails[row.seller_id]){setFileDetails(prev=>{const next={...prev};delete next[row.seller_id];return next;});return;}
    setBusy(true);setError("");
    try{const files=await adminStorageFiles(row.seller_id);setFileDetails(prev=>({...prev,[row.seller_id]:files}));}
    catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  };
  const saveSeller=async(row)=>{
    const draft=edits[row.seller_id];
    if(!draft)return;
    if(draft.planCode==="custom"&&(!(Number(draft.quota)>0)||!(Number(draft.max)>0)||Number(draft.max)>Number(draft.quota))){
      setError("For a Custom plan, enter positive quota and image limits. The image limit cannot exceed total storage.");return;
    }
    const confirmed=window.confirm("Apply "+draft.planCode+" storage to "+row.business_name+"? Existing images will not be deleted. If the new quota is below current usage, uploads will be blocked until usage is reduced.");
    if(!confirmed)return;
    setBusy(true);setError("");setNotice("");
    try{
      await adminAssignSellerStorage({sellerId:row.seller_id,planCode:draft.planCode,
        customQuotaBytes:draft.planCode==="custom"?mbToBytes(draft.quota):null,
        customMaxFileBytes:draft.planCode==="custom"?mbToBytes(draft.max):null,reason:draft.reason});
      setNotice("Storage plan updated for "+row.business_name+". Existing files were preserved and the change was audited.");
      await load();
    }catch(e){setError(friendlyError(e));}
    finally{setBusy(false);}
  };
  const savePlan=async(code)=>{
    const d=planDrafts[code];
    if(!d||Number(d.quota)<=0||Number(d.max)<=0||Number(d.max)>Number(d.quota)){setError("Plan limits must be positive and the per-image limit cannot exceed the total quota.");return;}
    if(!window.confirm("Update the shared "+code+" plan limits? All sellers assigned to this plan will receive the updated limits."))return;
    setBusy(true);setError("");setNotice("");
    try{await adminUpdateStoragePlan({planCode:code,quotaBytes:mbToBytes(d.quota),maxFileBytes:mbToBytes(d.max)});setNotice(code+" plan limits updated.");await load();}
    catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  };
  const cleanupOrphanedMedia=async()=>{
    if(!window.confirm("Remove old seller-media files that are not referenced by any seller profile, product, or gallery? Recent uploads from the last hour will be left alone."))return;
    setCleaning(true);setError("");setNotice("");
    try{
      const result=await adminCleanupOrphanedMedia();
      setNotice("Cleanup complete: removed "+result.deleted_files+" unused files and freed "+formatBytes(result.deleted_bytes)+". "+result.skipped_recent_files+" recent unreferenced file(s) were left for safety.");
      setFileDetails({});
      await load();
    }catch(e){setError(friendlyError(e));}
    finally{setCleaning(false);}
  };

  const savePlatform=async()=>{
    if(!platformDraft)return;
    if(!(Number(platformDraft.allowance)>0)||!(Number(platformDraft.warning)<Number(platformDraft.critical)&&Number(platformDraft.critical)<Number(platformDraft.emergency)&&Number(platformDraft.emergency)<=100)){
      setError("Enter a positive capacity and ascending warning thresholds.");return;
    }
    if(!window.confirm("Save platform storage safety thresholds? This is a planning limit, not a live measurement of Supabase billing or bandwidth."))return;
    setBusy(true);setError("");setNotice("");
    try{await adminUpdatePlatformStorageSettings({allowanceBytes:mbToBytes(Number(platformDraft.allowance)*1000),warningPercent:Number(platformDraft.warning),criticalPercent:Number(platformDraft.critical),emergencyPercent:Number(platformDraft.emergency)});setNotice("Platform storage warning settings saved.");await load();}
    catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  };

  return <div className="ns-storage-admin">
    <div className="dashboard-section-head"><div><div className="eyebrow">PLATFORM OPERATIONS</div><h2>Seller Storage Management</h2><p>Assign seller limits, monitor real stored objects, and protect NammaSpot's free-first launch.</p></div><button className="secondary-button" onClick={load} disabled={loading}>↻ Refresh</button></div>
    {error&&<div className="inline-error" role="alert">{error}</div>}
    {notice&&<div className="form-status" role="status">{notice}</div>}
    <section className="ns-storage-cleanup-card" aria-labelledby="ns-storage-cleanup-title">
      <div className="ns-storage-cleanup-copy">
        <span className="eyebrow">CLEAN UP UNUSED FILES</span>
        <h3 id="ns-storage-cleanup-title">Remove failed and abandoned uploads</h3>
        <p>Only files not referenced by a seller profile, catalogue product or gallery are eligible. Images uploaded in the last hour are protected.</p>
      </div>
      <button className="danger-button" type="button" onClick={cleanupOrphanedMedia} disabled={busy||cleaning||loading}>
        <Trash2 size={16}/>{cleaning?"Cleaning storage…":"Clean unused images"}
      </button>
    </section>
    {loading&&!rows.length?<CardSkeletonRow detailed/>:<>
      <div className="ns-storage-stats">
        <article className="dashboard-item"><small>Total sellers</small><strong>{rows.length}</strong></article>
        <article className="dashboard-item"><small>Actual seller-media storage</small><strong>{formatBytes(totalUsed)}</strong></article>
        <article className="dashboard-item"><small>Seller quotas assigned</small><strong>{formatBytes(totalQuota)}</strong></article>
        <article className="dashboard-item"><small>Configured platform allowance</small><strong>{formatBytes(overview?.quota_bytes||settings?.configured_storage_allowance_bytes||0)}</strong></article>
        <article className="dashboard-item"><small>Remaining configured capacity</small><strong>{formatBytes(Math.max(0,Number(overview?.quota_bytes||settings?.configured_storage_allowance_bytes||0)-Number(overview?.used_bytes||0)))}</strong></article>
        <article className="dashboard-item"><small>Near / over seller quota</small><strong>{rows.filter(r=>Number(r.used_percent||0)>=80).length} / {rows.filter(r=>Number(r.used_percent||0)>=100).length}</strong></article>
      </div>
      <div className="ns-storage-plan-counts">
        {["small","medium","large","custom"].map(code=><div className="dashboard-item" key={code}><small>{code[0].toUpperCase()+code.slice(1)} plan</small><strong>{countPlan(code)} sellers</strong></div>)}
      </div>
      <div className={"dashboard-item storage-"+(overview?.status||"ok")}>
        <div><div className="eyebrow">PLATFORM STORAGE SAFETY</div><strong>{overview?.used_percent??"—"}% of configured allowance used</strong>
          <div className="storage-usage-track" role="progressbar" aria-valuenow={Math.min(100,Number(overview?.used_percent||0))} aria-valuemin="0" aria-valuemax="100"><span style={{width:Math.min(100,Number(overview?.used_percent||0))+"%"}}/></div>
          <p>{overview?.status==="blocked"?"Emergency threshold reached: new uploads are blocked by the database policy.":overview?.status==="critical"?"Critical storage warning. Review usage before adding more media.":overview?.status==="warning"?"Storage warning threshold reached.": "Within configured storage warning thresholds."}</p>
          <small>Counts actual object metadata in the seller-media bucket. The allowance is admin-configured; Supabase's live account quota and bandwidth/egress are not exposed by this app integration.</small>
        </div><span className={"status-pill status-"+(overview?.status||"ok")}>{overview?.status||"unknown"}</span>
      </div>

      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">EDITABLE SHARED PLANS</div><h3>Plan limits</h3><p>Units use decimal MB: 1 MB = 1,000,000 bytes. Existing sellers keep their current 50 MiB / 512 KB allowance until an admin changes it.</p></div>
        <div className="ns-storage-plan-editor">{plans.filter(p=>p.code!=="custom").map(plan=>{
          const d=planDrafts[plan.code]||{quota:bytesToMb(plan.quota_bytes),max:bytesToMb(plan.max_file_bytes)};
          return <div className="ns-storage-plan-edit" key={plan.code}><strong>{plan.name}</strong>
            <label>Total quota (MB)<input type="number" min="0.1" step="0.1" value={d.quota} onChange={e=>setPlanDrafts(prev=>({...prev,[plan.code]:{...d,quota:e.target.value}}))}/></label>
            <label>Max image (MB)<input type="number" min="0.01" step="0.05" value={d.max} onChange={e=>setPlanDrafts(prev=>({...prev,[plan.code]:{...d,max:e.target.value}}))}/></label>
            <button className="secondary-button" disabled={busy} onClick={()=>savePlan(plan.code)}>Save {plan.name}</button>
          </div>;
        })}</div>
      </section>

      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">PLATFORM WARNING SETTINGS</div><h3>Capacity safety thresholds</h3><p>This configurable allowance is a guardrail, not a live reading of Supabase plan capacity. Verify billing and egress in the Supabase dashboard.</p></div>
        {platformDraft&&<div className="ns-platform-settings-grid">
          <label>Configured allowance (GB)<input type="number" min="0.01" step="0.1" value={platformDraft.allowance} onChange={e=>setPlatformDraft({...platformDraft,allowance:e.target.value})}/></label>
          <label>Warning %<input type="number" min="1" max="98" value={platformDraft.warning} onChange={e=>setPlatformDraft({...platformDraft,warning:e.target.value})}/></label>
          <label>Critical %<input type="number" min="2" max="99" value={platformDraft.critical} onChange={e=>setPlatformDraft({...platformDraft,critical:e.target.value})}/></label>
          <label>Emergency %<input type="number" min="3" max="100" value={platformDraft.emergency} onChange={e=>setPlatformDraft({...platformDraft,emergency:e.target.value})}/></label>
          <button className="primary-button" disabled={busy} onClick={savePlatform}>Save platform thresholds</button>
        </div>}
      </section>

      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">SELLER ALLOWANCES</div><h3>Search and manage sellers</h3></div>
        <div className="ns-storage-filters">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search business, NammaSpot ID or seller UUID" aria-label="Search sellers by name or ID"/>
          <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)} aria-label="Filter by plan"><option value="all">All plans</option>{["small","medium","large","custom"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select>
          <select value={usageFilter} onChange={e=>setUsageFilter(e.target.value)} aria-label="Filter by storage usage"><option value="all">All usage</option><option value="healthy">Below 80%</option><option value="near">80–99%</option><option value="over">At/over quota</option></select>
        </div>
        <div className="dashboard-list">{visible.map(row=>{
          const d=edits[row.seller_id]||{planCode:row.plan_code,quota:bytesToMb(row.quota_bytes),max:bytesToMb(row.max_file_bytes),reason:""};
          const pct=Number(row.used_percent||0);
          const over=pct>=100;
          return <article className="dashboard-item ns-storage-seller" key={row.seller_id}>
            <div className="ns-storage-seller-heading"><div><strong>{row.business_name}</strong><p>{row.nammaspot_id||row.seller_id} · {row.verification_status}</p></div><span className={"status-pill "+(over?"status-danger":pct>=80?"status-warning":"status-ok")}>{pct.toFixed(1)}%</span></div>
            <div className="storage-usage-head"><strong>{formatBytes(row.used_bytes)} used</strong><span>{formatBytes(row.quota_bytes)} quota · {formatBytes(row.remaining_bytes)} remaining</span></div>
            <div className="storage-usage-track" role="progressbar" aria-valuenow={Math.min(100,pct)} aria-valuemin="0" aria-valuemax="100"><span style={{width:Math.min(100,pct)+"%"}}/></div>
            <small>{row.file_count} files · maximum {formatBytes(row.max_file_bytes)} per image · last plan change {row.last_plan_change?new Date(row.last_plan_change).toLocaleString("en-IN"):"not recorded"} · admin ID {row.last_changed_by||"migration"}</small>
            {over&&<p className="inline-error">This seller is over quota. Existing images are preserved; new uploads are blocked until usage falls below the limit.</p>}
            <button type="button" className="secondary-button" disabled={busy} onClick={()=>toggleFiles(row)}>{fileDetails[row.seller_id]?"Hide uploaded files":"View uploaded files ("+row.file_count+")"}</button>
            {fileDetails[row.seller_id]&&<div className="ns-storage-file-list">{fileDetails[row.seller_id].map(file=><div key={file.object_name} className="ns-storage-file-row"><div><strong>{file.object_name.split("/").slice(1).join("/")}</strong><small>{file.content_type||"Image"} · {new Date(file.created_at).toLocaleString("en-IN")}</small></div><span>{formatBytes(file.size_bytes)}</span></div>)}{!fileDetails[row.seller_id].length&&<small>No stored files were found.</small>}</div>}
            <div className="ns-storage-edit-grid">
              <label>Plan<select value={d.planCode} onChange={e=>setEdit(row.seller_id,{planCode:e.target.value})}>{["small","medium","large","custom"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></label>
              {d.planCode==="custom"&&<><label>Total quota (MB)<input type="number" min="0.1" step="0.1" value={d.quota} onChange={e=>setEdit(row.seller_id,{quota:e.target.value})}/></label><label>Max image (MB)<input type="number" min="0.01" step="0.05" value={d.max} onChange={e=>setEdit(row.seller_id,{max:e.target.value})}/></label></>}
              <label>Change reason (optional)<input maxLength="300" value={d.reason||""} onChange={e=>setEdit(row.seller_id,{reason:e.target.value})} placeholder="Reason for audit history"/></label>
              <button className="primary-button" disabled={busy} onClick={()=>saveSeller(row)}>Apply plan</button>
            </div>
          </article>;
        })}{!visible.length&&<Empty title="No sellers match" text="Change the search or filters to view sellers." />}</div>
      </section>

      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">UPLOAD FAILURES AND QUOTA VIOLATIONS</div><h3>Recent storage events</h3><p>Rejected upload attempts recorded by the application. Direct requests blocked by Storage may not create a client event.</p></div>
        <div className="dashboard-list">{events.length?events.map(item=><article className="dashboard-item" key={item.event_id}>
          <strong>{item.business_name} · {item.event_type.replaceAll("_"," ")}</strong>
          <p>{item.message||"No additional details"}{item.requested_bytes? " · requested "+formatBytes(item.requested_bytes):""}</p>
          <small>{new Date(item.created_at).toLocaleString("en-IN")}</small>
        </article>):<p className="muted-note">No recorded upload failures or quota violations.</p>}</div>
      </section>
      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">AUDIT TRAIL</div><h3>Recent storage-plan changes</h3><p>Recent plan assignments, quota changes and the administrator account responsible.</p></div>
        <div className="dashboard-list">{audit.length?audit.map(item=><article className="dashboard-item" key={item.id}>
          <strong>{item.business_name||rows.find(r=>r.seller_id===item.seller_id)?.business_name||"Deleted seller"} · {item.previous_plan_code||"none"} → {item.new_plan_code}</strong>
          <p>{formatBytes(item.previous_quota_bytes||0)} → {formatBytes(item.new_quota_bytes)} · max image {formatBytes(item.new_max_file_bytes)}</p>
          <small>{new Date(item.created_at).toLocaleString("en-IN")} · admin {item.admin_email||item.changed_by||"unknown"} · {item.reason||"No reason supplied"}</small>
        </article>):<p className="muted-note">No plan changes have been recorded yet.</p>}</div>
      </section>
      <section className="dashboard-item ns-storage-settings">
        <div><div className="eyebrow">SHARED PLAN AUDIT</div><h3>Plan configuration changes</h3><p>Changes to the Small, Medium and Large plan definitions.</p></div>
        <div className="dashboard-list">{planAudit.length?planAudit.map(item=><article className="dashboard-item" key={item.id}>
          <strong>{item.plan_code[0].toUpperCase()+item.plan_code.slice(1)} plan</strong>
          <p>Quota: {formatBytes(item.previous_quota_bytes)} → {formatBytes(item.new_quota_bytes)} · max image: {formatBytes(item.previous_max_file_bytes)} → {formatBytes(item.new_max_file_bytes)}</p>
          <small>{new Date(item.created_at).toLocaleString("en-IN")} · admin {item.admin_email||item.changed_by||"unknown"}</small>
        </article>):<p className="muted-note">No shared plan definition changes have been recorded.</p>}</div>
      </section>
    </>}
  </div>;
}


function InstallNammaSpotPrompt({ visible }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [installed, setInstalled] = useState(() => {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch { return false; }
  });

  useEffect(() => {
    if (visible && !installed) {
      setPopupOpen(true);
      setHelpOpen(false);
    } else {
      setPopupOpen(false);
    }
  }, [visible, installed]);

  useEffect(() => {
    const onOpenInstall = () => { setPopupOpen(true); setHelpOpen(true); };
    window.addEventListener("nammaspot-open-install-prompt", onOpenInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setHelpOpen(false);
      setPopupOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("nammaspot-open-install-prompt", onOpenInstall);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const addToHome = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice?.outcome === "accepted") setInstalled(true);
        setInstallPrompt(null);
        if (choice?.outcome !== "accepted") setHelpOpen(true);
      } catch { setHelpOpen(true); }
    } else {
      setHelpOpen(true);
    }
  };

  if (!visible || installed || !popupOpen) return null;
  return <div className="ns-install-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setPopupOpen(false); }}>
    <section className="ns-install-modal" role="dialog" aria-modal="true" aria-labelledby="ns-install-title">
      <button type="button" className="ns-install-modal-close" onClick={() => setPopupOpen(false)} aria-label="Close install reminder">×</button>
      <img src="/nammaspot-icon.svg" alt="NammaSpot app icon" width="64" height="64" />
      <span className="ns-install-kicker">QUICK ACCESS · FREE</span>
      <h2 id="ns-install-title">Take NammaSpot with you</h2>
      <p>Install NammaSpot on your home screen to return to local sellers quickly, just like an app.</p>
      {helpOpen && <p className="ns-install-help"><strong>Android:</strong> use your browser menu and choose “Install app” or “Add to Home screen”. <strong>iPhone:</strong> open this page in Safari, tap Share, then “Add to Home Screen”.</p>}
      <button type="button" className="ns-install-action ns-install-modal-primary" onClick={addToHome}>Install app</button>
      <button type="button" className="ns-install-dismiss" onClick={() => setPopupOpen(false)}>Maybe later</button>
    </section>
  </div>;
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

function MobileBottomNav({ path,go,profile }) {
  // Keep the main bar focused on the actions customers use most often.
  // Secondary destinations live in the compact More sheet to avoid a crowded tab bar.
  const [moreOpen, setMoreOpen] = useState(false);
  const normalizedPath = (path || "/").split("?")[0];
  const isNearby = (path || "").startsWith("/explore?near");
  const hideOnPath = [
    "/dashboard",
    "/admin",
    "/nammaspot-control-panel",
    "/login",
    "/register",
    "/s/",
    "/seller/",
    "/not-found"
  ];
  if (hideOnPath.some((prefix) => normalizedPath.startsWith(prefix))) return null;

  const goFromMore = (destination) => {
    setMoreOpen(false);
    go(destination);
  };
  const moreIsActive = ["/categories", "/featured", "/register", "/login"].some((prefix) => normalizedPath.startsWith(prefix));

  return <>
    {moreOpen && <button className="mobile-more-backdrop" aria-label="Close more menu" onClick={() => setMoreOpen(false)} />}
    {moreOpen && <section className="mobile-more-sheet" aria-label="More destinations">
      <div className="mobile-more-heading">
        <div><span className="mobile-more-eyebrow">EXPLORE NAMMASPOT</span><strong>More to discover</strong></div>
        <button className="mobile-more-close" aria-label="Close menu" onClick={() => setMoreOpen(false)}><X size={18}/></button>
      </div>
      <button className="mobile-more-link" onClick={() => goFromMore("/categories")}>
        <span className="mobile-more-icon"><Grid2X2 size={19}/></span>
        <span><strong>Categories</strong><small>Browse by what you love</small></span>
        <ChevronRight size={17}/>
      </button>
      <button className="mobile-more-link" onClick={() => goFromMore("/featured")}>
        <span className="mobile-more-icon"><Sparkles size={19}/></span>
        <span><strong>Featured sellers</strong><small>Discover local favourites</small></span>
        <ChevronRight size={17}/>
      </button>
      <div className="mobile-more-divider" />
      {profile?.role === "seller" ? (
        <button className="mobile-more-link" onClick={() => goFromMore("/dashboard")}>
          <span className="mobile-more-icon"><Store size={19}/></span>
          <span><strong>Seller dashboard</strong><small>Manage your catalogue</small></span>
          <ChevronRight size={17}/>
        </button>
      ) : profile?.role === "admin" ? (
        <button className="mobile-more-link" onClick={() => goFromMore("/nammaspot-control-panel/dashboard")}>
          <span className="mobile-more-icon"><ShieldCheck size={19}/></span>
          <span><strong>Admin console</strong><small>Manage NammaSpot</small></span>
          <ChevronRight size={17}/>
        </button>
      ) : (
        <>
          <button className="mobile-more-link" onClick={() => goFromMore("/register")}>
            <span className="mobile-more-icon"><Store size={19}/></span>
            <span><strong>List your business</strong><small>Get discovered locally</small></span>
            <ChevronRight size={17}/>
          </button>
          <button className="mobile-more-link" onClick={() => goFromMore("/login")}>
            <span className="mobile-more-icon"><LogIn size={19}/></span>
            <span><strong>Seller login</strong><small>Open your seller space</small></span>
            <ChevronRight size={17}/>
          </button>
        </>
      )}
    </section>}
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      <button className={normalizedPath==="/"?"active":""} aria-current={normalizedPath==="/"?"page":undefined} onClick={()=>{setMoreOpen(false);go("/")}}>
        <span className="mobile-nav-icon"><Home size={20}/></span><span className="mobile-nav-label">Home</span>
      </button>
      <button className={normalizedPath.startsWith("/categories")?"active":""} aria-current={normalizedPath.startsWith("/categories")?"page":undefined} onClick={()=>{setMoreOpen(false);go("/categories")}}>
        <span className="mobile-nav-icon"><Grid2X2 size={20}/></span><span className="mobile-nav-label">Category</span>
      </button>
      <button className={isNearby?"active":""} aria-current={isNearby?"page":undefined} onClick={()=>{setMoreOpen(false);go("/explore?near=Chennai")}}>
        <span className="mobile-nav-icon"><MapPin size={20}/></span><span className="mobile-nav-label">Nearby</span>
      </button>
      <button className={normalizedPath.startsWith("/saved")?"active":""} aria-current={normalizedPath.startsWith("/saved")?"page":undefined} onClick={()=>{setMoreOpen(false);go("/saved")}}>
        <span className="mobile-nav-icon"><Heart size={20}/></span><span className="mobile-nav-label">Saved</span>
      </button>
      <button className={moreOpen||moreIsActive?"active":""} aria-expanded={moreOpen} aria-haspopup="true" onClick={()=>setMoreOpen((open)=>!open)}>
        <span className="mobile-nav-icon"><Menu size={20}/></span><span className="mobile-nav-label">More</span>
      </button>
    </nav>
  </>;
}

async function shareSeller(seller) {
  const url=location.origin+"/s/"+seller.slug;
  try {
    if (navigator.share) await navigator.share({title:seller.name,text:"Discover this seller on NammaSpot",url});
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
