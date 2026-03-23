// src/pages/Cart/StickyHeader.tsx
// No visual change when restaurant is closed — header always stays fully coloured.
// "Clear All" remains active regardless of isOpen so users can always manage cart.
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface StickyHeaderProps {
  items: any[];
  clearCart: () => void;
  isOpen: boolean; // accepted but not used for styling — header is always normal
}

export const StickyHeader = ({ clearCart, items }: StickyHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40, padding: "12px 16px",
      background: "rgba(255,248,240,0.92)", backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(226,55,116,0.08)",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: "rgba(226,55,116,0.07)", border: "none",
            cursor: "pointer", color: "#E23774",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <FiArrowLeft size={16} />
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 26,
            color: "#1A0A00", letterSpacing: 0.5, lineHeight: 1,
          }}>
            Your Cart
          </h1>
          <p style={{ fontSize: 11, color: "#aaa" }}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 12,
              background: "rgba(239,68,68,0.07)", color: "#ef4444",
              border: "1.5px solid rgba(239,68,68,0.15)", cursor: "pointer",
            }}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};