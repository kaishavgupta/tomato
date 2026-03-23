// src/pages/home/homeComponents/SelectedRestaurantPanel.tsx
// Home only — expands below the strip when a restaurant card is active.
// When closed: shows ClosedBanner above items. AddToCart buttons remain
// fully active so users can still build a cart for later.
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import type { RestaurantMenuDoc } from "../../../types/HomeMenueType";
import { imgUrl } from "../../../types/HomeMenueType";
import { ItemRow } from "./ItemRow";
import { ClosedBanner } from "../../../components/User/ClosedBadge";

export const SelectedRestaurantPanel = ({ doc }: { doc: RestaurantMenuDoc }) => {
  const navigate  = useNavigate();
  const isClosed  = doc.isOpen === false;

  return (
    <div style={{ padding: "0 20px 36px", maxWidth: 680, margin: "0 auto", animation: "s-fadeUp 0.3s ease both" }}>

      {/* Dark info banner */}
      <div style={{
        borderRadius: 20, marginBottom: isClosed ? 12 : 20,
        border: `1.5px solid ${isClosed ? "rgba(176,0,0,0.25)" : "rgba(226,55,116,0.18)"}`,
        background: isClosed
          ? "linear-gradient(135deg,#2A1010,#1A0A00)"
          : "linear-gradient(135deg,#2A0A14,#1A0A00)",
        padding: "20px 22px",
        display: "flex", alignItems: "center", gap: 16,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 64, opacity: 0.12 }}>🍽️</div>

        {imgUrl(doc.image) && (
          <div style={{ width: 54, height: 54, borderRadius: 16, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(226,55,116,0.3)" }}>
            <img
              src={imgUrl(doc.image)}
              alt={doc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: isClosed ? "grayscale(100%) brightness(0.7)" : "none" }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "#FEF3C7", lineHeight: 1 }}>
              {doc.name}
            </h3>
            {/* Closed pill inside the dark banner */}
            {isClosed && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 99,
                background: "rgba(176,0,0,0.45)",
                border: "1px solid rgba(255,100,100,0.3)",
                fontSize: 9, fontWeight: 800, color: "#ff9090",
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
                Closed
              </span>
            )}
          </div>

          {doc.location?.city && (
            <p style={{ fontSize: 12, color: "rgba(254,243,199,0.45)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <FiMapPin size={10} /> {doc.location.city}
            </p>
          )}
          <p style={{ fontSize: 11, color: isClosed ? "rgba(255,150,150,0.7)" : "#E23774", marginTop: 4, fontWeight: 600 }}>
            {doc.totalItems} items available
          </p>
        </div>
      </div>

      {/* Closed notice — explains cart is still usable */}
      {isClosed && <ClosedBanner restaurantName={doc.name} />}

      {/* Item rows — AddToCart always active */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {doc.items.map((item, i) => (
          <ItemRow
            key={item._id}
            item={{ ...item, restaurantName: doc.name }}
            restaurantId={doc.restaurant_id}
            delay={i * 0.04}
            isClosed={isClosed}
          />
        ))}
      </div>

      {doc.totalItems > doc.items.length && (
        <button
          onClick={() => navigate(`/menu?restaurantId=${doc.restaurant_id}`)}
          style={{ marginTop: 14, width: "100%", padding: "13px", borderRadius: 16, cursor: "pointer", background: "transparent", border: "1.5px solid rgba(226,55,116,0.18)", color: "#E23774", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700 }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(226,55,116,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          See all {doc.totalItems} items from {doc.name} →
        </button>
      )}
    </div>
  );
};