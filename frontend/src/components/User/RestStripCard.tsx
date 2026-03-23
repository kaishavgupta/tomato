// src/components/User/RestStripCard.tsx
// Home only — individual card in the restaurant horizontal strip.
// Shows a "Closed" overlay pill when isOpen === false.
// AddToCart still works — user can browse and add even when closed.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { FiMapPin, FiChevronRight } from "react-icons/fi";
import type { RestaurantMenuDoc } from "../../types/HomeMenueType";
import { imgUrl } from "../../types/HomeMenueType";
import { ClosedPill } from "./ClosedBadge";

export const RestStripCard = ({
  doc, active, onClick, delay,
}: {
  doc: RestaurantMenuDoc;
  active: boolean;
  onClick: () => void;
  delay: number;
}) => {
  const src = imgUrl(doc.image);
  const [imgErr, setImgErr] = useState(false);
  const isClosed = doc.isOpen === false;

  return (
    <div
      className={`s-rest-card ${active ? "s-rc-active" : ""}`}
      onClick={onClick}
      style={{ animation: `s-fadeUp 0.4s ease ${delay}s both` }}
    >
      {/* Image */}
      <div style={{ height: 140, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(226,55,116,0.09),rgba(255,107,53,0.09))" }}>
        {src && !imgErr
          ? <img src={src} alt={doc.name}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s ease",
                filter: isClosed ? "grayscale(100%) brightness(0.75)" : "none",
              }}
              onError={() => setImgErr(true)}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, filter: isClosed ? "grayscale(100%) brightness(0.75)" : "none" }}>🍽️</div>}

        {/* Item count badge */}
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, background: "rgba(26,10,0,0.65)", color: "white", backdropFilter: "blur(6px)" }}>
          {doc.totalItems} items
        </span>

        {/* Closed overlay badge — top right */}
        {isClosed && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            padding: "3px 9px", borderRadius: 99,
            background: "rgba(176,0,0,0.85)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Closed
            </span>
          </div>
        )}

        {/* Active checkmark — only when open */}
        {active && !isClosed && (
          <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#E23774,#FF6B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span>
          </div>
        )}
      </div>

      {/* Card body — desaturate when closed so entire card reads as B&W */}
      <div style={{ padding: "14px 16px", filter: isClosed ? "grayscale(100%) brightness(0.85)" : "none", transition: "filter 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1A0A00", lineHeight: 1.2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.name}
          </p>
          {/* Inline closed pill next to restaurant name */}
          {isClosed && <ClosedPill />}
        </div>

        {doc.location?.city && (
          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <FiMapPin size={10} style={{ color: isClosed ? "#aaa" : "#E23774" }} /> {doc.location.city}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
          {doc.items.slice(0, 2).map(item => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{item.item_name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1A0A00", flexShrink: 0 }}>₹{item.price}</span>
            </div>
          ))}
          {doc.totalItems > 2 && <span style={{ fontSize: 10, color: isClosed ? "#bbb" : "#E23774", fontWeight: 600 }}>+{doc.totalItems - 2} more</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid rgba(226,55,116,0.07)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: active ? "#E23774" : "#aaa" }}>
            {active ? "Hide ↑" : "View menu"} <FiChevronRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
};