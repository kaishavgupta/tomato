// src/pages/Cart/MoreFromRestaurant.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixes in this version:
//   1. Uses a local axios instance with the known baseURL instead of
//      importing `restaurantService` (whose baseURL may differ from the
//      menu endpoint). This is the primary reason items weren't showing.
//   2. restaurantId is coerced to string before the API call — prevents
//      `[object Object]` URLs when cartMeta.restaurantId is a raw ObjectId.
//   3. inCartIds set now correctly handles both raw ObjectId strings and
//      populated { _id } objects.
//   4. MiniAddBtn cart lookup fixed to match by both raw and populated itemId.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiPlus, FiMinus, FiCheck } from "react-icons/fi";
import useUser from "../../../Hooks/useUser";

// ── Local axios instance — same baseURL as api.cart ──────────────────────────
// Using a local instance avoids dependency on api.restaurant's baseURL config.
const menuApi = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// ── Types ────────────────────────────────────────────────────────────────────

interface MenuItemSnippet {
  _id: string;
  item_name: string;
  price: number;
  discountedPrice?: number;
  image?: { url?: string };
  isVeg?: boolean;
  category?: string;
  status?: string;
}

interface MoreFromRestaurantProps {
  restaurantId: string;
  cartItems:    any[];   // ICart["items"][] — { itemId, name, price, quantity }
  isOpen:       boolean;
}

// ── Inline mini AddToCartBtn ─────────────────────────────────────────────────

const MiniAddBtn = ({
  item,
  restaurantId,
}: {
  item: MenuItemSnippet;
  restaurantId: string;
}) => {
  const { cartData, addToCart, updateQuantity, removeFromCart } = useUser();
  const [justAdded, setJustAdded] = useState(false);

  // cartData = ICart["items"][] — match against both raw ObjectId and populated _id
  const cartEntry = (cartData ?? []).find((c: any) => {
    const id = c.itemId?._id?.toString() ?? c.itemId?.toString();
    return id === item._id?.toString();
  });
  const qty = cartEntry?.quantity ?? 0;

  // The itemId string to pass to update/remove
  const cartItemId = cartEntry?.itemId?._id?.toString()
    ?? cartEntry?.itemId?.toString()
    ?? item._id;

  // Closed restaurant never blocks cart — only truly unavailable items do
  if (item.status === "paused" || item.status === "out_of_stock") {
    return (
      <span style={{
        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
        padding: "4px 8px", borderRadius: 8,
        background: "rgba(150,150,150,0.1)", color: "#999",
      }}>
        Unavailable
      </span>
    );
  }

  if (qty > 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button
          onClick={e => {
            e.stopPropagation();
            qty === 1 ? removeFromCart(cartItemId) : updateQuantity(cartItemId, qty - 1);
          }}
          style={{
            width: 24, height: 24, borderRadius: 8,
            background: "rgba(226,55,116,0.10)",
            border: "1.5px solid rgba(226,55,116,0.20)",
            cursor: "pointer", color: "#E23774",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <FiMinus size={10} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#E23774", minWidth: 14, textAlign: "center" }}>
          {qty}
        </span>
        <button
          onClick={e => {
            e.stopPropagation();
            addToCart(item._id, restaurantId);
          }}
          style={{
            width: 24, height: 24, borderRadius: 8,
            background: "linear-gradient(135deg,#E23774,#FF6B35)",
            border: "none", cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(226,55,116,0.3)",
          }}
        >
          <FiPlus size={10} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        addToCart(item._id, restaurantId);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1000);
      }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "5px 10px", borderRadius: 10, border: "none", cursor: "pointer",
        background: justAdded ? "rgba(34,197,94,0.10)" : "linear-gradient(135deg,#E23774,#FF6B35)",
        color: justAdded ? "#16a34a" : "white",
        fontSize: 10, fontWeight: 700,
        boxShadow: justAdded ? "none" : "0 2px 8px rgba(226,55,116,0.28)",
        transition: "all 0.15s",
      }}
    >
      {justAdded ? <><FiCheck size={9} /> Added</> : <><FiPlus size={9} /> Add</>}
    </button>
  );
};

// ── Suggestion card ───────────────────────────────────────────────────────────

const SuggestionCard = ({
  item, restaurantId, isOpen, delay,
}: {
  item: MenuItemSnippet;
  restaurantId: string;
  isOpen: boolean;
  delay: number;
}) => {
  const disc = item.discountedPrice
    ? Math.round((1 - item.discountedPrice / item.price) * 100)
    : 0;
  const eff = item.discountedPrice ?? item.price;

  return (
    <div
      style={{
        flexShrink: 0, width: 150, background: "white",
        border: "1.5px solid rgba(226,55,116,0.08)",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(226,55,116,0.06)",
        display: "flex", flexDirection: "column",
        animation: `s-fadeUp 0.3s ease ${delay}s both`,
        transition: "box-shadow 0.2s, transform 0.2s",
        filter: isOpen ? "none" : "grayscale(80%) brightness(0.95)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(226,55,116,0.13)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(226,55,116,0.06)";
      }}
    >
      <div style={{
        height: 100, position: "relative",
        background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {item.image?.url
          ? <img src={item.image.url} alt={item.item_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 34 }}>🍽️</span>
        }
        {disc > 0 && (
          <span style={{
            position: "absolute", top: 7, left: 7, fontSize: 8, fontWeight: 800,
            padding: "2px 6px", borderRadius: 99,
            background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
          }}>
            {disc}% OFF
          </span>
        )}
        {item.isVeg !== undefined && (
          <span style={{
            position: "absolute", top: 7, right: 7, width: 12, height: 12, borderRadius: 3,
            border: `2px solid ${item.isVeg ? "#16a34a" : "#ef4444"}`,
            background: "white", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.isVeg ? "#16a34a" : "#ef4444", display: "block" }} />
          </span>
        )}
      </div>

      <div style={{ padding: "9px 10px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{
          fontSize: 12, fontWeight: 700, color: "#1A0A00", lineHeight: 1.25,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.item_name}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#1A0A00" }}>₹{eff}</span>
          {disc > 0 && <span style={{ fontSize: 9, textDecoration: "line-through", color: "#ccc" }}>₹{item.price}</span>}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <MiniAddBtn item={item} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div style={{ flexShrink: 0, width: 150, borderRadius: 18, overflow: "hidden", border: "1.5px solid rgba(226,55,116,0.07)", background: "white" }}>
    <div style={{ height: 100, background: "linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    <div style={{ padding: "9px 10px 10px", display: "flex", flexDirection: "column", gap: 7 }}>
      {[{ w: "80%" }, { w: "45%" }, { w: "60%" }].map((s, i) => (
        <div key={i} style={{ height: i === 2 ? 28 : 10 + i * 2, width: s.w, borderRadius: 6, background: "linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginTop: i === 2 ? 4 : 0 }} />
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const MoreFromRestaurant = ({
  restaurantId,
  cartItems,
  isOpen,
}: MoreFromRestaurantProps) => {
  const navigate  = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [menuItems, setMenuItems] = useState<MenuItemSnippet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);

  // FIX 1: always coerce to plain string — prevents "[object Object]" URLs
  // when cartMeta.restaurantId is a raw MongoDB ObjectId reference.
  const restId = restaurantId?.toString?.() ?? String(restaurantId);

  // FIX 2: handle both raw ObjectId string and populated { _id } object
  const inCartIds = new Set(
    (cartItems ?? [])
      .map((ci: any) => ci.itemId?._id?.toString() ?? ci.itemId?.toString())
      .filter(Boolean)
  );

  useEffect(() => {
    if (!restId || restId === "undefined" || restId === "null") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // FIX 3: use local menuApi (known baseURL) instead of restaurantService
    menuApi
      .get(`api/menu/${restId}`)
      .then(res => {
        const raw = res.data?.msg;
        const items: MenuItemSnippet[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
        setMenuItems(items.filter(i => i.status === "available"));
        setError(false);
      })
      .catch(err => {
        console.error("[MoreFromRestaurant] fetch failed:", err?.response?.status, err?.message);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [restId]);

  const suggestions = menuItems.filter(i => !inCartIds.has(i._id));

  // Drag-to-scroll
  const onDragScroll = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const startX = e.pageX - el.offsetLeft;
    const sl = el.scrollLeft;
    const move = (ev: MouseEvent) => { el.scrollLeft = sl - (ev.pageX - el.offsetLeft - startX); };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      el.style.cursor = "grab";
    };
    el.style.cursor = "grabbing";
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  if (!loading && (error || suggestions.length === 0)) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <style>{`
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes s-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingLeft: 2 }}>
        <div>
          <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#1A0A00", letterSpacing: 0.4, lineHeight: 1 }}>
            More from this restaurant
          </p>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Add more items to your order</p>
        </div>
        <button
          onClick={() => navigate(`/menu?restaurantId=${restId}`)}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 700, color: "#E23774",
            background: "rgba(226,55,116,0.07)",
            border: "1.5px solid rgba(226,55,116,0.18)",
            borderRadius: 12, padding: "5px 12px",
            cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Full menu <FiChevronRight size={11} />
        </button>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onDragScroll}
        style={{
          display: "flex", gap: 12, overflowX: "auto",
          cursor: "grab", paddingBottom: 8,
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : suggestions.map((item, i) => (
              <SuggestionCard
                key={item._id}
                item={item}
                restaurantId={restId}
                isOpen={isOpen}
                delay={i * 0.04}
              />
            ))
        }
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>
    </div>
  );
};