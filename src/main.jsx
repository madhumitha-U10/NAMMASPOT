import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Heart,
  Share2,
  Phone,
  Instagram,
  MessageCircle,
  Plus,
  ArrowLeft,
  Menu,
  X,
  Store,
  ChevronRight,
  Home,
  Compass,
  Grid2X2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const seed = [
  {
    id: "chennai-crochets",
    name: "Chennai Crochets",
    category: "Crochet",
    location: "Anna Nagar, Chennai",
    description: "Handmade crochet accessories made locally with care.",
    phone: "",
    instagram: "https://instagram.com/",
    featured: true,
    products: [
      { id: "p1", name: "Crochet Flower Keychain", price: 149, description: "Colourful handmade keychain.", available: true },
      { id: "p2", name: "Mini Crochet Bouquet", price: 299, description: "A small handmade bouquet for gifting.", available: true },
    ],
  },
  {
    id: "madras-bites",
    name: "Madras Bites",
    category: "Bakery",
    location: "T. Nagar, Chennai",
    description: "Homemade snacks and treats for local orders.",
    phone: "",
    instagram: "https://instagram.com/",
    featured: true,
    products: [
      { id: "p3", name: "Murukku Box", price: 180, description: "Fresh crunchy murukku.", available: true },
    ],
  },
  {
    id: "tamil-thread",
    name: "Tamil Thread",
    category: "Art",
    location: "Mylapore, Chennai",
    description: "Simple handmade accessories inspired by Chennai.",
    phone: "",
    instagram: "https://instagram.com/",
    featured: false,
    products: [
      { id: "p4", name: "Beaded Bracelet", price: 199, description: "Handmade everyday bracelet.", available: true },
    ],
  },
];

const cats = ["All", "Bakery", "Mehendi", "Crochet", "Makeup", "Art", "Fashion", "Food", "Accessories", "Gifts", "Home Decor", "Jewellery", "Beauty", "Services"];

function App() {
  const [path, setPath] = useState(() => location.hash.slice(1) || "/");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nammaspot-saved") || "[]");
    } catch {
      return [];
    }
  });
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onHash = () => setPath(location.hash.slice(1) || "/");
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem("nammaspot-saved", JSON.stringify(saved));
  }, [saved]);

  const go = (next) => {
    location.hash = next;
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSave = (id) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const share = async (seller) => {
    const url = location.origin + location.pathname + "#/s/" + seller.id;
    try {
      if (navigator.share) {
        await navigator.share({ title: seller.name, text: "Discover this local seller on NammaSpot", url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Seller link copied.");
      }
    } catch {
      // User cancelled the share sheet.
    }
  };

  const searchedSellers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seed;
    return seed.filter((seller) =>
      [seller.name, seller.category, seller.location, seller.description, ...seller.products.map((product) => product.name)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  const isHome = path === "/";
  const isExplore = path.startsWith("/explore");
  const isCategories = path.startsWith("/categories");
  const isSaved = path.startsWith("/saved");
  const isFeatured = path.startsWith("/featured");

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("/")} aria-label="Go to NammaSpot home">
          <span>Namma</span>Spot
        </button>

        <nav className={menu ? "desktop-nav open" : "desktop-nav"} aria-label="Primary navigation">
          <button className={isHome ? "nav-active" : ""} onClick={() => go("/")}>Home</button>
          <button className={isExplore ? "nav-active" : ""} onClick={() => go("/explore")}>Explore</button>
          <button className={isCategories ? "nav-active" : ""} onClick={() => go("/categories")}>Categories</button>
          <button className={isSaved ? "nav-active" : ""} onClick={() => go("/saved")}>Saved</button>
          <button className="seller-cta" onClick={() => go("/register")}>List your business</button>
        </nav>

        <div className="header-actions">
          <button className="icon-button" onClick={() => go("/explore")} aria-label="Search">
            <Search size={22} />
          </button>
          <button className="icon-button menu-toggle" onClick={() => setMenu((value) => !value)} aria-label={menu ? "Close menu" : "Open menu"}>
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {notice && <button className="notice" onClick={() => setNotice("")}>{notice}</button>}

      {isHome && (
        <Home
          go={go}
          query={query}
          setQuery={setQuery}
          sellers={seed}
        />
      )}

      {isExplore && (
        <Explore
          go={go}
          query={query}
          setQuery={setQuery}
          sellers={searchedSellers}
          toggleSave={toggleSave}
          saved={saved}
        />
      )}

      {isCategories && <Categories go={go} />}
      {isSaved && <Saved go={go} sellers={seed.filter((seller) => saved.includes(seller.id))} toggleSave={toggleSave} />}

      {isFeatured && (
        <Explore
          go={go}
          query=""
          setQuery={() => {}}
          sellers={seed.filter((seller) => seller.featured)}
          toggleSave={toggleSave}
          saved={saved}
          title="Featured local sellers"
          eyebrow="HANDPICKED"
        />
      )}

      {path.startsWith("/s/") && (
        <Seller
          go={go}
          seller={seed.find((seller) => seller.id === path.split("/")[2])}
          saved={saved}
          toggleSave={toggleSave}
          share={share}
        />
      )}

      {path === "/register" && <Register go={go} />}

      <MobileBottomNav
        path={path}
        go={go}
      />
    </div>
  );
}

function Home({ go, query, setQuery, sellers }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">CHENNAI · TAMIL NADU</div>
          <h1>
            Namma Ooru.<br />
            Namma People.<br />
            <em>Namma Spot.</em>
          </h1>
          <p className="hero-copy">
            Discover the authentic flavours, crafts and talents of Chennai&apos;s vibrant local scene.
            Handcrafted by the community, for the community.
          </p>

          <div className="hero-search">
            <Search size={24} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && go("/explore")}
              placeholder="Try 'bridal mehendi Adyar' or 'eggless cake'"
              aria-label="Search local sellers"
            />
          </div>
          <button className="hero-search-button" onClick={() => go("/explore")}>Search</button>

          <div className="quick-chips" aria-label="Popular categories">
            {["Bakery", "Mehendi", "Crochet", "Makeup", "Art"].map((category) => (
              <button key={category} onClick={() => go("/explore?cat=" + encodeURIComponent(category))}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AROUND CHENNAI</div>
            <h2>Little finds, local stories.</h2>
          </div>
          <button className="text-link" onClick={() => go("/explore")}>
            Explore all <ChevronRight size={17} />
          </button>
        </div>

        <div className="seller-preview-grid">
          {sellers.map((seller, index) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              index={index}
              go={go}
            />
          ))}
        </div>
      </section>

      <section className="story-strip">
        <div className="story-icon"><Store size={28} /></div>
        <div>
          <div className="eyebrow">FOR LOCAL MAKERS</div>
          <h2>Your work deserves a spot.</h2>
          <p>Put your products, story and contact details in one simple digital catalogue.</p>
        </div>
        <button onClick={() => go("/register")}>List your business <ChevronRight size={18} /></button>
      </section>
    </main>
  );
}

function Explore({ go, query, setQuery, sellers, toggleSave, saved, title = "Explore local sellers", eyebrow = "DISCOVER" }) {
  const cat = new URLSearchParams(location.hash.split("?")[1] || "").get("cat") || "All";
  const filtered = sellers.filter((seller) => cat === "All" || seller.category === cat);

  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>Search by seller, product, category or neighbourhood.</p>
      </div>

      {setQuery && (
        <div className="explore-search">
          <Search size={21} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sellers, products or places"
          />
          {query && <button onClick={() => setQuery("")}>Clear</button>}
        </div>
      )}

      <div className="category-row">
        {cats.map((category) => (
          <button
            key={category}
            className={category === cat ? "active" : ""}
            onClick={() => go(category === "All" ? "/explore" : "/explore?cat=" + encodeURIComponent(category))}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="seller-list">
        {filtered.map((seller, index) => (
          <SellerCard
            key={seller.id}
            seller={seller}
            index={index}
            go={go}
            toggleSave={toggleSave}
            saved={saved.includes(seller.id)}
            detailed
          />
        ))}
      </div>

      {!filtered.length && (
        <Empty
          title="Nothing here yet"
          text="Try another search or choose a different category."
        />
      )}
    </main>
  );
}

function SellerCard({ seller, index = 0, go, toggleSave, saved, detailed = false }) {
  return (
    <article className={detailed ? "seller-card detailed" : "seller-card"}>
      <button className={"seller-cover cover-" + ((index % 4) + 1)} onClick={() => go("/s/" + seller.id)} aria-label={"Open " + seller.name}>
        <span className="category-label">{seller.category}</span>
        {seller.featured && <span className="featured-label"><Sparkles size={13} /> Featured</span>}
      </button>

      <div className="seller-card-body">
        <div className="seller-card-top">
          <button className="seller-title-button" onClick={() => go("/s/" + seller.id)}>
            <h3>{seller.name}</h3>
            <p><MapPin size={14} /> {seller.location}</p>
          </button>

          {toggleSave && (
            <button
              className={saved ? "save-button is-saved" : "save-button"}
              onClick={() => toggleSave(seller.id)}
              aria-label={saved ? "Remove saved seller" : "Save seller"}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {detailed && <p className="seller-description">{seller.description}</p>}

        <div className="product-lines">
          {seller.products.slice(0, 2).map((product) => (
            <span key={product.id}>{product.name} · ₹{product.price}</span>
          ))}
        </div>

        <button className="card-link" onClick={() => go("/s/" + seller.id)}>
          View catalogue <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

function Categories({ go }) {
  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">BROWSE</div>
        <h1>Find your kind of local.</h1>
        <p>From a box of murukku to a hand-painted gift, start with what you need.</p>
      </div>

      <div className="category-grid-large">
        {cats.slice(1, 10).map((category, index) => (
          <button key={category} onClick={() => go("/explore?cat=" + encodeURIComponent(category))}>
            <span>0{index + 1}</span>
            <strong>{category}</strong>
            <ChevronRight size={19} />
          </button>
        ))}
      </div>
    </main>
  );
}

function Saved({ go, sellers, toggleSave }) {
  return (
    <main className="page">
      <div className="page-title">
        <div className="eyebrow">YOUR LIST</div>
        <h1>Places you want to remember.</h1>
        <p>Keep your local favourites close by.</p>
      </div>

      {sellers.length ? (
        <div className="seller-list">
          {sellers.map((seller, index) => (
            <SellerCard key={seller.id} seller={seller} index={index} go={go} toggleSave={toggleSave} saved detailed />
          ))}
        </div>
      ) : (
        <Empty title="Nothing saved yet" text="Tap the heart on a seller and they will appear here." />
      )}
    </main>
  );
}

function Seller({ go, seller, saved, toggleSave, share }) {
  if (!seller) {
    return (
      <main className="page">
        <Empty title="Seller not found" text="This catalogue may no longer be available." />
      </main>
    );
  }

  return (
    <main className="seller-page">
      <button className="back-button" onClick={() => go("/explore")}><ArrowLeft size={17} /> Back to explore</button>

      <section className="seller-profile">
        <div className="profile-cover cover-1">
          <span>{seller.category}</span>
        </div>

        <div className="profile-main">
          <div className="profile-avatar">{seller.name.charAt(0)}</div>
          <div className="profile-copy">
            <div className="eyebrow">{seller.category}</div>
            <h1>{seller.name}</h1>
            <p className="profile-location"><MapPin size={16} /> {seller.location}</p>
            <p>{seller.description}</p>

            <div className="profile-actions">
              <button className="primary-button" onClick={() => seller.phone ? (location.href = "tel:" + seller.phone) : setTimeout(() => alert("Seller phone is not listed yet."), 0)}>
                <Phone size={17} /> Call
              </button>
              <button className="secondary-button" onClick={() => share(seller)}><Share2 size={17} /> Share</button>
              <button className={saved.includes(seller.id) ? "secondary-button saved-action" : "secondary-button"} onClick={() => toggleSave(seller.id)}>
                <Heart size={17} fill={saved.includes(seller.id) ? "currentColor" : "none"} />
                {saved.includes(seller.id) ? "Saved" : "Save"}
              </button>
              {seller.instagram && (
                <a className="secondary-button" href={seller.instagram} target="_blank" rel="noreferrer">
                  <Instagram size={17} /> Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="catalogue-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE CATALOGUE</div>
            <h2>Products & favourites.</h2>
          </div>
        </div>

        <div className="product-grid">
          {seller.products.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className={"product-image product-" + ((index % 3) + 1)}>
                <span>{product.name.charAt(0)}</span>
              </div>
              <div className="product-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-meta">
                  <strong>₹{product.price}</strong>
                  <small>{product.available ? "Available" : "Currently unavailable"}</small>
                </div>
                <button
                  className="primary-button full-button"
                  onClick={() => {
                    const message = encodeURIComponent("Hi, I found " + product.name + " on NammaSpot. Is it available?");
                    location.href = "https://wa.me/?text=" + message;
                  }}
                >
                  <MessageCircle size={16} /> Enquire on WhatsApp
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Register({ go }) {
  const [data, setData] = useState({
    business: "",
    owner: "",
    phone: "",
    category: "Crochet",
    description: "",
    location: "",
  });
  const [status, setStatus] = useState("");

  const update = (key, value) => setData((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();

    if (!data.business || !data.owner || !data.phone || !data.description) {
      setStatus("Please fill the required fields.");
      return;
    }

    localStorage.setItem(
      "nammaspot-registration",
      JSON.stringify({ ...data, status: "pending", createdAt: new Date().toISOString() })
    );

    setStatus("Your request is saved as pending on this device. Connect the production backend before accepting real seller registrations.");
  };

  return (
    <main className="page form-page">
      <button className="back-button" onClick={() => go("/")}><ArrowLeft size={17} /> Home</button>

      <div className="page-title">
        <div className="eyebrow">FOR SELLERS</div>
        <h1>Let your local story have a page.</h1>
        <p>Share your shop, products and contact details in one simple catalogue.</p>
      </div>

      <form onSubmit={submit} className="seller-form">
        <label>Business name *<input value={data.business} onChange={(event) => update("business", event.target.value)} required /></label>
        <label>Your name *<input value={data.owner} onChange={(event) => update("owner", event.target.value)} required /></label>
        <label>Phone *<input type="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} required /></label>
        <label>Category
          <select value={data.category} onChange={(event) => update("category", event.target.value)}>
            {cats.slice(1).map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>Location or Google Maps URL
          <input value={data.location} onChange={(event) => update("location", event.target.value)} placeholder="Paste a location link (optional)" />
        </label>
        <label>About your business *<textarea value={data.description} onChange={(event) => update("description", event.target.value)} maxLength={300} required /></label>

        <button className="primary-button full-button" type="submit"><Plus size={18} /> Submit for review</button>

        {status && (
          <div className="form-status">
            <CheckCircle size={18} /> {status}
          </div>
        )}
      </form>
    </main>
  );
}

function Empty({ title, text }) {
  return (
    <div className="empty-state">
      <Heart size={27} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function MobileBottomNav({ path, go }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <button className={path === "/" ? "active" : ""} onClick={() => go("/")}>
        <Home size={22} /><span>Home</span>
      </button>
      <button className={path.startsWith("/explore") ? "active" : ""} onClick={() => go("/explore")}>
        <Compass size={22} /><span>Explore</span>
      </button>
      <button className={path.startsWith("/categories") ? "active" : ""} onClick={() => go("/categories")}>
        <Grid2X2 size={22} /><span>Categories</span>
      </button>
      <button className={path.startsWith("/near") ? "active" : ""} onClick={() => go("/explore")}>
        <MapPin size={22} /><span>Near me</span>
      </button>
      <button className={path.startsWith("/featured") ? "active" : ""} onClick={() => go("/featured")}>
        <Sparkles size={22} /><span>Featured</span>
      </button>
    </nav>
  );
}

createRoot(document.getElementById("root")).render(<App />);
