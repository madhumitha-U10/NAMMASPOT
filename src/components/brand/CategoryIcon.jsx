const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

/** Minimal, coordinated line illustrations for NammaSpot category tiles. */
export default function CategoryIcon({ category = "", size = 46, className = "" }) {
  const name = String(category).trim().toLowerCase();
  let art;

  if (/cake|bakery|bake|dessert|pastr/.test(name)) art = <>
    <path d="M9 25h28l-2.5 13h-23L9 25Z" />
    <path d="M9 25c0-4 4-6 7-5 2-5 6-7 9-4 4-3 9-1 10 4 2 0 4 2 4 5" />
    <path d="M15 30v4m8-4v4m8-4v4" />
    <path d="M23 13v4m-5-5 1 2m9-2-1 2" />
    <path d="M23 8v2" />
    <path d="M7 39h32" />
  </>;
  else if (/flower|florist|garden|bouquet|plant/.test(name)) art = <>
    <path d="M23 39V25m0 8c-6 0-10-3-12-8 6-1 10 1 12 8Zm0-5c6-1 10-5 11-10-6 0-10 3-11 10Z" />
    <path d="M23 10c2-5 7-4 8 0 5-1 7 4 3 7 2 5-3 8-7 5-3 4-8 1-7-4-5-2-4-8 1-8Z" />
    <circle cx="23" cy="16" r="3" />
    <path d="M16 40h14" />
  </>;
  else if (/jewel|accessor|earring|gold|silver/.test(name)) art = <>
    <path d="M14 9a5 5 0 1 1 10 0c0 3-2 5-5 5s-5-2-5-5Z" />
    <path d="M19 14v6l-7 9a7 7 0 0 0 14 0l-7-9" />
    <path d="M29 12a4 4 0 1 1 8 0c0 2-2 4-4 4s-4-2-4-4Z" />
    <path d="M33 16v5l-5 7a5 5 0 0 0 10 0l-5-7" />
  </>;
  else if (/fashion|clothing|apparel|boutique|dress|tailor|stitch|sewing/.test(name)) art = <>
    <path d="m17 9 6 4 6-4 8 6-5 7-4-3v19H18V19l-4 3-5-7 8-6Z" />
    <path d="M19 10c0 4 2 6 4 6s4-2 4-6" />
    <path d="M18 25h10" />
  </>;
  else if (/home|decor|interior|furniture|living/.test(name)) art = <>
    <path d="m7 22 16-13 16 13" />
    <path d="M11 20v19h24V20" />
    <path d="M17 39V27h12v12" />
    <path d="M15 23h5m-5 3h5" />
    <path d="M30 13v-4h4v7" />
  </>;
  else if (/health|wellness|yoga|fitness|organic/.test(name)) art = <>
    <path d="M23 39V23" />
    <path d="M23 31c-9 0-14-5-14-12 8 0 13 4 14 12Z" />
    <path d="M23 26c0-9 6-15 14-15 0 8-5 14-14 15Z" />
    <path d="M23 23c-5-7-4-13 0-17 5 5 5 11 0 17Z" />
    <path d="M15 39h16" />
  </>;
  else if (/beauty|salon|skin|makeup|bridal|cosmetic/.test(name)) art = <>
    <path d="m23 7 3.6 10.4L37 21l-10.4 3.6L23 35l-3.6-10.4L9 21l10.4-3.6L23 7Z" />
    <path d="m35 30 1.6 4.4L41 36l-4.4 1.6L35 42l-1.6-4.4L29 36l4.4-1.6L35 30Z" />
  </>;
  else if (/handmade|craft|crochet|handicraft|pottery|art/.test(name)) art = <>
    <path d="M14 9h18l-2 6H16l-2-6Z" />
    <path d="M16 15c0 5-3 7-3 13 0 6 4 10 10 10s10-4 10-10c0-6-3-8-3-13" />
    <path d="M14 25c6 3 12 3 18 0" />
    <path d="M18 31h10" />
  </>;
  else if (/service|repair|tutor|clean|consult|professional/.test(name)) art = <>
    <path d="M28 10a10 10 0 0 0-12 12L8 30a4 4 0 0 0 6 6l8-8a10 10 0 0 0 12-12l-6 6-6-6 6-6Z" />
    <path d="m11 31 2 2" />
  </>;
  else if (/food|snack|cater|beverage|restaurant|tiffin/.test(name)) art = <>
    <path d="M10 22h26l-3 15H13l-3-15Z" />
    <path d="M8 22c0-4 4-7 8-5 3-6 10-6 13-1 4-1 7 2 7 6" />
    <path d="M16 13c-2-2 1-4 0-6m7 6c-2-2 1-4 0-6m7 6c-2-2 1-4 0-6" />
    <path d="M7 40h32" />
  </>;
  else if (/gift|present|hamper/.test(name)) art = <>
    <path d="M8 19h30v20H8z" />
    <path d="M5 13h36v7H5zM23 13v26" />
    <path d="M23 13c-8 0-12-2-11-6 1-4 9-3 11 6Z" />
    <path d="M23 13c8 0 12-2 11-6-1-4-9-3-11 6Z" />
  </>;
  else if (/book|stationery|education|class|learn|course|training|school/.test(name)) art = <>
    <path d="M8 11h20a5 5 0 0 1 5 5v22H13a5 5 0 0 1-5-5V11Z" />
    <path d="M33 16a5 5 0 0 1 5-5v27h-5" />
    <path d="M14 18h11m-11 6h11m-11 6h8" />
  </>;
  else if (/pet|animal|groom/.test(name)) art = <>
    <ellipse cx="23" cy="29" rx="11" ry="8" />
    <ellipse cx="12" cy="17" rx="3.5" ry="5" transform="rotate(-25 12 17)" />
    <ellipse cx="21" cy="12" rx="3.5" ry="5" />
    <ellipse cx="31" cy="15" rx="3.5" ry="5" transform="rotate(20 31 15)" />
    <ellipse cx="37" cy="23" rx="3.5" ry="4.5" transform="rotate(35 37 23)" />
    <path d="M19 29c2-2 6-2 8 0" />
  </>;
  else if (/photo|camera|photograph/.test(name)) art = <>
    <path d="M7 16h8l3-5h10l3 5h8v22H7V16Z" />
    <circle cx="23" cy="26" r="7" />
    <circle cx="23" cy="26" r="3" />
    <path d="M33 21h.1" />
  </>;
  else if (/tech|computer|digital|mobile|electronic|gadget/.test(name)) art = <>
    <rect x="10" y="7" width="26" height="29" rx="4" />
    <path d="M18 12h10m-10 5h10m-5 14h.1" />
    <path d="M6 40h34" />
  </>;
  else if (/other|misc|general|more/.test(name)) art = <>
    <rect x="8" y="8" width="10" height="10" rx="3" />
    <rect x="28" y="8" width="10" height="10" rx="3" />
    <rect x="8" y="28" width="10" height="10" rx="3" />
    <rect x="28" y="28" width="10" height="10" rx="3" />
  </>;
  else art = <>
    <path d="M23 39S9 27 9 17a14 14 0 1 1 28 0c0 10-14 22-14 22Z" />
    <circle cx="23" cy="17" r="4.5" />
  </>;

  return <svg className={className} width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", width: size, height: size, minWidth: size, minHeight: size, flex: "none", overflow: "visible", color: "currentColor", opacity: 1, visibility: "visible" }}>{art}</svg>;
}
