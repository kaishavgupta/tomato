// src/components/AddToCartBtn.tsx
// Used by: ItemCard, ItemRow
// ─────────────────────────────────────────────────────────────────────────────
// Fixes:
//   • addToCart called with 2 args (itemId, restaurantId) — price resolved server-side
//   • Cart lookup handles both populated shape (c.itemId._id) and raw ObjectId (c.itemId)
//   • updateQuantity / removeFromCart use the correct itemId from the ICart item,
//     not the menu item's _id (they differ when itemId is a populated object)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { FiPlus, FiMinus, FiCheck } from "react-icons/fi";
import useUser from "../../Hooks/useUser";
import type { MenuItem } from "../../types/menu.types";
import type { MenuItemPreview } from "../../types/HomeMenueType";

export const AddToCartBtn = ({
  item,
  restaurantId,
}: {
  item: MenuItem | MenuItemPreview;
  restaurantId: string;
}) => {
  const { cartData, addToCart, updateQuantity, removeFromCart } = useUser();
  const [justAdded, setJustAdded] = useState(false);

  // Match by both populated shape (c.itemId._id) and raw ObjectId string (c.itemId)
  const cartItem = (cartData ?? []).find((c: any) => {
    const id = c.itemId?._id?.toString() ?? c.itemId?.toString();
    return id === item._id?.toString();
  });
  const qty = cartItem?.quantity ?? 0;

  // The itemId string for update/remove — use the ICart entry's itemId, not the menu _id
  const cartItemId = cartItem?.itemId?._id?.toString()
    ?? cartItem?.itemId?.toString()
    ?? item._id;

  if ((item as MenuItem).status === "paused" || (item as MenuItem).status === "out_of_stock") {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        padding: "5px 10px", borderRadius: 10,
        background: "rgba(239,68,68,0.07)", color: "#ef4444",
      }}>
        Unavailable
      </span>
    );
  }

  if (qty > 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 7, animation: "s-popIn 0.2s ease both" }}>
        <button
          className="s-qty-btn"
          onClick={e => {
            e.stopPropagation();
            qty === 1 ? removeFromCart(cartItemId) : updateQuantity(cartItemId, qty - 1);
          }}
        >
          <FiMinus size={11} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#E23774", minWidth: 18, textAlign: "center" }}>
          {qty}
        </span>
        <button
          className="s-qty-btn"
          onClick={e => {
            e.stopPropagation();
            // 2 args only — price resolved server-side from MenuModel
            addToCart(item._id, restaurantId);
          }}
        >
          <FiPlus size={11} />
        </button>
      </div>
    );
  }

  return (
    <button
      className={`s-add-btn${justAdded ? " added" : ""}`}
      onClick={e => {
        e.stopPropagation();
        addToCart(item._id, restaurantId);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1000);
      }}
    >
      {justAdded
        ? <><FiCheck size={11} style={{ display: "inline", marginRight: 4 }} />Added!</>
        : <><FiPlus size={11} style={{ display: "inline", marginRight: 4 }} />Add</>}
    </button>
  );
};