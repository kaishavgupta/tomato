import { FiSearch, FiGrid, FiList, FiChevronDown } from "react-icons/fi";
import type{ ItemStatus } from "../../../types/menu.types";

interface MenuToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  activeStatus: ItemStatus | "all";
  onStatusChange: (v: ItemStatus | "all") => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const MenuToolbar = ({
  search, onSearchChange,
  activeStatus, onStatusChange,
  view, onViewChange,
  categories, activeCategory, onCategoryChange,
}: MenuToolbarProps) => (
  <div
    className="px-6 pt-6 pb-4"
    style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}
  >
    <div className="flex flex-col md:flex-row gap-3 mb-4">

      {/* Search */}
      <div className="relative flex-1">
        <FiSearch
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#ccc" }}
        />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search items by name, description or tag…"
          className="w-full rounded-2xl text-sm outline-none"
          style={{
            paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
            border: "1.5px solid rgba(226,55,116,0.12)", background: "#FFF8F0",
            color: "#1A0A00", fontFamily: "'DM Sans',sans-serif",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#E23774")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(226,55,116,0.12)")}
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={activeStatus}
          onChange={e => onStatusChange(e.target.value as ItemStatus | "all")}
          className="appearance-none rounded-2xl text-sm font-semibold pr-8 pl-4 py-2.5 outline-none"
          style={{
            background: "#FFF8F0", border: "1.5px solid rgba(226,55,116,0.12)",
            color: "#555", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="paused">Paused</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <FiChevronDown
          size={12}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#aaa" }}
        />
      </div>

      {/* View toggle */}
      <div
        className="flex rounded-2xl overflow-hidden"
        style={{ border: "1.5px solid rgba(226,55,116,0.12)" }}
      >
        {(["grid", "list"] as const).map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className="flex items-center justify-center px-3 py-2.5 transition-all"
            style={{
              background: view === v ? "linear-gradient(135deg,#E23774,#FF6B35)" : "white",
              color: view === v ? "white" : "#aaa",
              border: "none", cursor: "pointer",
            }}
          >
            {v === "grid" ? <FiGrid size={15} /> : <FiList size={15} />}
          </button>
        ))}
      </div>
    </div>

    {/* Category tabs */}
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
          style={{
            background: activeCategory === cat
              ? "linear-gradient(135deg,#E23774,#FF6B35)"
              : "rgba(226,55,116,0.06)",
            color: activeCategory === cat ? "white" : "#888",
            border: "none", cursor: "pointer",
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);