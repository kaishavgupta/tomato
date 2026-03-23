import { FiPlus } from "react-icons/fi";

// ── Hooks ─────────────────────────────────────────────────────────────────
import { useRestaurant } from "../../Hooks/useRestaurant";
import useMenu from "../../Hooks/useMenu";

// ── Types ─────────────────────────────────────────────────────────────────
import type { MenuItem, ItemStatus } from "../../types/menu.types";

// ── Components ────────────────────────────────────────────────────────────
import { ItemModal } from "../../components/Restaurant/Menu.Restaurent/Itemmodel";
import { DeleteModal } from "../../components/Restaurant/Menu.Restaurent/DeleteModal";
import { ItemCard } from "../../components/Restaurant/Menu.Restaurent/Itemcard";
import { ItemRow } from "../../components/Restaurant/Menu.Restaurent/Itemrow";
import { MenuStatsBar } from "../../components/Restaurant/Menu.Restaurent/Menustatusbar";
import { MenuToolbar } from "../../components/Restaurant/Menu.Restaurent/Menutoolbar";
import { MenuEmptyState } from "../../components/Restaurant/Menu.Restaurent/Menuemptystate";
import { useState } from "react";

// ── Global styles (animations + fonts) ───────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden }
  `}</style>
);

// ── Component ─────────────────────────────────────────────────────────────
const RestaurantMenu = () => {
  const { restaurantData } = useRestaurant();

  // ✅ FIX: pulled mutateItemStatus from context; removed useQueryClient & direct toggleState import
  const {
    mutateCreateMenu,
    menu_items,
    mutateupdateMenuItem,
    mutateDeleteMenuItem,
    mutateItemStatus,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMenu();

  // ── State ──────────────────────────────────────────────────────────────
  // ✅ FIX: removed dead `items` state that was never used
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState<ItemStatus | "all">("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  // ── Derived values ─────────────────────────────────────────────────────
  const usedCategories = [
    "All",
    ...Array.from(new Set((menu_items ?? []).map((i) => i.category))),
  ];

  const filtered = (menu_items ?? []).filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;
    const matchStatus = activeStatus === "all" || item.status === activeStatus;
    const matchSearch =
      !search ||
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchStatus && matchSearch;
  });

  // ✅ FIX: use totalCount from server (first page pagination) for accurate stats
  const counts = {
    total: totalCount,
    available: (menu_items ?? []).filter((i) => i.status === "available")
      .length,
    paused: (menu_items ?? []).filter((i) => i.status === "paused").length,
    outStock: (menu_items ?? []).filter((i) => i.status === "out_of_stock")
      .length,
  };

  // ── Handlers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSave = (saved: Omit<MenuItem, "_id"> & { _id?: string }) => {
    mutateCreateMenu.mutate(saved);
    setModalOpen(false);
  };

  // ✅ FIX: close modal immediately after triggering delete
  const handleDelete = () => {
    if (!deleteTarget?._id) return;
    mutateDeleteMenuItem.mutate(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleEdit = ({
    item,
    item_id,
    public_id,
  }: {
    item: MenuItem;
    item_id: string;
    public_id: string;
  }) => {
    if (!item_id) return;

    const formData = new FormData();
    formData.append("item_id", item_id);
    formData.append("item_name", item.item_name);
    formData.append("description", item.description ?? "");
    formData.append("price", String(item.price));
    formData.append(
      "discountedPrice",
      item.discountedPrice ? String(item.discountedPrice) : "",
    );
    formData.append("category", String(item.category));
    formData.append("isVeg", String(item.isVeg));
    formData.append("status", item.status);
    formData.append("preparationTime", String(item.preparationTime ?? 20));
    formData.append("tags", JSON.stringify(item.tags));
    if (item._newFile) {
      formData.append("file", item._newFile);
    }
    mutateupdateMenuItem.mutate({ formData, public_id, id: item_id });
    setModalOpen(false);
  };

  // ✅ FIX: use mutateItemStatus from context instead of calling toggleState directly.
  //    This gives us proper loading state, centralized error toasts, and automatic
  //    cache invalidation (wired in MenuProvider) — no need for useQueryClient here.
  //
  //  Status state machine:
  //    available    --[Pause]-->    paused
  //    paused       --[Resume]-->   available
  //    out_of_stock --[Restock]-->  paused
  const handleToggleStatus = (item: MenuItem) => {
    let next: ItemStatus;
    if (item.status === "available") {
      next = "paused";
    } else if (item.status === "out_of_stock") {
      next = "paused";
    } else {
      next = "available";
    }
    mutateItemStatus.mutate({ item_id: item._id, status: next });
  };

  const handleMarkOutOfStock = (item: MenuItem) => {
    mutateItemStatus.mutate({ item_id: item._id, status: "out_of_stock" });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background decorative blob */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            opacity: 0.04,
            background: "linear-gradient(135deg,#E23774,#FF6B35)",
            clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)",
          }}
        />
      </div>

      <div
        className="relative px-4 md:px-10 py-8 max-w-7xl mx-auto"
        style={{ zIndex: 1 }}
      >
        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#E23774" }}
            >
              {restaurantData?.name}'s
            </p>
            <h1
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                color: "#1A0A00",
                letterSpacing: 1,
              }}
            >
              Menu
            </h1>
            <p className="text-sm mt-1" style={{ color: "#aaa" }}>
              Add, edit, pause or remove items from your menu
            </p>
          </div>

          <button
            disabled={!restaurantData?.isVerified}
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg,#E23774,#FF6B35)",
              border: "none",
              cursor: restaurantData?.isVerified ? "pointer" : "not-allowed",
              boxShadow: "0 4px 20px rgba(226,55,116,0.35)",
            }}
          >
            {!restaurantData?.isVerified ? (
              "Not verified to add item"
            ) : (
              <>
                <FiPlus size={16} /> Add New Item
              </>
            )}
          </button>
        </div>

        {/* ── Stats bar ── */}
        <MenuStatsBar
          total={counts.total}
          available={counts.available}
          paused={counts.paused}
          outStock={counts.outStock}
        />

        {/* ── Main panel ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "white",
            border: "1.5px solid rgba(226,55,116,0.08)",
            boxShadow: "0 8px 40px rgba(226,55,116,0.07)",
          }}
        >
          <MenuToolbar
            search={search}
            onSearchChange={setSearch}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            view={view}
            onViewChange={setView}
            categories={usedCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* ── Item list / grid / empty state ── */}
          {filtered.length === 0 ? (
            <MenuEmptyState
              isSearching={!!search}
              isVerified={restaurantData?.isVerified}
              onAddClick={openAdd}
            />
          ) : view === "grid" ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item, i) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  delay={i * 0.04}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggleStatus={() => handleToggleStatus(item)}
                  onMarkOutOfStock={() => handleMarkOutOfStock(item)}
                />
              ))}
            </div>
          ) : (
            <div>
              {filtered.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggleStatus={() => handleToggleStatus(item)}
                  onMarkOutOfStock={() => handleMarkOutOfStock(item)}
                />
              ))}
            </div>
          )}

          {/* ✅ FIX: hidden completely when no more pages — no "Nothing more to load" clutter */}
          {hasNextPage && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: isFetchingNextPage
                    ? "rgba(226,55,116,0.07)"
                    : "linear-gradient(135deg,#E23774,#FF6B35)",
                  color: isFetchingNextPage ? "#E23774" : "white",
                  border: "1.5px solid rgba(226,55,116,0.15)",
                  cursor: isFetchingNextPage ? "not-allowed" : "pointer",
                  boxShadow: isFetchingNextPage
                    ? "none"
                    : "0 4px 16px rgba(226,55,116,0.25)",
                }}
              >
                {isFetchingNextPage ? (
                  <>
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "#E23774",
                        borderTopColor: "transparent",
                      }}
                    />
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modalOpen && (
        <ItemModal
          item={editItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onEdit={handleEdit}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <GlobalStyles />
    </div>
  );
};

export default RestaurantMenu;
