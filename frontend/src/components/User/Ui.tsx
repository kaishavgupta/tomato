// src/components/ui.tsx
// Used by: Home, Menu (and their sub-components)
// Tiny stateless primitives that don't belong to either page exclusively.
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";

/** Gradient text span — "Hunger is a <GradText>conversation</GradText>" */
export const GradText = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    background: "linear-gradient(90deg,#E23774 0%,#FF6B35 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  }}>
    {children}
  </span>
);

/** Veg / non-veg coloured square dot */
export const VegDot = ({ isVeg }: { isVeg?: boolean }) => (
  <span className="s-veg" style={{ borderColor: isVeg ? "#16a34a" : "#ef4444" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isVeg ? "#16a34a" : "#ef4444", display: "block" }} />
  </span>
);

/** Pink spinning loader */
export const Spinner = ({ size = 26 }: { size?: number }) => (
  <span style={{
    width: size, height: size, borderRadius: "50%",
    border: `2.5px solid #E23774`, borderTopColor: "transparent",
    animation: "s-spin 0.7s linear infinite", display: "block",
  }} />
);

/** Veg-only toggle button */
export const VegToggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99,
      background: value ? "rgba(22,163,74,0.1)" : "transparent",
      border: `1.5px solid ${value ? "rgba(22,163,74,0.4)" : "rgba(226,55,116,0.15)"}`,
      color: value ? "#16a34a" : "#888", fontSize: 12, fontWeight: 600,
      cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", flexShrink: 0,
    }}
  >
    <span style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${value ? "#16a34a" : "#aaa"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {value && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", display: "block" }} />}
    </span>
    Veg only
  </button>
);

/** Horizontal scrollable pill filter row */
export const PillRow = ({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) => (
  <div className="scroll-hide" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
    {options.map(opt => (
      <button key={opt} className={`s-pill${active === opt ? " on" : ""}`} onClick={() => onChange(opt)}>
        {opt}
      </button>
    ))}
  </div>
);

/** Floating cart button — fixed bottom-right */
export const CartFab = ({ qty, price }: { qty: number; price?: number }) => {
  const navigate = useNavigate();
  if (qty <= 0) return null;
  return (
    <div className="s-cart-fab">
      <button className="s-cart-fab-btn" onClick={() => navigate("/cart")}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>
          {qty}
        </span>
        <span>View Cart</span>
        {price != null && price > 0 && (
          <span style={{ opacity: 0.88, fontSize: 14, fontWeight: 700 }}>₹{price}</span>
        )}
      </button>
    </div>
  );
};