/**
 * menuShared.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every type, helper, style, and component that is
 * used by BOTH Home.tsx and Menu.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CHANGELOG (this version):
 *  • RestaurantMenuDoc — added `isOpen?: boolean` field
 *  • ItemCard / ItemRow — accept optional `isClosed` prop; when true the card
 *    renders in greyscale + dimmed but the AddToCartBtn remains fully active
 *  • AddToCartBtn — fixed to 2 args (itemId, restaurantId); price resolved server-side
 *  • CategoryAccordion — accepts + passes `isClosed` to each ItemCard / ItemRow
 *  • RestStripCard — closed overlay, dimmed image, ClosedPill badge
 *  • RestSectionCard — closed styling for header row + expanded items
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock, FiPlus, FiMinus, FiCheck, FiMapPin, FiChevronRight,
} from "react-icons/fi";
import useUser from "../Hooks/useUser";
import type { MenuItem } from "../types/menu.types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RestaurantMenuDoc {
  restaurant_id: string;
  name: string;
  image?: { url: string; public_id: string } | string;
  location?: { city?: string; address?: string };
  totalItems: number;
  items: MenuItemPreview[];
  /** true = accepting orders, false = closed, undefined = unknown */
  isOpen?: boolean;
}

export interface MenuItemPreview {
  _id: string;
  item_name: string;
  price: number;
  discountedPrice?: number;
  image?: { url?: string };
  isVeg?: boolean;
  status?: string;
  category?: string;
  restaurantName?: string;
  restaurant_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const imgUrl = (
  img?: { url: string; public_id: string } | string,
): string | undefined => {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.url || undefined;
};

export const discountPct = (price: number, discounted?: number) =>
  discounted ? Math.round((1 - discounted / price) * 100) : 0;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

export const SharedStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes s-fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes s-shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes s-popIn   { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
    @keyframes s-pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes s-spin    { to{transform:rotate(360deg)} }

    .s-item-card {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 20px;
      overflow: hidden; transition: box-shadow 0.22s, transform 0.22s, filter 0.22s; display: flex; flex-direction: column;
    }
    .s-item-card:hover { box-shadow: 0 10px 36px rgba(226,55,116,0.13); transform: translateY(-2px); }
    /* When closed: card goes grey but still lifts on hover so AddToCart is clearly still active */
    .s-item-card.closed { filter: grayscale(85%) brightness(0.88); border-color: rgba(150,150,150,0.18); }
    .s-item-card.closed:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); filter: grayscale(60%) brightness(0.92); }

    .s-item-row {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 16px;
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      transition: border-color 0.2s, box-shadow 0.2s, filter 0.2s;
    }
    .s-item-row:hover { border-color: rgba(226,55,116,0.22); box-shadow: 0 6px 24px rgba(226,55,116,0.09); }
    .s-item-row.closed { filter: grayscale(85%) brightness(0.88); border-color: rgba(150,150,150,0.18); }
    .s-item-row.closed:hover { filter: grayscale(60%) brightness(0.92); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

    .s-rest-card {
      flex-shrink: 0; width: 260px; border-radius: 24px; overflow: hidden; cursor: pointer;
      border: 1.5px solid rgba(226,55,116,0.08); background: white;
      box-shadow: 0 4px 20px rgba(226,55,116,0.06); transition: transform 0.28s ease, box-shadow 0.28s ease;
    }
    .s-rest-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 52px rgba(226,55,116,0.18); }
    .s-rest-card.s-rc-active { border-color: #E23774; box-shadow: 0 0 0 2.5px rgba(226,55,116,0.28), 0 16px 40px rgba(226,55,116,0.18); }

    .s-section-card {
      background: white; border: 1.5px solid rgba(226,55,116,0.08); border-radius: 24px;
      overflow: hidden; margin-bottom: 12px; transition: box-shadow 0.25s, transform 0.25s;
    }
    .s-section-card:hover { box-shadow: 0 12px 40px rgba(226,55,116,0.13); transform: translateY(-2px); }

    .s-cat-btn {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: 14px 18px; border-radius: 18px; background: white;
      border: 1.5px solid rgba(226,55,116,0.08); cursor: pointer;
      transition: box-shadow 0.2s; font-family: 'DM Sans',sans-serif;
    }
    .s-cat-btn.open { box-shadow: 0 4px 20px rgba(226,55,116,0.09); border-color: rgba(226,55,116,0.18); }

    .s-pill {
      flex-shrink: 0; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600;
      cursor: pointer; border: 1.5px solid rgba(226,55,116,0.15); color: #888;
      background: transparent; font-family: 'DM Sans',sans-serif; transition: all 0.18s; white-space: nowrap;
    }
    .s-pill.on { background: linear-gradient(135deg,#E23774,#FF6B35); color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(226,55,116,0.3); }
    .s-pill:not(.on):hover { border-color: rgba(226,55,116,0.35); color: #E23774; }

    /* Add button — stays pink even inside a greyed-out card so it's clearly tappable */
    .s-add-btn {
      background: linear-gradient(135deg,#E23774,#FF6B35); color: white; border: none;
      border-radius: 12px; font-family: 'DM Sans',sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; padding: 7px 14px;
      white-space: nowrap; flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 3px 12px rgba(226,55,116,0.3);
      /* Always full colour even when parent is greyed out */
      filter: none !important;
    }
    .s-add-btn:hover { opacity: 0.9; transform: scale(1.04); }
    .s-add-btn.added { background: rgba(34,197,94,0.1) !important; color: #16a34a !important; box-shadow: none !important; }

    .s-qty-btn {
      width: 28px; height: 28px; border-radius: 10px;
      background: linear-gradient(135deg,#E23774,#FF6B35);
      border: none; color: white; font-size: 16px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s; flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(226,55,116,0.25);
      filter: none !important;
    }
    .s-qty-btn:hover { transform: scale(1.12); }

    .s-veg { width: 14px; height: 14px; border-radius: 3px; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .s-skel {
      background: linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%);
      background-size: 200% 100%; animation: s-shimmer 1.4s infinite; border-radius: 12px;
    }

    .s-cart-fab { position: fixed; bottom: 28px; right: 28px; z-index: 999; animation: s-popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
    .s-cart-fab-btn {
      display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 99px;
      background: linear-gradient(135deg,#E23774,#FF6B35); border: none; color: white;
      font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 8px 32px rgba(226,55,116,0.5); transition: transform 0.2s;
    }
    .s-cart-fab-btn:hover { transform: scale(1.05); }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export const VegDot = ({ isVeg }: { isVeg?: boolean }) => (
  <span className="s-veg" style={{ borderColor: isVeg ? "#16a34a" : "#ef4444" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isVeg ? "#16a34a" : "#ef4444", display: "block" }} />
  </span>
);

export const Spinner = ({ size = 26 }: { size?: number }) => (
  <span style={{ width: size, height: size, borderRadius: "50%", border: `2.5px solid #E23774`, borderTopColor: "transparent", animation: "s-spin 0.7s linear infinite", display: "block" }} />
);

// ── Closed badges ─────────────────────────────────────────────────────────────

/** Small inline pill — used in card name rows */
export const ClosedPill = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 9px", borderRadius: 99,
    background: "rgba(176,0,0,0.09)", border: "1px solid rgba(176,0,0,0.22)",
    fontSize: 9, fontWeight: 800, color: "#b00",
    letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#b00", display: "inline-block" }} />
    Closed
  </span>
);

/** Full-width banner — used at the top of expanded sections / page headers */
export const ClosedBanner = ({ restaurantName }: { restaurantName?: string }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 16px", borderRadius: 16, marginBottom: 16,
    background: "rgba(176,0,0,0.05)", border: "1.5px solid rgba(176,0,0,0.18)",
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

// ── Skeletons ─────────────────────────────────────────────────────────────────

export const CardSkeleton = () => (
  <div style={{ flexShrink: 0, width: 260, borderRadius: 24, overflow: "hidden", border: "1.5px solid rgba(226,55,116,0.07)", background: "white" }}>
    <div className="s-skel" style={{ height: 140 }} />
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="s-skel" style={{ height: 16, width: "60%" }} />
      <div className="s-skel" style={{ height: 12, width: "35%" }} />
      <div className="s-skel" style={{ height: 12, width: "80%" }} />
    </div>
  </div>
);

export const RowSkeleton = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "white", borderRadius: 16, border: "1.5px solid rgba(226,55,116,0.07)" }}>
    <div className="s-skel" style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="s-skel" style={{ height: 14, width: "55%" }} />
      <div className="s-skel" style={{ height: 11, width: "35%" }} />
    </div>
    <div className="s-skel" style={{ width: 60, height: 30, borderRadius: 12, flexShrink: 0 }} />
  </div>
);

export const CatSkeleton = () => (
  <div style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.07)", borderRadius: 18, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
    <div className="s-skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
    <div className="s-skel" style={{ height: 16, width: "40%" }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO CART BUTTON
// ─────────────────────────────────────────────────────────────────────────────
/**
 * • isClosed prop — when true, button stays fully pink and active
 *   (user CAN add even when closed, per product spec).
 *   The grey styling is on the parent card, not this button.
 * • addToCart called with 2 args (itemId, restaurantId) — price resolved server-side.
 * • Cart lookup handles both populated (c.itemId._id) and raw ObjectId (c.itemId).
 */
export const AddToCartBtn = ({
  item,
  restaurantId,
}: {
  item: MenuItem | MenuItemPreview;
  restaurantId: string;
}) => {
  const { cartData, addToCart, updateQuantity, removeFromCart } = useUser();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = (cartData ?? []).find((c: any) => {
    const id = c.itemId?._id?.toString() ?? c.itemId?.toString();
    return id === item._id?.toString();
  });
  const qty = cartItem?.quantity ?? 0;

  // itemId string for update/remove — ICart items store itemId as string/ObjectId
  const cartItemId = cartItem?.itemId?.toString() ?? item._id;

  if ((item as MenuItem).status === "paused" || (item as MenuItem).status === "out_of_stock") {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "5px 10px", borderRadius: 10, background: "rgba(239,68,68,0.07)", color: "#ef4444" }}>
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
            if (qty === 1) removeFromCart(cartItemId);
            else updateQuantity(cartItemId, qty - 1);
          }}
        >
          <FiMinus size={11} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#E23774", minWidth: 18, textAlign: "center" }}>{qty}</span>
        <button
          className="s-qty-btn"
          onClick={e => {
            e.stopPropagation();
            // 2 args — price resolved server-side from MenuModel
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

// ─────────────────────────────────────────────────────────────────────────────
// ITEM CARD (grid view)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * isClosed: when true the entire card is greyed out via the `.closed` CSS class
 * (grayscale + slight dim), but the AddToCartBtn is excluded from the filter
 * via `filter: none !important` on .s-add-btn and .s-qty-btn in SharedStyles.
 */
export const ItemCard = ({
  item,
  restaurantId,
  delay = 0,
  isClosed = false,
}: {
  item: MenuItem | MenuItemPreview;
  restaurantId: string;
  delay?: number;
  isClosed?: boolean;
}) => {
  const disc = discountPct(item.price, item.discountedPrice);
  const eff  = item.discountedPrice ?? item.price;
  const imgSrc = (item as MenuItem).image?.url ?? (item as MenuItemPreview).image?.url;

  return (
    <div
      className={`s-item-card${isClosed ? " closed" : ""}`}
      style={{ animation: `s-fadeUp 0.35s ease ${delay}s both` }}
    >
      <div style={{ height: 120, overflow: "hidden", position: "relative", background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))" }}>
        {imgSrc
          ? <img
              src={imgSrc}
              alt={item.item_name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s" }}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🍽️</div>}
        {disc > 0 && (
          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white", filter: "none" }}>
            {disc}% OFF
          </span>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <VegDot isVeg={(item as MenuItem).isVeg ?? (item as MenuItemPreview).isVeg} />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A0A00", marginBottom: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item_name}</p>
        </div>
        {(item as MenuItem).description && (
          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {(item as MenuItem).description}
          </p>
        )}
        {(item as MenuItem).preparationTime && (
          <p style={{ fontSize: 10, color: "#ccc", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <FiClock size={9} /> {(item as MenuItem).preparationTime} min
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>₹{eff}</span>
            {disc > 0 && <span style={{ fontSize: 11, textDecoration: "line-through", color: "#ccc", marginLeft: 5 }}>₹{item.price}</span>}
          </div>
          {/* AddToCartBtn always active — filter:none keeps it pink even inside greyed card */}
          <AddToCartBtn item={item} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ITEM ROW (list view)
// ─────────────────────────────────────────────────────────────────────────────

export const ItemRow = ({
  item,
  restaurantId,
  delay = 0,
  isClosed = false,
}: {
  item: (MenuItem | MenuItemPreview) & { restaurantName?: string };
  restaurantId: string;
  delay?: number;
  isClosed?: boolean;
}) => {
  const disc = discountPct(item.price, item.discountedPrice);
  const eff = item.discountedPrice ?? item.price;
  const imgSrc = (item as MenuItem).image?.url ?? (item as MenuItemPreview).image?.url;

  return (
    <div
      className={`s-item-row${isClosed ? " closed" : ""}`}
      style={{ animation: `s-fadeUp 0.3s ease ${delay}s both` }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))", border: "1px solid rgba(226,55,116,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {imgSrc
          ? <img src={imgSrc} alt={item.item_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 26 }}>🍽️</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <VegDot isVeg={(item as MenuItem).isVeg ?? (item as MenuItemPreview).isVeg} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A0A00", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item_name}</span>
        </div>
        {item.restaurantName && (
          <span style={{ fontSize: 10, color: "#aaa", display: "block", marginBottom: 3 }}>{item.restaurantName}</span>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>₹{eff}</span>
          {disc > 0 && (
            <>
              <span style={{ fontSize: 11, textDecoration: "line-through", color: "#ccc" }}>₹{item.price}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#E23774", filter: "none" }}>{disc}% off</span>
            </>
          )}
        </div>
      </div>
      {/* AddToCartBtn always pink/active even when row is greyed */}
      <AddToCartBtn item={item} restaurantId={restaurantId} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT STRIP CARD (horizontal scroll — Home page)
// ─────────────────────────────────────────────────────────────────────────────

export const RestStripCard = ({
  doc, active, onClick, delay,
}: {
  doc: RestaurantMenuDoc;
  active: boolean;
  onClick: () => void;
  delay: number;
}) => {
  const src = imgUrl(doc.image);
  const [imgErr, setImgErr] = useState(false);
  const isClosed = doc.isOpen === false;

  return (
    <div
      className={`s-rest-card ${active ? "s-rc-active" : ""}`}
      onClick={onClick}
      style={{ animation: `s-fadeUp 0.4s ease ${delay}s both` }}
    >
      <div style={{ height: 140, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(226,55,116,0.09),rgba(255,107,53,0.09))" }}>
        {src && !imgErr
          ? <img
              src={src}
              alt={doc.name}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s ease",
                filter: isClosed ? "brightness(0.82) grayscale(30%)" : "none",
              }}
              onError={() => setImgErr(true)}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, filter: isClosed ? "grayscale(40%)" : "none" }}>🍽️</div>}

        {/* Item count badge */}
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, background: "rgba(26,10,0,0.65)", color: "white", backdropFilter: "blur(6px)" }}>
          {doc.totalItems} items
        </span>

        {/* Closed overlay badge */}
        {isClosed && (
          <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 9px", borderRadius: 99, background: "rgba(176,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff8080", display: "inline-block" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: "0.07em", textTransform: "uppercase" }}>Closed</span>
          </div>
        )}

        {/* Active checkmark — only when open */}
        {active && !isClosed && (
          <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#E23774,#FF6B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: isClosed ? "#888" : "#1A0A00", lineHeight: 1.2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.name}
          </p>
          {isClosed && <ClosedPill />}
        </div>
        {doc.location?.city && (
          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <FiMapPin size={10} style={{ color: isClosed ? "#aaa" : "#E23774" }} /> {doc.location.city}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
          {doc.items.slice(0, 2).map(item => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: isClosed ? "#bbb" : "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{item.item_name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isClosed ? "#aaa" : "#1A0A00", flexShrink: 0 }}>₹{item.price}</span>
            </div>
          ))}
          {doc.totalItems > 2 && (
            <span style={{ fontSize: 10, color: isClosed ? "#bbb" : "#E23774", fontWeight: 600 }}>+{doc.totalItems - 2} more</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid rgba(226,55,116,0.07)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: active ? "#E23774" : "#aaa" }}>
            {active ? "Hide ↑" : "View menu"} <FiChevronRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT SECTION CARD (explore accordion — Menu page global mode)
// ─────────────────────────────────────────────────────────────────────────────

export const RestSectionCard = ({ doc }: { doc: RestaurantMenuDoc }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const src = imgUrl(doc.image);
  const [imgErr, setImgErr] = useState(false);
  const isClosed = doc.isOpen === false;

  return (
    <div className="s-section-card">
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,rgba(226,55,116,0.08),rgba(255,107,53,0.08))" }}>
          {src && !imgErr
            ? <img
                src={src}
                alt={doc.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: isClosed ? "brightness(0.78) grayscale(30%)" : "none" }}
                onError={() => setImgErr(true)}
              />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🍽️</div>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: isClosed ? "#888" : "#1A0A00", lineHeight: 1.2 }}>
              {doc.name}
            </p>
            {isClosed && <ClosedPill />}
          </div>
          {doc.location?.city && (
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <FiMapPin size={10} style={{ color: isClosed ? "#bbb" : "#E23774" }} /> {doc.location.city}
            </p>
          )}
          <p style={{ fontSize: 11, color: isClosed ? "#bbb" : "#E23774", marginTop: 2, fontWeight: 600 }}>
            {doc.totalItems} items
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/menu?restaurantId=${doc.restaurant_id}`); }}
            style={{
              fontSize: 11, fontWeight: 700, padding: "7px 14px", borderRadius: 12,
              background: isClosed
                ? "rgba(150,150,150,0.15)"
                : "linear-gradient(135deg,#E23774,#FF6B35)",
              color: isClosed ? "#888" : "white",
              border: isClosed ? "1px solid rgba(150,150,150,0.25)" : "none",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Full menu
          </button>
          <span style={{ color: "#E23774", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)", display: "flex" }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(226,55,116,0.07)" }}>
          {isClosed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 10px", padding: "9px 12px", borderRadius: 12, background: "rgba(176,0,0,0.05)", border: "1px solid rgba(176,0,0,0.15)" }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <p style={{ fontSize: 11, color: "#c44", lineHeight: 1.4 }}>
                <strong style={{ color: "#b00" }}>Closed</strong> — you can still add items to cart for when they reopen.
              </p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, marginTop: 4 }}>
            {doc.items.map((item, i) => (
              <ItemCard
                key={item._id}
                item={item as unknown as MenuItem}
                restaurantId={doc.restaurant_id}
                delay={i * 0.03}
                isClosed={isClosed}
              />
            ))}
          </div>
          {doc.totalItems > doc.items.length && (
            <button
              onClick={() => navigate(`/menu?restaurantId=${doc.restaurant_id}`)}
              style={{ marginTop: 12, width: "100%", padding: "11px", borderRadius: 14, background: "transparent", border: "1.5px solid rgba(226,55,116,0.18)", color: "#E23774", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              See all {doc.totalItems} items →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY ACCORDION (Menu — restaurant mode)
// ─────────────────────────────────────────────────────────────────────────────

const CAT_EMOJI: Record<string, string> = {
  Starters: "🥗", "Main Course": "🍛", Breads: "🫓", "Rice & Biryani": "🍚",
  Desserts: "🍮", Beverages: "🥤", Soups: "🍜", Salads: "🥙", Snacks: "🍟", Combos: "🎁",
};

export const CategoryAccordion = ({
  cat,
  items,
  restaurantId,
  defaultOpen,
  view = "grid",
  isClosed = false,
}: {
  cat: string;
  items: MenuItem[];
  restaurantId: string;
  defaultOpen?: boolean;
  view?: "grid" | "list";
  isClosed?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div style={{ marginBottom: 10 }}>
      <button className={`s-cat-btn${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{CAT_EMOJI[cat] ?? "🍽️"}</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1A0A00" }}>{cat}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(226,55,116,0.08)", color: "#E23774" }}>{items.length}</span>
        </div>
        <span style={{ color: "#E23774", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)", display: "flex" }}>▾</span>
      </button>

      {open && (
        <div style={{ marginTop: 10, paddingLeft: 4, paddingRight: 4 }}>
          {view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {items.map((item, i) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  restaurantId={restaurantId}
                  delay={i * 0.03}
                  isClosed={isClosed}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item, i) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  restaurantId={restaurantId}
                  delay={i * 0.03}
                  isClosed={isClosed}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING CART FAB
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// DARK HERO HEADER
// ─────────────────────────────────────────────────────────────────────────────

export const DarkHero = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: "relative", background: "linear-gradient(160deg,#2A0A14 0%,#1A0A00 55%,#0C0806 100%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.2),transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -100, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.13),transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.028, pointerEvents: "none" }} />
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT TEXT SPAN
// ─────────────────────────────────────────────────────────────────────────────

export const GradText = ({ children }: { children: React.ReactNode }) => (
  <span style={{ background: "linear-gradient(90deg,#E23774 0%,#FF6B35 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PILL ROW
// ─────────────────────────────────────────────────────────────────────────────

export const PillRow = ({
  options, active, onChange,
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

// ─────────────────────────────────────────────────────────────────────────────
// VEG TOGGLE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

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