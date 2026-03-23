import type { ItemStatus } from "../../../types/menu.types";

// ── Category list ─────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Starters", "Main Course", "Breads", "Rice & Biryani",
  "Desserts", "Beverages", "Soups", "Salads", "Snacks", "Combos",
];

// ── Status display metadata ───────────────────────────────────────────────
export const STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string }> = {
  available:    { label: "Available",    color: "#16a34a", bg: "rgba(34,197,94,0.10)"   },
  paused:       { label: "Paused",       color: "#d97706", bg: "rgba(245,158,11,0.10)"  },
  out_of_stock: { label: "Out of Stock", color: "#ef4444", bg: "rgba(239,68,68,0.10)"   },
};

// ── Shared style tokens ───────────────────────────────────────────────────
export const inputBase: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "1.5px solid rgba(226,55,116,0.15)", background: "white",
  fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1A0A00",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};

export const labelBase: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#E23774", marginBottom: 6,
};

// ── Input focus/blur handlers ─────────────────────────────────────────────
export const onFocusInput = (e: React.FocusEvent<any>) =>
  (e.target.style.borderColor = "#E23774");

export const onBlurInput = (e: React.FocusEvent<any>) =>
  (e.target.style.borderColor = "rgba(226,55,116,0.15)");