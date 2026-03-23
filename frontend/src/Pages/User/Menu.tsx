// src/pages/Menu.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs previous version:
//   • Extracts restaurantImage, restaurantCity, isOpen from first menu item
//   • Passes all three (+ restaurantName) to MenuHeader for the identity strip
//   • Passes isClosed to CategoryAccordion so all cards go grey when closed
//   • addToCart 2-arg alignment (no price) already handled in menuShared
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MenuProvider } from "../../context/MenuProvider";
import useMenu from "../../Hooks/useMenu";
import useUser from "../../Hooks/useUser";
import type { MenuItem } from "../../types/menu.types";
import {
  SharedStyles, CartFab, Spinner, CatSkeleton,
  CategoryAccordion, RestSectionCard,
} from "../../components/menuShared";
import type { RestaurantMenuDoc } from "../../components/menuShared";
import { VegToggle } from "../../components/menuShared";

import { MenuHeader } from "./Menu/MenuHeader";

// ── MenuContent ───────────────────────────────────────────────────────────────
const MenuContent = ({ restaurantId }: { restaurantId?: string }) => {
  const { cartQuantity } = useUser();
  const { menu_items, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMenu();

  const [search,  setSearch]  = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [view,    setView]    = useState<"grid" | "list">("grid");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isInitialLoad = isLoading && menu_items.length === 0;

  const totalCount = restaurantId
    ? (menu_items as unknown as MenuItem[]).length
    : (menu_items as unknown as RestaurantMenuDoc[]).length;

  // ── Restaurant identity data (restaurant mode only) ────────────────────────
  // MenuItem has a populated `restaurant` or `restaurantId` ref.
  // We read whatever the backend populates.
  // MenuItem.restaurant_id is populated: { _id, name, image, location, isOpen }
  // Guard against undefined when data is still loading
  const firstItem = restaurantId && menu_items.length > 0 ? (menu_items[0] as any) : undefined;

  // Try all possible populated field names the backend might use
  const restaurantRef = firstItem?.restaurant_id ?? firstItem?.restaurant ?? firstItem?.restaurantId;
  const isOpen: boolean | undefined = restaurantRef?.isOpen ?? undefined;
  const restaurantName: string | undefined =
    restaurantRef?.name ?? restaurantRef?.restaurantName ?? undefined;
  const restaurantCity: string | undefined =
    restaurantRef?.location?.city ?? restaurantRef?.city ?? undefined;
  // Restaurant image — unwrap { url } shape or plain string
  const restaurantImage: string | undefined = (() => {
    const raw = restaurantRef?.image;
    if (!raw) return undefined;
    if (typeof raw === "string") return raw;
    return raw.url ?? undefined;
  })();

  const isClosed = restaurantId != null && isOpen === false;

  // ── RESTAURANT MODE ────────────────────────────────────────────────────────
  const renderRestaurantMode = () => {
    const allItems = menu_items as unknown as MenuItem[];

    const filtered = allItems.filter(item => {
      if (item.status !== "available") return false;
      if (vegOnly && !item.isVeg) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.item_name.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q) ||
          (item.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const cats    = Array.from(new Set(allItems.map(i => i.category)));
    const grouped = cats
      .map(cat => ({ cat, items: filtered.filter(i => i.category === cat) }))
      .filter(g => g.items.length > 0);

    if (!isLoading && grouped.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#1A0A00" }}>Nothing found</p>
          <p style={{ fontSize: 13, color: "#bbb", marginTop: 6 }}>
            {search ? "Try a different search" : "No items available"}
          </p>
        </div>
      );
    }

    return (
      <div>
        {grouped.map((g, i) => (
          <CategoryAccordion
            key={g.cat}
            cat={g.cat}
            items={g.items}
            restaurantId={restaurantId!}
            defaultOpen={i === 0}
            view={view}
            // ← pass closed state so all item cards grey out
            isClosed={isClosed}
          />
        ))}
      </div>
    );
  };

  // ── GLOBAL MODE ────────────────────────────────────────────────────────────
  const renderGlobalMode = () => {
    const docs = menu_items as unknown as RestaurantMenuDoc[];

    const filtered = docs.filter(doc => {
      if (vegOnly && !doc.items.some(i => i.isVeg)) return false;
      if (search) {
        const q = search.toLowerCase();
        return doc.name.toLowerCase().includes(q) || doc.items.some(i => i.item_name.toLowerCase().includes(q));
      }
      return true;
    });

    if (!isLoading && filtered.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#1A0A00" }}>No restaurants found</p>
        </div>
      );
    }

    return (
      <div>
        {filtered.map(doc => <RestSectionCard key={doc.restaurant_id} doc={doc} />)}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <SharedStyles />

      <MenuHeader
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        restaurantImage={restaurantImage}
        restaurantCity={restaurantCity}
        totalItems={restaurantId ? totalCount : undefined}
        isOpen={isOpen}
        totalCount={totalCount}
        isInitialLoad={isInitialLoad}
        cartQuantity={cartQuantity ?? 0}
        search={search}
        setSearch={setSearch}
        vegOnly={vegOnly}
        setVegOnly={setVegOnly}
        view={view}
        setView={setView}
      />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 100px" }}>
        {!restaurantId && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <VegToggle value={vegOnly} onChange={setVegOnly} />
          </div>
        )}

        {isInitialLoad && (
          <div>{Array.from({ length: 4 }).map((_, i) => <CatSkeleton key={i} />)}</div>
        )}

        {!isInitialLoad && (restaurantId ? renderRestaurantMode() : renderGlobalMode())}

        <div ref={sentinelRef} style={{ height: 4 }} />

        {isFetchingNextPage && (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <Spinner />
          </div>
        )}

        {!hasNextPage && !isLoading && menu_items.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 12, padding: "20px 0", color: "#ccc" }}>
            {restaurantId ? "You've seen all items 🎉" : "You've seen all restaurants 🎉"}
          </p>
        )}
      </div>

      <CartFab qty={cartQuantity ?? 0} />
    </div>
  );
};

// ── Page wrapper ──────────────────────────────────────────────────────────────
const Menu = () => {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId") ?? undefined;

  return (
    <MenuProvider mode={restaurantId ? "restaurant" : "global"} restaurantId={restaurantId}>
      <MenuContent restaurantId={restaurantId} />
    </MenuProvider>
  );
};

export default Menu;