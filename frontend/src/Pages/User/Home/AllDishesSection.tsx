// src/pages/home/homeComponents/AllDishesSection.tsx
// Used by: Home only — the full dish feed with filters, cuisine pills, empty state
// ─────────────────────────────────────────────────────────────────────────────
import { GradText, VegToggle, PillRow, Spinner } from "../../../components/User/Ui";
import { RowSkeleton } from "../../../components/User/Skeleton";
import { ItemRow } from "./ItemRow";
import type { MenuItemPreview } from "../../../types/HomeMenueType";

const CUISINE_FILTERS = ["All", "North Indian", "South Indian", "Chinese", "Fast Food", "Desserts", "Beverages", "Pizza", "Biryani"];

interface AllDishesSectionProps {
  filteredItems: (MenuItemPreview & { restaurantName: string; restaurant_id: string; isOpen?: boolean })[];
  isInitialLoad: boolean;
  vegOnly: boolean;
  setVegOnly: (v: boolean) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  restaurantsLength: number;
  sentinelRef: React.RefObject<HTMLDivElement>;
  onResetFilters: () => void;
}

export const AllDishesSection = ({
  filteredItems, isInitialLoad, vegOnly, setVegOnly,
  activeCategory, setActiveCategory, isFetchingNextPage,
  hasNextPage, isLoading, restaurantsLength, sentinelRef, onResetFilters,
}: AllDishesSectionProps) => (
  <div style={{ padding: "8px 20px 100px", maxWidth: 680, margin: "0 auto" }}>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#1A0A00", lineHeight: 1.1 }}>
        All <GradText>dishes</GradText>
      </h2>
      <p style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>Curated picks from every kitchen</p>
    </div>

    {/* filters */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <VegToggle value={vegOnly} onChange={setVegOnly} />
      <PillRow options={CUISINE_FILTERS} active={activeCategory} onChange={setActiveCategory} />
    </div>

    {!isInitialLoad && (
      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
      </p>
    )}

    {/* loading skeletons */}
    {isInitialLoad && (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    )}

    {/* empty state */}
    {!isInitialLoad && filteredItems.length === 0 && (
      <div style={{ textAlign: "center", padding: "52px 0" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#1A0A00" }}>Nothing found</p>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 6 }}>
          {vegOnly ? "Try disabling veg filter" : "Try a different search"}
        </p>
        <button onClick={onResetFilters}
          style={{ marginTop: 16, padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13 }}>
          Reset filters
        </button>
      </div>
    )}

    {/* item list */}
    {!isInitialLoad && filteredItems.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredItems.map((item, i) => (
          <ItemRow key={item._id} item={item} restaurantId={item.restaurant_id} delay={Math.min(i * 0.03, 0.24)} isClosed={item.isOpen === false} />
        ))}
      </div>
    )}

    <div ref={sentinelRef} style={{ height: 4 }} />

    {isFetchingNextPage && (
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
        <Spinner />
      </div>
    )}

    {!hasNextPage && !isLoading && restaurantsLength > 0 && (
      <p style={{ textAlign: "center", fontSize: 12, padding: "24px 0", color: "#ccc" }}>
        You've seen everything 🎉
      </p>
    )}
  </div>
);