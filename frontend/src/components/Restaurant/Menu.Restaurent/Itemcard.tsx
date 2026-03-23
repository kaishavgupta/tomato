import { FiEdit2, FiTrash2, FiImage, FiToggleLeft, FiToggleRight, FiAlertCircle } from "react-icons/fi";
import type { MenuItem } from "../../../types/menu.types";
import { VegDot, StatusBadge } from "../../../components/Restaurant/Menu.Restaurent/Menuprimitives";

interface ItemCardProps {
  item: MenuItem;
  delay: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onMarkOutOfStock: () => void;
}

export const ItemCard = ({ item, onEdit, onDelete, onToggleStatus, onMarkOutOfStock, delay }: ItemCardProps) => {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const isColored = item.status === "available";

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{
        background: "white",
        border: "1.5px solid rgba(226,55,116,0.08)",
        boxShadow: "0 4px 20px rgba(226,55,116,0.05)",
        animation: `fadeUp 0.4s ease ${delay}s both`,
        opacity: item.status !== "available" ? 0.85 : 1,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(226,55,116,0.13)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(226,55,116,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* ── Image ── */}
      <div
        className="relative"
        style={{
          height: 160, overflow: "hidden",
          background: "linear-gradient(135deg,rgba(226,55,116,0.06),rgba(255,107,53,0.06))",
        }}
      >
        {item.image ? (
          <img
            src={item.image?.url}
            alt={item.item_name}
            className="w-full h-full object-cover"
            style={{
              filter: isColored ? "none" : "grayscale(100%)",
              transition: "filter 0.3s ease",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage size={32} style={{ color: "rgba(226,55,116,0.2)" }} />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <VegDot isVeg={item.isVeg} />
        </div>

        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} />
        </div>

        {hasDiscount && (
          <div
            className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}
          >
            {Math.round((1 - item.discountedPrice! / item.price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold leading-tight" style={{ color: "#1A0A00" }}>
            {item.item_name}
          </h3>

          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(226,55,116,0.07)", border: "none", cursor: "pointer", color: "#E23774" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(226,55,116,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(226,55,116,0.07)")}
            >
              <FiEdit2 size={12} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.07)", border: "none", cursor: "pointer", color: "#ef4444" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>

        {item.description && (
          <p className="text-xs mb-2 line-clamp-2" style={{ color: "#888" }}>
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: "#1A0A00" }}>
            ₹{hasDiscount ? item.discountedPrice : item.price}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: "#ccc" }}>
              ₹{item.price}
            </span>
          )}
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map(t => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(226,55,116,0.06)", color: "#E23774" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between mt-auto pt-3 gap-1.5"
          style={{ borderTop: "1px solid rgba(226,55,116,0.07)" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg flex-shrink-0"
            style={{ background: "#FFF8F0", color: "#aaa" }}
          >
            {item.category}
          </span>

          <div className="flex gap-1.5">
            {/* available → Pause | paused → Resume | out_of_stock → Restock (→ paused) */}
            {item.status !== "out_of_stock" ? (
              <button
                onClick={onToggleStatus}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-xl"
                style={{
                  background: item.status === "available" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                  color: item.status === "available" ? "#d97706" : "#16a34a",
                  border: `1.5px solid ${item.status === "available" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
                  cursor: "pointer",
                }}
              >
                {item.status === "available"
                  ? <><FiToggleLeft size={12} /> Pause</>
                  : <><FiToggleRight size={12} /> Resume</>}
              </button>
            ) : (
              <button
                onClick={onToggleStatus}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-xl"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  color: "#d97706",
                  border: "1.5px solid rgba(245,158,11,0.2)",
                  cursor: "pointer",
                }}
              >
                <FiToggleRight size={12} /> Restock
              </button>
            )}

            {/* Stock button — hidden when already out_of_stock */}
            {item.status !== "out_of_stock" && (
              <button
                onClick={onMarkOutOfStock}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  color: "#ef4444",
                  border: "1.5px solid rgba(239,68,68,0.2)",
                  cursor: "pointer",
                }}
              >
                <FiAlertCircle size={12} /> Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};