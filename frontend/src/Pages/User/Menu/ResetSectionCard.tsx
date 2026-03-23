// src/pages/menu/menuComponents/RestSectionCard.tsx
// Menu only — one accordion card per restaurant in global mode.
// Shows closed badge in the header row when isOpen === false.
// AddToCart inside the expanded grid remains fully active.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import type { RestaurantMenuDoc } from "../../../types/HomeMenueType";
import { imgUrl } from "../../../types/HomeMenueType";
import { ItemCard } from "../Home/ItemCard";
import { ClosedPill } from "../../../components/User/ClosedBadge";

export const RestSectionCard = ({ doc }: { doc: RestaurantMenuDoc }) => {
  const navigate  = useNavigate();
  const [open, setOpen]     = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const src      = imgUrl(doc.image);
  const isClosed = doc.isOpen === false;

  return (
    <div className="s-section-card">
      {/* Header row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Restaurant logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, overflow: "hidden", flexShrink: 0,
          background: "linear-gradient(135deg,rgba(226,55,116,0.08),rgba(255,107,53,0.08))",
        }}>
          {src && !imgErr
            ? <img
                src={src} alt={doc.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: isClosed ? "brightness(0.78)" : "none" }}
                onError={() => setImgErr(true)}
              />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🍽️</div>}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#1A0A00", lineHeight: 1.2 }}>
              {doc.name}
            </p>
            {isClosed && <ClosedPill />}
          </div>
          {doc.location?.city && (
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <FiMapPin size={10} style={{ color: isClosed ? "#bbb" : "#E23774" }} /> {doc.location.city}
            </p>
          )}
          <p style={{ fontSize: 11, color: isClosed ? "#bbb" : "#E23774", marginTop: 2, fontWeight: 600 }}>
            {doc.totalItems} items
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/menu?restaurantId=${doc.restaurant_id}`); }}
            style={{
              fontSize: 11, fontWeight: 700, padding: "7px 14px", borderRadius: 12,
              background: isClosed
                ? "rgba(150,150,150,0.15)"
                : "linear-gradient(135deg,#E23774,#FF6B35)",
              color: isClosed ? "#888" : "white",
              border: isClosed ? "1px solid rgba(150,150,150,0.25)" : "none",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Full menu
          </button>
          <span style={{ color: "#E23774", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)", display: "flex" }}>▾</span>
        </div>
      </div>

      {/* Expanded items grid */}
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(226,55,116,0.07)" }}>

          {/* Closed notice inside the expanded section */}
          {isClosed && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              margin: "12px 0 10px", padding: "9px 12px", borderRadius: 12,
              background: "rgba(176,0,0,0.05)", border: "1px solid rgba(176,0,0,0.15)",
            }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <p style={{ fontSize: 11, color: "#c44", lineHeight: 1.4 }}>
                <strong style={{ color: "#b00" }}>Closed</strong> — you can still add items to cart for when they reopen.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, marginTop: 4 }}>
            {doc.items.map((item, i) => (
              <ItemCard key={item._id} item={item as any} restaurantId={doc.restaurant_id} delay={i * 0.03} isClosed={isClosed} />
            ))}
          </div>

          {doc.totalItems > doc.items.length && (
            <button
              onClick={() => navigate(`/menu?restaurantId=${doc.restaurant_id}`)}
              style={{ marginTop: 12, width: "100%", padding: "11px", borderRadius: 14, background: "transparent", border: "1.5px solid rgba(226,55,116,0.18)", color: "#E23774", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              See all {doc.totalItems} items →
            </button>
          )}
        </div>
      )}
    </div>
  );
};