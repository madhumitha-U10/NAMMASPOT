/** Category-specific pictograms: clear at a glance, with a consistent visual weight. */
export default function CategoryIcon({ category = "", size = 46, className = "" }) {
  const name = String(category).trim().toLowerCase();
  let glyph = "📍";
  if (/cake|bakery|bake|dessert|pastr|sweet/.test(name)) glyph = "🧁";
  else if (/flower|florist|garden|bouquet/.test(name)) glyph = "💐";
  else if (/plant|nursery|garden|organic/.test(name)) glyph = "🪴";
  else if (/jewel|accessor|earring|gold|silver/.test(name)) glyph = "💎";
  else if (/fashion|clothing|apparel|boutique|dress/.test(name)) glyph = "👗";
  else if (/tailor|stitch|sewing|alteration/.test(name)) glyph = "🧵";
  else if (/shoe|footwear|sandal/.test(name)) glyph = "👟";
  else if (/bag|purse|handbag/.test(name)) glyph = "👜";
  else if (/home|decor|interior|furniture|living/.test(name)) glyph = "🛋️";
  else if (/health|wellness|yoga|fitness/.test(name)) glyph = "🌿";
  else if (/beauty|salon|skin|makeup|bridal|cosmetic/.test(name)) glyph = "🧴";
  else if (/handmade|craft|crochet|handicraft|pottery/.test(name)) glyph = "🏺";
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

  return <span
    className={className}
    role="img"
    aria-label={category || "Category"}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      flex: "none",
      fontSize: Math.round(size * 0.68),
      lineHeight: 1,
      fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
      fontWeight: 400,
      filter: "drop-shadow(0 2px 1px rgba(74,35,27,.08))"
    }}
  >{glyph}</span>;
}
