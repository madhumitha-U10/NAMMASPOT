/** Category-specific pictograms with a consistent NammaSpot-friendly visual style. */
function ServiceIllustration({ type, size }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    style: { display: "block", flex: "none" }
  };
  const stroke = "#713344";
  const soft = "#F3DDE0";
  const cream = "#FFF7ED";

  if (type === "bridal") return <svg {...common}>
    <circle cx="32" cy="32" r="29" fill={cream}/>
    <path d="M18 47c1-8 6-12 14-12s13 4 14 12" fill={soft} stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M23 27c0-9 4-15 9-15s9 6 9 15v5c0 7-4 11-9 11s-9-4-9-11v-5Z" fill="#F8E5D8" stroke={stroke} strokeWidth="2.4"/>
    <path d="M21 28c-1-10 4-18 11-18 7 0 12 7 11 18l-5-8-6-3-6 5-5 6Z" fill={stroke}/>
    <path d="M25 30h4m6 0h4" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
    <path d="M29 36c2 2 4 2 6 0" stroke="#B66B78" strokeWidth="2" strokeLinecap="round"/>
    <path d="m46 13 1.5 4.5L52 19l-4.5 1.5L46 25l-1.5-4.5L40 19l4.5-1.5L46 13Z" fill="#C99A52"/>
    <circle cx="18" cy="19" r="2" fill="#C99A52"/>
  </svg>;

  if (type === "crochet") return <svg {...common}>
    <circle cx="32" cy="32" r="29" fill={cream}/>
    <path d="M20 37c-6-5-5-14 2-18 5-3 10-1 13 3 5 7 12 7 13 14 1 7-5 13-12 12-7 0-11-5-16-11Z" fill={soft} stroke={stroke} strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="M22 25c6 2 8 7 7 12m-4-16c9 4 12 11 10 19m-3-16c7 4 9 10 8 16m-17-8c4 6 10 9 16 9" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M42 12c3 4 3 8 0 11l-8 9" stroke="#C99A52" strokeWidth="3" strokeLinecap="round"/>
    <path d="M34 32c-2 2-2 4 0 5" stroke="#C99A52" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 46c3 2 5 2 8 0" stroke="#C99A52" strokeWidth="2.4" strokeLinecap="round"/>
  </svg>;

  return <svg {...common}>
    <circle cx="32" cy="32" r="29" fill={cream}/>
    <path d="m20 17 10 3-8 25c-.5 2-3 3-5 2-2-1-3-3-2-5l5-25Z" fill={soft} stroke={stroke} strokeWidth="2.3" strokeLinejoin="round"/>
    <path d="m20 17 10 3-2 6-10-3 2-6Z" fill="#C99A52" stroke={stroke} strokeWidth="2.1" strokeLinejoin="round"/>
    <path d="m39 13 9 3-2 7-9-3 2-7Z" fill="#C99A52" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round"/>
    <path d="m37 20 9 3-7 24c-.6 2-2.7 3-4.7 2.3-2-.7-3-2.8-2.3-4.8L37 20Z" fill="#D99AA5" stroke={stroke} strokeWidth="2.3" strokeLinejoin="round"/>
    <path d="m36 20 9 3" stroke={stroke} strokeWidth="2.3" strokeLinecap="round"/>
    <path d="m48 34 1.3 3.7L53 39l-3.7 1.3L48 44l-1.3-3.7L43 39l3.7-1.3L48 34Z" fill="#C99A52"/>
    <circle cx="18" cy="13" r="2" fill="#C99A52"/>
  </svg>;
}

export default function CategoryIcon({ category = "", size = 46, className = "" }) {
  const name = String(category).trim().toLowerCase();

  // These categories need purpose-drawn illustrations, not generic beauty/craft emoji.
  let illustration = null;
  if (/bridal|bridal makeup|bridal artist|wedding makeup/.test(name)) illustration = "bridal";
  else if (/crochet|crocheting|yarn craft/.test(name)) illustration = "crochet";
  else if (/beauty|salon|skin care|skincare|makeup|cosmetic|cosmetics|beautician/.test(name)) illustration = "beauty";

  if (illustration) {
    return <span className={className} role="img" aria-label={category || "Category"} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, minWidth: size, minHeight: size, flex: "none"
    }}><ServiceIllustration type={illustration} size={size} /></span>;
  }

  let glyph = "📍";
  if (/cake|bakery|bake|dessert|pastr|sweet/.test(name)) glyph = "🧁";
  else if (/flower|florist|bouquet/.test(name)) glyph = "💐";
  else if (/plant|nursery|garden|organic/.test(name)) glyph = "🪴";
  else if (/jewel|accessor|earring|gold|silver/.test(name)) glyph = "💎";
  else if (/fashion|clothing|apparel|boutique|dress/.test(name)) glyph = "👗";
  else if (/tailor|stitch|sewing|alteration/.test(name)) glyph = "🧵";
  else if (/shoe|footwear|sandal/.test(name)) glyph = "👟";
  else if (/bag|purse|handbag/.test(name)) glyph = "👜";
  else if (/home|decor|interior|furniture|living/.test(name)) glyph = "🛋️";
  else if (/health|wellness|yoga|fitness/.test(name)) glyph = "🌿";
  else if (/handmade|craft|handicraft|pottery/.test(name)) glyph = "🏺";
  else if (/service|repair|clean|consult|professional/.test(name)) glyph = "🛠️";
  else if (/food|snack|cater|beverage|restaurant|tiffin/.test(name)) glyph = "🍲";
  else if (/fruit|vegetable|grocery|provision/.test(name)) glyph = "🥑";
  else if (/gift|present|hamper/.test(name)) glyph = "🎁";
  else if (/book|stationery|education|class|learn|course|training|school/.test(name)) glyph = "📚";
  else if (/pet|animal|groom/.test(name)) glyph = "🐾";
  else if (/photo|camera|photograph/.test(name)) glyph = "📸";
  else if (/tech|computer|digital|mobile|electronic|gadget/.test(name)) glyph = "🎧";
  else if (/art|paint|illustrat/.test(name)) glyph = "🎨";
  else if (/toy|kid|child|baby/.test(name)) glyph = "🧸";
  else if (/event|party|wedding/.test(name)) glyph = "🎉";
  else if (/music|instrument|dance/.test(name)) glyph = "🎵";
  else if (/other|misc|general|more/.test(name)) glyph = "✦";

  return <span className={className} role="img" aria-label={category || "Category"} style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: size, height: size, minWidth: size, minHeight: size, flex: "none",
    fontSize: Math.round(size * 0.68), lineHeight: 1,
    fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
    fontWeight: 400, filter: "drop-shadow(0 2px 1px rgba(74,35,27,.08))"
  }}>{glyph}</span>;
}
