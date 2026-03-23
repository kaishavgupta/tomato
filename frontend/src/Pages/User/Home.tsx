import { useRef, useEffect, useState } from "react";
import useUser from "../../Hooks/useUser";
import useMenu from "../../Hooks/useMenu";
import { SharedStyles } from "../../components/User/Sharedstyles";
import { CartFab } from "../../components/User/Ui";
import type { RestaurantMenuDoc, MenuItemPreview } from "../../types/HomeMenueType";

import { HomeHero }                from "./Home/HomeHero";
import { RestaurantStrip }         from "./Home/Restaurent";
import { SelectedRestaurantPanel } from "./Home/SelectedRestaurantPanel";
import { AllDishesSection }        from "./Home/AllDishesSection";

const Home = () => {
  const { userData, cartQuantity, cartPrice } = useUser();
  const { menu_items, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMenu();

  const [activeRestaurant, setActiveRestaurant] = useState<string | null>(null);
  const [activeCategory,   setActiveCategory]   = useState("All");
  const [vegOnly,          setVegOnly]          = useState(false);
  const [search,           setSearch]           = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const restaurants = (menu_items ?? []) as unknown as RestaurantMenuDoc[];
  const activeDoc   = restaurants.find(r => r.restaurant_id === activeRestaurant);
  const isInitialLoad = isLoading && restaurants.length === 0;
  const greeting = ["Morning", "Afternoon", "Evening"][[12, 17, 24].findIndex(h => new Date().getHours() < h)];

  const allItems: (MenuItemPreview & { restaurantName: string; restaurant_id: string; isOpen?: boolean })[] =
    restaurants.flatMap(doc =>
      doc.items.map(item => ({ ...item, restaurantName: doc.name, restaurant_id: doc.restaurant_id, isOpen: doc.isOpen }))
    );

  const filteredItems = allItems.filter(item => {
    if (item.status && item.status !== "available") return false;
    if (vegOnly && !item.isVeg) return false;
    if (activeCategory !== "All") {
      const q = activeCategory.toLowerCase();
      if (!(item.category ?? "").toLowerCase().includes(q) && !item.item_name.toLowerCase().includes(q)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return item.item_name.toLowerCase().includes(q) || item.restaurantName.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredRests = search
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.items.some(i => i.item_name.toLowerCase().includes(search.toLowerCase()))
      )
    : restaurants;

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <SharedStyles />

      <HomeHero
        greeting={greeting}
        userName={userData?.name}
        restaurantCount={restaurants.length}
        dishCount={allItems.length}
        isInitialLoad={isInitialLoad}
        search={search}
        setSearch={setSearch}
      />

      <RestaurantStrip
        restaurants={restaurants}
        filteredRests={filteredRests}
        activeRestaurant={activeRestaurant}
        setActiveRestaurant={setActiveRestaurant}
        isInitialLoad={isInitialLoad}
        activeDocName={activeDoc?.name}
      />

      {activeDoc && <SelectedRestaurantPanel doc={activeDoc} />}

      <AllDishesSection
        filteredItems={filteredItems}
        isInitialLoad={isInitialLoad}
        vegOnly={vegOnly}
        setVegOnly={setVegOnly}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        isLoading={isLoading}
        restaurantsLength={restaurants.length}
        sentinelRef={sentinelRef}
        onResetFilters={() => { setSearch(""); setActiveCategory("All"); setVegOnly(false); }}
      />

      <CartFab qty={cartQuantity ?? 0} price={cartPrice} />
    </div>
  );
};

export default Home;