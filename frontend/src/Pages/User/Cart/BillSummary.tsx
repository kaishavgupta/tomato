// src/pages/Cart/BillSummary.tsx
// Shows only the items subtotal.
// Delivery fee + platform fee are revealed on the Checkout page after payment is initiated.
import { FiAlertCircle, FiInfo } from "react-icons/fi";

export interface DeliveryInfo {
  fee: number;
  distanceKm: number | null;
  etaMin: number | null;
  loading: boolean;
  source: "geo" | "fallback";
}

interface BillSummaryProps {
  subtotal: number;
  platformfee: number;
  delivery: DeliveryInfo;
  isOpen?: boolean;
}

export const BillSummary = ({ subtotal, isOpen = true }: BillSummaryProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {/* Bill card — subtotal only */}
      <div style={{
        background: "white", borderRadius: 20, padding: 16,
        border: "1.5px solid rgba(226,55,116,0.08)",
        boxShadow: "0 2px 12px rgba(226,55,116,0.05)",
      }}>
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#E23774", marginBottom: 12,
        }}>
          Bill Summary
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#888" }}>Items subtotal</span>
            <span style={{ fontWeight: 700, color: "#1A0A00" }}>₹{subtotal.toLocaleString()}</span>
          </div>

          <div style={{ height: 1, background: "rgba(226,55,116,0.08)" }} />

          {/* Delivery + platform fee note */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            padding: "9px 11px", borderRadius: 12,
            background: "rgba(226,55,116,0.04)", border: "1px dashed rgba(226,55,116,0.18)",
          }}>
            <FiInfo size={12} style={{ color: "#E23774", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>
              Delivery charges & platform fee will be calculated at checkout based on your location.
            </p>
          </div>
        </div>
      </div>

      {/* Closed warning banner */}
      {!isOpen && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px", borderRadius: 14,
          background: "rgba(176,0,0,0.05)",
          border: "1.5px solid rgba(176,0,0,0.18)",
        }}>
          <FiAlertCircle size={16} style={{ color: "#b00", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#b00", marginBottom: 2 }}>
              Restaurant is currently closed
            </p>
            <p style={{ fontSize: 11, color: "#c44", lineHeight: 1.4 }}>
              You can view your cart but orders cannot be placed right now.
              Check back when the restaurant reopens.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};