// src/pages/menu/menuComponents/CategoryAccordion.tsx
// Used by: Menu only (restaurant mode — groups items by category)
// ─────────────────────────────────────────────────────────────────────────────
// isClosed prop: received from Menu.tsx and threaded down to every
// ItemCard / ItemRow so they all grey out when the restaurant is closed.
// AddToCart buttons inside remain fully active regardless.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import type { MenuItem } from "../../../types/menu.types";
import { ItemCard } from "../Home/ItemCard";
import { ItemRow }  from "../Home/ItemRow";

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
      <button
        className={`s-cat-btn${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{CAT_EMOJI[cat] ?? "🍽️"}</span>
          <span style={{
            fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1A0A00",
          }}>
            {cat}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: "rgba(226,55,116,0.08)", color: "#E23774",
          }}>
            {items.length}
          </span>
        </div>
        <span style={{
          color: "#E23774", transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0)", display: "flex",
        }}>
          ▾
        </span>
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