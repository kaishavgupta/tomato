// src/pages/home/homeComponents/RestaurantStrip.tsx
// Used by: Home only — horizontal draggable restaurant card strip
// ─────────────────────────────────────────────────────────────────────────────
import { useRef } from "react";
import { GradText } from "../../../components/User/Ui";
import { CardSkeleton } from "../../../components/User/Skeleton";
import type { RestaurantMenuDoc } from "../../../types/HomeMenueType";
import { RestStripCard } from "../../../components/User/RestStripCard";

interface RestaurantStripProps {
  restaurants: RestaurantMenuDoc[];
  filteredRests: RestaurantMenuDoc[];
  activeRestaurant: string | null;
  setActiveRestaurant: (id: string | null) => void;
  isInitialLoad: boolean;
  activeDocName?: string;
}

export const RestaurantStrip = ({
  filteredRests, activeRestaurant, setActiveRestaurant, isInitialLoad, activeDocName,
}: RestaurantStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const onDragScroll = (e: React.MouseEvent) => {
    const el = scrollRef.current!;
    const startX = e.pageX - el.offsetLeft;
    const sl = el.scrollLeft;
    const move = (ev: MouseEvent) => { el.scrollLeft = sl - (ev.pageX - el.offsetLeft - startX); };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); el.style.cursor = "grab"; };
    el.style.cursor = "grabbing";
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div style={{ padding: "40px 0 0" }}>
      <div style={{ padding: "0 20px", maxWidth: 680, margin: "0 auto 18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#1A0A00", lineHeight: 1.1 }}>
              Restaurants <GradText>near you</GradText>
            </h2>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
              {activeRestaurant ? `Showing menu for ${activeDocName}` : "Tap a card to explore its menu"}
            </p>
          </div>
          {activeRestaurant && (
            <button onClick={() => setActiveRestaurant(null)}
              style={{ fontSize: 12, fontWeight: 600, color: "#E23774", background: "rgba(226,55,116,0.06)", border: "1.5px solid rgba(226,55,116,0.18)", borderRadius: 99, padding: "4px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Clear ✕
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="scroll-hide"
        style={{ display: "flex", gap: 16, overflowX: "auto", padding: "8px 20px 24px", cursor: "grab" }}
        onMouseDown={onDragScroll}
      >
        {isInitialLoad
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : filteredRests.map((doc, i) => (
              <RestStripCard
                key={doc.restaurant_id}
                doc={doc}
                active={activeRestaurant === doc.restaurant_id}
                onClick={() => setActiveRestaurant(activeRestaurant === doc.restaurant_id ? null : doc.restaurant_id)}
                delay={Math.min(i * 0.05, 0.28)}
              />
            ))}
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>
    </div>
  );
};