import { FiPlus } from "react-icons/fi";

interface MenuEmptyStateProps {
  isSearching: boolean;
  isVerified?: boolean;
  onAddClick: () => void;
}

export const MenuEmptyState = ({ isSearching, isVerified, onAddClick }: MenuEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-6">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
      style={{ background: "rgba(226,55,116,0.06)" }}
    >
      🍽️
    </div>

    <p
      className="text-xl tracking-wide mb-1"
      style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}
    >
      {isSearching ? "No Items Found" : "Your Menu Is Empty"}
    </p>

    <p className="text-sm text-center mb-6" style={{ color: "#bbb", maxWidth: 280 }}>
      {isSearching
        ? "Try a different search or clear the filter"
        : "Start building your menu by adding your first dish"}
    </p>

    {!isSearching && (
      <button
        disabled={!isVerified}
        onClick={onAddClick}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
        style={{
          background: "linear-gradient(135deg,#E23774,#FF6B35)",
          border: "none", cursor: isVerified ? "pointer" : "not-allowed",
          boxShadow: "0 4px 16px rgba(226,55,116,0.3)",
        }}
      >
        {isVerified
          ? <><FiPlus size={15} /> Add Your First Item</>
          : "Your account is not verified"}
      </button>
    )}
  </div>
);