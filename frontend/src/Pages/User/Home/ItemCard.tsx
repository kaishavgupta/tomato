// src/components/ItemCard.tsx
// Used by: Menu (grid view inside CategoryAccordion, RestSectionCard)
// ─────────────────────────────────────────────────────────────────────────────
// isClosed prop: when true the card renders with .s-item-card.closed class
// which applies grayscale(85%) via CSS. The .s-add-btn and .s-qty-btn classes
// have filter:none !important in SharedStyles so they stay vivid pink and
// fully tappable — user can always add to cart even when closed.
// ─────────────────────────────────────────────────────────────────────────────
import { FiClock } from "react-icons/fi";
import type { MenuItem } from "../../../types/menu.types";
import type { MenuItemPreview } from "../../../types/HomeMenueType";
import { discountPct } from "../../../types/HomeMenueType";
import { VegDot } from "../../../components/User/Ui";
import { AddToCartBtn } from "../../../components/User/AddToCartBtn";

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
  const disc   = discountPct(item.price, item.discountedPrice);
  const eff    = item.discountedPrice ?? item.price;
  const imgSrc = (item as MenuItem).image?.url ?? (item as MenuItemPreview).image?.url;

  return (
    <div
      className={`s-item-card${isClosed ? " closed" : ""}`}
      style={{ animation: `s-fadeUp 0.35s ease ${delay}s both` }}
    >
      <div style={{
        height: 120, overflow: "hidden", position: "relative",
        background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))",
      }}>
        {imgSrc
          ? <img
              src={imgSrc}
              alt={item.item_name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s" }}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
              🍽️
            </div>}
        {disc > 0 && (
          <span style={{
            position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 800,
            padding: "2px 7px", borderRadius: 99,
            background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
            filter: "none",  // keep discount badge coloured even in greyscale card
          }}>
            {disc}% OFF
          </span>
        )}
      </div>

      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <VegDot isVeg={(item as MenuItem).isVeg ?? (item as MenuItemPreview).isVeg} />
          <p style={{
            fontSize: 13, fontWeight: 700, color: "#1A0A00", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.item_name}
          </p>
        </div>

        {(item as MenuItem).description && (
          <p style={{
            fontSize: 11, color: "#aaa", marginBottom: 6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
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
            {disc > 0 && (
              <span style={{ fontSize: 11, textDecoration: "line-through", color: "#ccc", marginLeft: 5 }}>
                ₹{item.price}
              </span>
            )}
          </div>
          {/* AddToCartBtn always active — .s-add-btn has filter:none !important in SharedStyles */}
          <AddToCartBtn item={item} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
};