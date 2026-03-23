// src/components/ItemRow.tsx
// Used by: Home (all dishes section + selected restaurant items),
//          Menu (list view inside CategoryAccordion)
// ─────────────────────────────────────────────────────────────────────────────
import type { MenuItem } from "../../../types/menu.types";
import type { MenuItemPreview } from "../../../types/HomeMenueType";
import { discountPct } from "../../../types/HomeMenueType";
import { VegDot } from "../../../components/User/Ui";
import { AddToCartBtn } from "../../../components/User/AddToCartBtn";

export const ItemRow = ({
  item,
  restaurantId,
  delay = 0,
}: {
  item: (MenuItem | MenuItemPreview) & { restaurantName?: string };
  restaurantId: string;
  delay?: number;
}) => {
  const disc   = discountPct(item.price, item.discountedPrice);
  const eff    = item.discountedPrice ?? item.price;
  const imgSrc = (item as MenuItem).image?.url ?? (item as MenuItemPreview).image?.url;

  return (
    <div className="s-item-row" style={{ animation: `s-fadeUp 0.3s ease ${delay}s both` }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg,rgba(226,55,116,0.07),rgba(255,107,53,0.07))", border: "1px solid rgba(226,55,116,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {imgSrc
          ? <img src={imgSrc} alt={item.item_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 26 }}>🍽️</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <VegDot isVeg={(item as MenuItem).isVeg ?? (item as MenuItemPreview).isVeg} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A0A00", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.item_name}
          </span>
        </div>
        {item.restaurantName && (
          <span style={{ fontSize: 10, color: "#aaa", display: "block", marginBottom: 3 }}>{item.restaurantName}</span>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>₹{eff}</span>
          {disc > 0 && (
            <>
              <span style={{ fontSize: 11, textDecoration: "line-through", color: "#ccc" }}>₹{item.price}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#E23774" }}>{disc}% off</span>
            </>
          )}
        </div>
      </div>
      <AddToCartBtn item={item} restaurantId={restaurantId} />
    </div>
  );
};