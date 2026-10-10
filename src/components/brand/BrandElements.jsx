import React from "react";

/** A quiet, repeating kolam-inspired dot divider. Decorative only. */
export function KolamDivider({ className = "", title = "Kolam divider" }) {
  return (
    <svg className={className} viewBox="0 0 320 26" width="100%" height="26" fill="none" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13h20m-10-10v20M26 13c7-10 13-10 20 0-7 10-13 10-20 0Zm20 0h20m-10-10v20M66 13c7-10 13-10 20 0-7 10-13 10-20 0Z"/>
        <path d="M106 13h20m-10-10v20M126 13c7-10 13-10 20 0-7 10-13 10-20 0Zm20 0h20m-10-10v20M166 13c7-10 13-10 20 0-7 10-13 10-20 0Z"/>
        <path d="M206 13h20m-10-10v20M226 13c7-10 13-10 20 0-7 10-13 10-20 0Zm20 0h20m-10-10v20M266 13c7-10 13-10 20 0-7 10-13 10-20 0Z"/>
        <path d="M286 13h28"/>
      </g>
      <g fill="currentColor">{Array.from({ length: 15 }, (_, i) => <circle key={i} cx={10 + i * 21.4} cy="13" r="1.35" />)}</g>
    </svg>
  );
}

/** Thin architectural stripe inspired by South Indian temple gopuram bands. */
export function TempleBorder({ className = "", title = "Temple border" }) {
  return (
    <svg className={className} viewBox="0 0 360 12" width="100%" height="12" fill="none" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 1h360M0 11h360" stroke="currentColor" strokeWidth=".8" opacity=".65"/>
      <path d="M4 6h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10m4 0h10l4-4 4 4 4-4 4 4h10" stroke="currentColor" strokeWidth=".85" strokeLinejoin="round"/>
    </svg>
  );
}

/** Use on a wrapper for a faint paper grain + kolam geometry. */
export function PaperKolamBackground({ as: Tag = "div", className = "", children, ...props }) {
  return <Tag className={`paper-kolam ${className}`.trim()} {...props}>{children}</Tag>;
}
