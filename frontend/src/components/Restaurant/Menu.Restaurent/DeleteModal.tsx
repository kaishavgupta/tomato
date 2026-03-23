import { FiTrash2 } from "react-icons/fi";
import type { MenuItem } from "../../../types/menu.types";

interface DeleteModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal = ({ item, onClose, onConfirm }: DeleteModalProps) => (
  <div
    className="fixed inset-0 flex items-center justify-center p-4"
    style={{ zIndex: 200, background: "rgba(26,10,0,0.45)", backdropFilter: "blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div
      className="w-full max-w-sm rounded-3xl overflow-hidden"
      style={{
        background: "white",
        boxShadow: "0 32px 80px rgba(239,68,68,0.15)",
        animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <div className="px-7 py-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(239,68,68,0.08)" }}
        >
          <FiTrash2 size={20} style={{ color: "#ef4444" }} />
        </div>

        <h2
          className="text-2xl tracking-wide mb-1"
          style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}
        >
          Delete Item
        </h2>
        <p className="text-sm mb-1" style={{ color: "#444" }}>
          You're about to delete <strong>{item.item_name}</strong>.
        </p>
        <p className="text-xs" style={{ color: "#aaa" }}>
          This cannot be undone. The item will be permanently removed from your menu.
        </p>
      </div>

      <div className="flex gap-3 px-7 pb-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: "white", color: "#888", border: "1.5px solid rgba(0,0,0,0.1)", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(239,68,68,0.3)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);