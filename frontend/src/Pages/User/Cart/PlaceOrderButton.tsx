// src/pages/Cart/PlaceOrderButton.tsx
// Button shows items subtotal. Full breakdown (delivery + platform fee) is shown on the Checkout page.

import { FiAlertCircle, FiArrowRight } from "react-icons/fi";

interface PlaceOrderButtonProps {
  total: number;        // items subtotal only
  placing: boolean;
  deliveryLoading: boolean;
  isOpen: boolean;      // false = restaurant closed OR address missing
  onPlaceOrder: () => void;
  noAddress?: boolean;
}

export const PlaceOrderButton = ({
  total, placing, deliveryLoading, isOpen, onPlaceOrder, noAddress = false,
}: PlaceOrderButtonProps) => {
  const disabled = placing || !isOpen;

  const label = () => {
    if (placing)   return <><Spinner /> Placing Order…</>;
    if (noAddress) return <>📍 Add an Address to Continue</>;
    if (!isOpen)   return <>🔒 Restaurant is Closed</>;
    return (
      <>
        Proceed to Checkout · ₹{total.toLocaleString()}
        <FiArrowRight size={15} />
      </>
    );
  };

  const sub = () => {
    if (noAddress) return "Please add a delivery address in Settings first";
    if (!isOpen)   return "Ordering is disabled — restaurant is currently closed";
    return "Delivery charges & platform fee added at checkout";
  };

  return (
    <>
      <button
        className="place-btn"
        onClick={onPlaceOrder}
        disabled={disabled}
        style={{
          width: "100%", padding: "16px 0", borderRadius: 20,
          fontSize: 15, fontWeight: 800, color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: !isOpen
            ? "rgba(150,150,150,0.45)"
            : disabled
              ? "rgba(226,55,116,0.3)"
              : "linear-gradient(135deg,#E23774,#FF6B35)",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : "0 6px 24px rgba(226,55,116,0.35)",
          transition: "background 0.25s",
        }}
      >
        {label()}
      </button>

      <p style={{
        textAlign: "center", fontSize: 11,
        color: (!isOpen || noAddress) ? "#b00" : "#aaa",
        marginTop: 10,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        transition: "color 0.2s",
      }}>
        <FiAlertCircle size={10} />
        {sub()}
      </p>
    </>
  );
};

const Spinner = () => (
  <span style={{
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid white", borderTopColor: "transparent",
    animation: "spin 0.7s linear infinite", display: "block",
  }} />
);