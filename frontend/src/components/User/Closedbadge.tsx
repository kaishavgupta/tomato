// src/components/User/ClosedBadge.tsx
// Reusable closed-status indicator used in RestStripCard, RestSectionCard,
// MenuHeader, SelectedRestaurantPanel.
// ─────────────────────────────────────────────────────────────────────────────

/** Inline pill badge — e.g. inside a card header */
export const ClosedPill = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 9px", borderRadius: 99,
    background: "rgba(176,0,0,0.09)",
    border: "1px solid rgba(176,0,0,0.22)",
    fontSize: 9, fontWeight: 800, color: "#b00",
    letterSpacing: "0.07em", textTransform: "uppercase",
    flexShrink: 0,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#b00", display: "inline-block" }} />
    Closed
  </span>
);

/** Full-width banner — shown at the top of a panel or page section */
export const ClosedBanner = ({ restaurantName }: { restaurantName?: string }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 16px", borderRadius: 16, marginBottom: 16,
    background: "rgba(176,0,0,0.05)",
    border: "1.5px solid rgba(176,0,0,0.18)",
  }}>
    <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#b00", marginBottom: 2 }}>
        {restaurantName ? `${restaurantName} is currently closed` : "Restaurant is currently closed"}
      </p>
      <p style={{ fontSize: 11, color: "#c44", lineHeight: 1.45 }}>
        You can still browse the menu and add items to your cart.
        Orders will open again when the restaurant reopens.
      </p>
    </div>
  </div>
);