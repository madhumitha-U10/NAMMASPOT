import React from "react";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

/** Small inline category illustrations; no external image requests. */
export default function CategoryIcon({ category = "", size = 46, className = "" }) {
  const name = String(category).trim().toLowerCase();
  let art;
  if (/food|bakery|bake|cake|snack/.test(name)) art = <><path d="M12 20h24l-2-15H14z"/><path d="M17 13c0-4 4-4 4 0s4 4 4 0 4-4 4 0"/><path d="M9 20h30v5H9z"/></>;
  else if (/mehendi|henna/.test(name)) art = <><path d="M23 39c-8-3-12-10-11-19 1-5 5-8 9-5l2 4 3-4c4-3 8 0 9 5 1 9-4 16-12 19Z"/><path d="M23 34V17m0 8-5-4m5 9 5-5"/><circle cx="23" cy="12" r="2"/></>;
  else if (/bridal|makeup/.test(name)) art = <><path d="M23 7c-8 0-13 7-13 16s5 16 13 16 13-7 13-16S31 7 23 7Z"/><path d="M15 19l5 2m6 0 5-2M20 29c2 2 4 2 6 0"/><path d="M17 6c2-3 10-3 12 0"/></>;
  else if (/crochet|handmade|craft/.test(name)) art = <><path d="M12 13c0-4 5-6 8-2l7 8c3 3 0 8-4 6l-8-5c-5-3-8 1-6 5l5 8"/><path d="M27 9c4-3 8 1 6 5l-4 6m-7 11 5-5m-15-8 6-4m5 16 7 3"/></>;
  else if (/jewel|accessor/.test(name)) art = <><path d="M12 14 18 7h12l6 7-12 24z"/><path d="M12 14h24M18 7l6 31 6-31m-18 7 12 24 12-24"/></>;
  else if (/boutique|fashion|clothing|apparel/.test(name)) art = <><path d="m17 10 6-4 6 4 9 5-5 8-5-3v17H16V20l-5 3-5-8z"/><path d="M19 8c0 5 8 5 8 0"/></>;
  else if (/home|decor|interior/.test(name)) art = <><path d="m6 22 17-15 17 15"/><path d="M11 19v19h24V19M19 38V26h8v12"/><path d="M31 12V8h4v8"/></>;
  else if (/gift|present/.test(name)) art = <><path d="M8 19h30v20H8zM5 13h36v6H5zM23 13c-10 0-12-9-5-9 4 0 5 9 5 9Zm0 0c0-9 5-12 9-9 5 4-2 9-9 9Z"/><path d="M23 19v20"/></>;
  else if (/art|paint|illustrat/.test(name)) art = <><path d="M23 6c-10 0-17 7-17 16s7 16 17 16h3c3 0 4-4 1-6-2-2-1-5 2-5h3c5 0 8-4 6-9-2-7-8-12-15-12Z"/><circle cx="14" cy="19" r="1.5"/><circle cx="20" cy="13" r="1.5"/><circle cx="29" cy="14" r="1.5"/></>;
  else if (/photo|camera/.test(name)) art = <><path d="M6 15h8l3-5h12l3 5h8v23H6z"/><circle cx="23" cy="26" r="7"/><circle cx="23" cy="26" r="3"/><path d="M33 20h1"/></>;
  else if (/beauty|salon|skin/.test(name)) art = <><path d="M18 7h10v5l-2 4v21H17V16l-2-4V7z"/><path d="M18 12h10M17 22h9"/><path d="M31 10c6 5 7 12 3 18"/></>;
  else if (/service|repair|tutor|clean|consult/.test(name)) art = <><path d="M16 7h14v7H16z"/><path d="M12 14h22v24H12z"/><path d="m18 26 4 4 8-9"/><path d="M7 20v13m30-13v13"/></>;
  else art = <><path d="M23 40s-14-13-14-23a14 14 0 1 1 28 0c0 10-14 23-14 23Z"/><circle cx="23" cy="17" r="4.5"/></>;
  return <svg className={className} width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" focusable="false" {...line}>{art}</svg>;
}
