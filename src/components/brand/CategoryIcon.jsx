const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

/** Consistent burgundy-outline illustrations for NammaSpot's category tiles. */
export default function CategoryIcon({ category = "", size = 46, className = "" }) {
  const name = String(category).trim().toLowerCase();
  let art;
  if (/food|bakery|bake|cake|snack/.test(name)) art = <><path d="M8 25h30l-3 14H11z"/><path d="M8 25c0-4 3-6 7-6 2-6 7-8 11-4 4-3 9-1 10 4 3 0 5 3 5 6Z"/><path d="M15 30h16"/><path d="M17 19c-2-2-2-4 0-6m7 6c-2-2-2-4 0-6m7 6c-2-2-2-4 0-6"/><circle cx="23" cy="12" r="1.5"/></>;
  else if (/mehendi|henna/.test(name)) art = <><path d="M23 8c-4-6-11-1-7 5-7-1-8 7-1 9-5 5 1 11 7 6 6 5 12-1 7-6 7-2 6-10-1-9 4-6-3-11-7-5Z"/><circle cx="23" cy="20" r="4"/><path d="M23 24v14m0-6-6-4m6 0 6-4"/></>;
  else if (/bridal|makeup/.test(name)) art = <><path d="m15 8 16 16-5 5L10 13z"/><path d="m27 29 5 5 5-5-5-5z"/><path d="m10 13-3 3 6 6 3-3"/><path d="m32 34 4 4"/></>;
  else if (/crochet|handmade|craft/.test(name)) art = <><circle cx="20" cy="23" r="11"/><path d="M12 18c5 1 10 5 15 10M12 26c4-1 8-5 11-9M17 13c3 4 7 8 13 11M29 10l7 7c2 2 0 5-3 4l-7-3"/><path d="M31 9c3-3 7 0 5 3l-3 3"/><path d="M14 32 9 37"/></>;
  else if (/jewel|accessor/.test(name)) art = <><path d="M7 16 15 7h16l8 9-16 23z"/><path d="M7 16h32M15 7l8 32 8-32M7 16l16 23 16-23"/></>;
  else if (/boutique|fashion|clothing|apparel/.test(name)) art = <><path d="M13 13a10 10 0 0 1 20 0"/><path d="M9 14h28v25H9z"/><path d="M13 19v15m20-15v15"/></>;
  else if (/home|decor|interior/.test(name)) art = <><path d="M16 39V22h14v17"/><path d="M13 22c-5-3-3-10 3-10 1-7 12-7 14 0 6 0 8 7 3 10z"/><path d="M19 7V4m8 4 2-3m-14 6-3-3"/></>;
  else if (/gift|present/.test(name)) art = <><path d="M8 19h30v20H8zM5 13h36v6H5zM23 13c-10 0-12-9-5-9 4 0 5 9 5 9Zm0 0c0-9 5-12 9-9 5 4-2 9-9 9Z"/><path d="M23 19v20"/></>;
  else if (/art|paint|illustrat/.test(name)) art = <><path d="M23 6c-10 0-17 7-17 16s7 16 17 16h3c3 0 4-4 1-6-2-2-1-5 2-5h3c5 0 8-4 6-9-2-7-8-12-15-12Z"/><circle cx="14" cy="19" r="1.5"/><circle cx="20" cy="13" r="1.5"/><circle cx="29" cy="14" r="1.5"/><circle cx="13" cy="26" r="1.5"/></>;
  else if (/photo|camera/.test(name)) art = <><path d="M6 15h8l3-5h12l3 5h8v23H6z"/><circle cx="23" cy="26" r="7"/><circle cx="23" cy="26" r="3"/><path d="M33 20h1"/></>;
  else if (/beauty|salon|skin/.test(name)) art = <><path d="m23 5 3.5 10.5L37 19l-10.5 3.5L23 33l-3.5-10.5L9 19l10.5-3.5L23 5Z"/><path d="m36 29 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="m10 29 1.5 3.5L15 34l-3.5 1.5L10 39l-1.5-3.5L5 34l3.5-1.5z"/></>;
  else if (/service|repair|tutor|clean|consult/.test(name)) art = <><path d="m9 11 5-5 7 7-5 5z"/><path d="m28 30 5-5 7 7-5 5z"/><path d="m17 30 13-13"/><path d="M8 38 5 35l10-10 3 3z"/><path d="m29 8 3-3 9 9-3 3"/></>;
  else if (/plant|flower|florist|garden|bouquet/.test(name)) art = <><path d="M23 39V23"/><path d="M23 23C9 23 8 13 12 9c7 0 11 5 11 14Z"/><path d="M23 23c0-12 9-17 14-12 2 7-4 12-14 12Z"/><circle cx="23" cy="17" r="5"/><path d="M23 12c-5-6 2-10 5-5 4-5 10 0 5 5 6 3 2 9-3 7-2 6-8 4-7-1-6 1-7-5 0-6Z"/><path d="M16 39h14"/></>;
  else if (/tutor|education|class|learn|course|training|book/.test(name)) art = <><path d="m5 13 18-7 18 7-18 7-18-7Z"/><path d="M12 17v11c7 6 15 6 22 0V17"/><path d="M41 14v14"/></>;
  else if (/tailor|stitch|alteration|sewing/.test(name)) art = <><path d="M8 8c-3-3-6 1-3 4l26 26c3 3 7-1 4-4L8 8Z"/><path d="m25 26 10-10"/><circle cx="36" cy="10" r="4"/><path d="M10 29 5 34m9-1-5 5"/></>;
  else if (/pet|animal|groom/.test(name)) art = <><circle cx="13" cy="13" r="4"/><circle cx="23" cy="8" r="4"/><circle cx="33" cy="13" r="4"/><circle cx="37" cy="23" r="4"/><path d="M23 20c-7 0-13 7-12 13 1 5 7 4 12 2 5 2 11 3 12-2 1-6-5-13-12-13Z"/></>;
  else if (/tech|computer|digital|mobile|electronic/.test(name)) art = <><rect x="8" y="7" width="30" height="23" rx="3"/><path d="M18 38h10m-5-8v8M15 13h16m-16 5h11"/></>;
  else if (/other|misc|general/.test(name)) art = <><circle cx="12" cy="23" r="2"/><circle cx="23" cy="23" r="2"/><circle cx="34" cy="23" r="2"/><path d="m29 13 10 10-10 10"/></>;
  else art = <><path d="M23 40s-14-13-14-23a14 14 0 1 1 28 0c0 10-14 23-14 23Z"/><circle cx="23" cy="17" r="4.5"/></>;
  return <svg className={className} width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" focusable="false" fill="none" stroke="#762a38" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{display:"block",width:size,height:size,minWidth:size,minHeight:size,flex:"none",overflow:"visible",color:"#762a38",opacity:1,visibility:"visible"}}>{art}</svg>;
}
