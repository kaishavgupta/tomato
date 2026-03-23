// src/pages/Cart/CartItemRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Updated to work with ICart item shape:
//   { itemId: ObjectId, name: string, price: number, quantity: number }
//
// The backend stores name & price at add-to-cart time, so we read them directly
// from the cart item instead of the populated itemId subdoc. This means the
// row renders correctly even when itemId is not populated.
//
// When closed: item image, name, price stay fully coloured.
// Only the +/- quantity buttons are disabled and dimmed.
// ─────────────────────────────────────────────────────────────────────────────

import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import useUser from "../../../Hooks/useUser";

interface CartItemRowProps {
  cartItem: any; // ICart["items"][number]
  delay:    number;
}

// Simple veg/non-veg indicator dot
const VegDot = ({ isVeg }: { isVeg?: boolean }) => {
  if (isVeg === undefined) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
      border: `2px solid ${isVeg ? "#16a34a" : "#ef4444"}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: isVeg ? "#16a34a" : "#ef4444",
        display: "block",
      }} />
    </span>
  );
};

export const CartItemRow = ({ cartItem, delay }: CartItemRowProps) => {
  const { updateQuantity, removeFromCart } = useUser();

  // ICart item fields stored at add-to-cart time
  // itemId is populated: { _id, image: { url } } — extract the plain string _id
  const itemId = cartItem.itemId?._id?.toString() ?? cartItem.itemId?.toString();
  const name          = cartItem.name  ?? cartItem.itemId?.item_name ?? "Item";
  const price         = cartItem.price ?? cartItem.itemId?.discountedPrice ?? cartItem.itemId?.price ?? 0;
  const quantity      = cartItem.quantity ?? 1;
  const lineTotal     = price * quantity;

  // Optional fields only present when itemId is populated (progressive enhancement)
  const imageUrl      = cartItem.itemId?.image?.url ?? null;
  const category      = cartItem.itemId?.category   ?? null;
  const isVeg         = cartItem.itemId?.isVeg;

  return (
    <div
      className="cart-item-row"
      style={{
        display: "flex", gap: 12, padding: 14, borderRadius: 20,
        background: "white",
        border: "1.5px solid rgba(226,55,116,0.07)",
        animation: `fadeUp 0.3s ease ${delay}s both`,
      }}
    >
      {/* Thumbnail — always full colour */}
      <div style={{
        width: 76, height: 76, borderRadius: 16, flexShrink: 0, overflow: "hidden",
        background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))",
        border: "1px solid rgba(226,55,116,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 28 }}>🍽️</span>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row — always full colour */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 8, marginBottom: 3,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <VegDot isVeg={isVeg} />
            <span style={{
              fontSize: 14, fontWeight: 700, color: "#1A0A00",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name}
            </span>
          </div>

          {/* Trash — always active so user can remove even when restaurant is closed */}
          <button
            onClick={() => removeFromCart(itemId)}
            style={{
              width: 28, height: 28, borderRadius: 10, flexShrink: 0,
              background: "rgba(239,68,68,0.07)", border: "1.5px solid rgba(239,68,68,0.15)",
              cursor: "pointer", color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <FiTrash2 size={12} />
          </button>
        </div>

        {category && (
          <p style={{ fontSize: 11, color: "#bbb", marginBottom: 8 }}>{category}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Price — always full colour */}
          <div>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#1A0A00" }}>
              ₹{lineTotal.toLocaleString()}
            </span>
            {quantity > 1 && (
              <span style={{ fontSize: 10, color: "#bbb", marginLeft: 5 }}>
                ₹{price} × {quantity}
              </span>
            )}
          </div>

          {/* Qty controls — always active (user can always adjust cart) */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="qty-btn"
              onClick={() =>
                quantity === 1
                  ? removeFromCart(itemId)
                  : updateQuantity(itemId, quantity - 1)
              }
              style={{
                width: 28, height: 28, borderRadius: 10,
                background: "rgba(226,55,116,0.08)",
                border: "1.5px solid rgba(226,55,116,0.15)",
                cursor: "pointer",
                color: "#E23774",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FiMinus size={11} />
            </button>

            <span style={{
              fontSize: 15, fontWeight: 900, color: "#1A0A00",
              minWidth: 20, textAlign: "center",
            }}>
              {quantity}
            </span>

            <button
              className="qty-btn"
              onClick={() => updateQuantity(itemId, quantity + 1)}
              style={{
                width: 28, height: 28, borderRadius: 10,
                background: "linear-gradient(135deg,#E23774,#FF6B35)",
                border: "none",
                cursor: "pointer",
                color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(226,55,116,0.3)",
              }}
            >
              <FiPlus size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};