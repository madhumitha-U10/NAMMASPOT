import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ count = 0, liked = false, onClick, label = "Like", compact = false }) {
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (!pop) return undefined;
    const timer = window.setTimeout(() => setPop(false), 520);
    return () => window.clearTimeout(timer);
  }, [pop]);
  return (
    <button
      type="button"
      className={"ns-like-button" + (liked ? " is-liked" : "") + (pop ? " is-popping" : "") + (compact ? " is-compact" : "")}
      onClick={() => { setPop(true); onClick?.(); }}
      aria-pressed={liked}
      aria-label={(liked ? "Unlike " : "Like ") + label + ". " + count + " likes"}
      title={(liked ? "Unlike " : "Like ") + label}
    >
      <Heart size={compact ? 15 : 18} fill={liked ? "currentColor" : "none"} strokeWidth={2.1}/>
      <span>{Number(count || 0).toLocaleString("en-IN")}</span>
      <span className="ns-like-sr-only">{liked ? "Liked" : "Like"}</span>
      {pop && <span className="ns-like-sparkle" aria-hidden="true">♥</span>}
    </button>
  );
}
