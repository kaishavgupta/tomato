// src/pages/Cart/DeliveryAddress.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixes vs previous version:
//   1. Address cards are ALWAYS clickable/selectable, regardless of isOpen.
//      isOpen only controls visual dimming — the restaurant being closed should
//      never block the user from choosing which address to deliver to.
//   2. "Manage" and "Add Address in Settings" now navigate to /settings and
//      pass { scrollTo: "address-section" } in location state so the settings
//      page auto-scrolls to the address section on arrival.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiAlertCircle, FiExternalLink } from "react-icons/fi";
import { BiLoader, BiCheck, BiStar } from "react-icons/bi";
import { useAddress } from "../../../Hooks/useAddresses";
import type { UserAddress } from "../../../api/api.address";

interface DeliveryAddressProps {
  selectedAddress: UserAddress | null;
  onSelect: (addr: UserAddress) => void;
  isOpen: boolean; // restaurant open/closed — dims the section only, never blocks selection
}

export const DeliveryAddress = ({
  selectedAddress,
  onSelect,
  isOpen,
}: DeliveryAddressProps) => {
  const navigate = useNavigate();
  const { addresses, isLoading, defaultAddress, hasAddresses } = useAddress();

  // Auto-select default on first load
  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      onSelect(defaultAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddress]);

  // Navigate to settings page and tell it to scroll to the address section
  const goToAddressSettings = () => {
    navigate("/settings", { state: { scrollTo: "address-section" } });
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        background: "white", borderRadius: 20, padding: 20, marginBottom: 14,
        border: "1.5px solid rgba(226,55,116,0.08)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <BiLoader size={18} style={{ color: "#E23774", animation: "spin 0.7s linear infinite" }} />
        <span style={{ fontSize: 13, color: "#aaa" }}>Loading addresses…</span>
        <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: "white", borderRadius: 20, padding: 16, marginBottom: 14,
      border: "1.5px solid rgba(226,55,116,0.08)",
      boxShadow: "0 2px 12px rgba(226,55,116,0.05)",
      // Only dim the section visually when restaurant is closed —
      // address selection itself stays fully interactive
      opacity: isOpen ? 1 : 0.7,
      transition: "opacity 0.2s",
    }}>

      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FiMapPin size={14} style={{ color: "#E23774" }} />
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#E23774",
          }}>
            Delivery Address
          </span>
        </div>
        {/* Manage button → always navigates to settings address section */}
        <button
          onClick={goToAddressSettings}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 700, color: "#E23774",
            background: "rgba(226,55,116,0.07)",
            border: "1.5px solid rgba(226,55,116,0.18)",
            borderRadius: 10, padding: "4px 10px", cursor: "pointer",
          }}
        >
          <FiExternalLink size={10} /> Manage
        </button>
      </div>

      {/* ── NO ADDRESSES — blocking banner ── */}
      {!hasAddresses && (
        <div style={{
          padding: "18px 16px", borderRadius: 14,
          background: "rgba(226,55,116,0.04)",
          border: "1.5px dashed rgba(226,55,116,0.25)",
          textAlign: "center",
        }}>
          <FiAlertCircle size={22} style={{ color: "#E23774", marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A0A00", marginBottom: 4 }}>
            No delivery address found
          </p>
          <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
            Please add an address before placing your order.
          </p>
          <button
            onClick={goToAddressSettings}
            style={{
              padding: "10px 22px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#E23774,#FF6B35)",
              color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 16px rgba(226,55,116,0.3)",
            }}
          >
            <FiExternalLink size={12} /> Add Address in Settings
          </button>
        </div>
      )}

      {/* ── ADDRESS CARDS — always selectable ── */}
      {hasAddresses && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {addresses.map((addr) => {
            const isSelected = selectedAddress?._id === addr._id;

            return (
              <div
                key={addr._id}
                // ✅ FIX: removed `isOpen &&` — selection always works
                onClick={() => onSelect(addr)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 11,
                  padding: "12px 14px", borderRadius: 16,
                  border: isSelected
                    ? "2px solid #E23774"
                    : "1.5px solid rgba(226,55,116,0.10)",
                  background: isSelected ? "rgba(226,55,116,0.04)" : "white",
                  // ✅ Always pointer — selection never blocked
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: isSelected ? "0 4px 16px rgba(226,55,116,0.12)" : "none",
                  position: "relative",
                }}
              >
                {/* icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: isSelected
                    ? "linear-gradient(135deg,#E23774,#FF6B35)"
                    : "rgba(226,55,116,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FiMapPin size={14} color={isSelected ? "white" : "#E23774"} />
                </div>

                {/* text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                    {addr.isDefault && (
                      <span style={{
                        fontSize: 8, fontWeight: 800, textTransform: "uppercase",
                        letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 99,
                        background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <BiStar size={8} /> Default
                      </span>
                    )}
                    {addr.userAddress.typeOfAddress && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: "#E23774",
                        padding: "2px 7px", borderRadius: 99,
                        background: "rgba(226,55,116,0.08)",
                      }}>
                        {addr.userAddress.typeOfAddress.charAt(0).toUpperCase() + addr.userAddress.typeOfAddress.slice(1)}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12, fontWeight: 600, color: "#1A0A00", lineHeight: 1.4,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    marginBottom: 3,
                  }}>
                    {addr.userAddress.formatedAddress}
                  </p>
                  <p style={{ fontSize: 11, color: "#aaa" }}>📞 {addr.phone}</p>
                </div>

                {/* selected tick */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "linear-gradient(135deg,#E23774,#FF6B35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BiCheck size={13} color="white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};