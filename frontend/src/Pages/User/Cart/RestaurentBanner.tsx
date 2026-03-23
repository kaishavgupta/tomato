// src/pages/Cart/RestaurantBanner.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Updated to accept the full ICart document (`cartDoc`) directly instead of
// the populated cartItems array, since AppProvider now exposes cartDoc.
//
// Props:
//   cartDoc: the ICart document from context (has restaurant.name, restaurant.logo,
//            restaurantId, totalQty, and any populated fields)
// ─────────────────────────────────────────────────────────────────────────────

import { FiMapPin } from "react-icons/fi";

interface RestaurantBannerProps {
  cartDoc: any; // ICart | null
}

export const RestaurantBanner = ({ cartDoc }: RestaurantBannerProps) => {
  if (!cartDoc) return null;

  // restaurant metadata stored at add-to-cart time: { name, logo }
  const restaurant = cartDoc.restaurant ?? {};

  const logoUrl    = restaurant.logo ?? null;
  const name       = restaurant.name ?? "Restaurant";
  const totalItems = cartDoc.totalQty ?? 0;

  // isOpen: if your backend populates restaurantId, use cartDoc.restaurantId?.isOpen
  // Otherwise default to true until the populate endpoint is ready.
  // restaurantId is populated: { _id, isOpen } — read isOpen directly
  const isOpen: boolean = (cartDoc.restaurantId as any)?.isOpen ?? true;

  // city: only available if restaurantId is populated
  // city from populated restaurantId object
  const city = (cartDoc.restaurantId as any)?.location?.city ?? (cartDoc.restaurantId as any)?.city ?? null;

  return (
    <div style={{
      background: "white",
      border: `1.5px solid ${isOpen ? "rgba(226,55,116,0.10)" : "rgba(150,150,150,0.20)"}`,
      borderRadius: 20, marginBottom: 20, overflow: "hidden",
      boxShadow: isOpen
        ? "0 4px 20px rgba(226,55,116,0.07)"
        : "0 4px 20px rgba(0,0,0,0.06)",
      animation: "slideIn 0.35s ease both",
    }}>
      {/* Top shimmer bar */}
      <div style={{
        height: 4,
        background: isOpen
          ? "linear-gradient(90deg,#E23774,#FF6B35,#E23774)"
          : "linear-gradient(90deg,#aaa,#ccc,#aaa)",
        backgroundSize: "200% 100%",
        animation: isOpen ? "shimmer 2.5s linear infinite" : "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>

        {/* Logo */}
        <div style={{
          position: "relative", width: 56, height: 56, borderRadius: 16,
          overflow: "hidden", flexShrink: 0,
          background: isOpen
            ? "linear-gradient(135deg,rgba(226,55,116,0.10),rgba(255,107,53,0.10))"
            : "linear-gradient(135deg,rgba(150,150,150,0.15),rgba(180,180,180,0.15))",
          border: `1.5px solid ${isOpen ? "rgba(226,55,116,0.12)" : "rgba(150,150,150,0.25)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {logoUrl
            ? <img
                src={logoUrl}
                alt={name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  filter: isOpen ? "none" : "grayscale(100%) brightness(0.75)",
                }}
              />
            : <span style={{ fontSize: 26, filter: isOpen ? "none" : "grayscale(100%) brightness(0.75)" }}>
                🍽️
              </span>
          }
        </div>

        {/* Name / city / closed badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
            color: isOpen ? "#1A0A00" : "#888",
            letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {name}
          </p>

          {city && (
            <p style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 4 }}>
              <FiMapPin size={10} style={{ color: isOpen ? "#E23774" : "#aaa", flexShrink: 0 }} />
              {city}
            </p>
          )}

          {!isOpen && (
            <p style={{
              display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4,
              padding: "2px 8px", borderRadius: 99,
              background: "rgba(180,0,0,0.08)", border: "1px solid rgba(180,0,0,0.18)",
              fontSize: 10, fontWeight: 700, color: "#b00",
              letterSpacing: "0.07em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b00", display: "inline-block" }} />
              Closed · Not accepting orders
            </p>
          )}
        </div>

        {/* Item count badge */}
        <div style={{
          flexShrink: 0, padding: "6px 12px", borderRadius: 99,
          background: isOpen
            ? "linear-gradient(135deg,rgba(226,55,116,0.09),rgba(255,107,53,0.09))"
            : "rgba(150,150,150,0.09)",
          border: `1.5px solid ${isOpen ? "rgba(226,55,116,0.15)" : "rgba(150,150,150,0.20)"}`,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: isOpen ? "#E23774" : "#999", lineHeight: 1 }}>
            {totalItems}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: isOpen ? "#E23774" : "#999",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {totalItems === 1 ? "item" : "items"}
          </span>
        </div>

      </div>
    </div>
  );
};