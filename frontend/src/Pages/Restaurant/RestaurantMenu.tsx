import { useState, useRef } from "react";
import { useRestaurant } from "../../Hooks/useRestaurant";
import toast from "react-hot-toast";
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage,
  FiToggleLeft, FiToggleRight, FiX, FiSave,
  FiGrid, FiList, FiTag, FiPackage, FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";

// ── types ─────────────────────────────────────────────────────────────────
type ItemStatus = "available" | "paused" | "out_of_stock";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  isVeg: boolean;
  status: ItemStatus;
  preparationTime: number; // mins
  tags: string[];
}

// ── constants ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Starters", "Main Course", "Breads", "Rice & Biryani",
  "Desserts", "Beverages", "Soups", "Salads", "Snacks", "Combos",
];

const STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string }> = {
  available:    { label: "Available",    color: "#16a34a", bg: "rgba(34,197,94,0.10)"   },
  paused:       { label: "Paused",       color: "#d97706", bg: "rgba(245,158,11,0.10)"  },
  out_of_stock: { label: "Out of Stock", color: "#ef4444", bg: "rgba(239,68,68,0.10)"   },
};

// ── seed data (replace with real API) ────────────────────────────────────
const SEED_ITEMS: MenuItem[] = [];

// ── shared style tokens ───────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "1.5px solid rgba(226,55,116,0.15)", background: "white",
  fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1A0A00",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};
const labelBase: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#E23774", marginBottom: 6,
};
const onFocus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "#E23774");
const onBlur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(226,55,116,0.15)");

// ── Field wrapper ─────────────────────────────────────────────────────────
const Field = ({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) => (
  <div className={half ? "" : "col-span-2"} style={{ marginBottom: 4 }}>
    <label style={labelBase}>{label}</label>
    {children}
  </div>
);

// ── Veg / Non-veg dot ─────────────────────────────────────────────────────
const VegDot = ({ isVeg }: { isVeg: boolean }) => (
  <span
    className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
    style={{ border: `2px solid ${isVeg ? "#16a34a" : "#ef4444"}` }}
  >
    <span className="w-2 h-2 rounded-full" style={{ background: isVeg ? "#16a34a" : "#ef4444" }} />
  </span>
);

// ── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const m = STATUS_META[status];
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
};

// ── Add / Edit Modal ──────────────────────────────────────────────────────
interface ModalProps {
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, "_id"> & { _id?: string }) => void;
}

const ItemModal = ({ item, onClose, onSave }: ModalProps) => {
  const isEdit = !!item;
  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:             item?.name             ?? "",
    description:      item?.description      ?? "",
    price:            item?.price            ? String(item.price) : "",
    discountedPrice:  item?.discountedPrice  ? String(item.discountedPrice) : "",
    category:         item?.category         ?? CATEGORIES[0],
    isVeg:            item?.isVeg            ?? true,
    status:           item?.status           ?? "available" as ItemStatus,
    preparationTime:  item?.preparationTime  ? String(item.preparationTime) : "20",
    tagInput:         "",
    tags:             item?.tags            ?? [] as string[],
    image:            item?.image           ?? "",
    imageFile:        null as File | null,
    imagePreview:     item?.image           ?? "",
  });

  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (file: File | null) => {
    if (!file) return;
    set("imageFile", file);
    const reader = new FileReader();
    reader.onload = e => set("imagePreview", e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    set("tagInput", "");
  };

  const removeTag = (t: string) => set("tags", form.tags.filter(x => x !== t));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }
    setSaving(true);
    // TODO: wire to your API — upload imageFile to cloudinary, then POST/PUT
    await new Promise(r => setTimeout(r, 800));
    onSave({
      ...(item?._id ? { _id: item._id } : {}),
      name:            form.name,
      description:     form.description,
      price:           Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      category:        form.category,
      isVeg:           form.isVeg,
      status:          form.status,
      preparationTime: Number(form.preparationTime),
      tags:            form.tags,
      image:           form.imagePreview || "https://via.placeholder.com/400x300?text=No+Image",
    });
    setSaving(false);
  };

  return (
    // backdrop
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 200, background: "rgba(26,10,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "white",
          boxShadow: "0 32px 80px rgba(226,55,116,0.18)",
          maxHeight: "90vh",
          animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* modal header */}
        <div className="flex items-center justify-between px-7 py-5 flex-shrink-0"
          style={{ borderBottom: "1.5px solid rgba(226,55,116,0.08)" }}>
          <div>
            <h2 className="text-2xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
              {isEdit ? "Edit Menu Item" : "Add New Item"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
              {isEdit ? "Update this item's details" : "Fill in the details to add a new dish"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(226,55,116,0.07)", border: "none", cursor: "pointer", color: "#E23774" }}>
            <FiX size={16} />
          </button>
        </div>

        {/* modal body — scrollable */}
        <div className="overflow-y-auto flex-1 px-7 py-6">

          {/* image upload */}
          <div className="mb-6">
            <label style={labelBase}>Item Photo</label>
            <div
              className="w-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center relative group"
              style={{ height: 160, background: form.imagePreview ? "transparent" : "linear-gradient(135deg,rgba(226,55,116,0.06),rgba(255,107,53,0.06))", border: "2px dashed rgba(226,55,116,0.2)" }}
              onClick={() => imageRef.current?.click()}
            >
              {form.imagePreview ? (
                <>
                  <img src={form.imagePreview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.4)" }}>
                    <span className="text-white text-sm font-semibold flex items-center gap-2"><FiImage size={14} /> Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FiImage size={28} style={{ color: "rgba(226,55,116,0.3)" }} />
                  <p className="text-sm" style={{ color: "#ccc" }}>Click to upload item photo</p>
                </div>
              )}
              <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleImage(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {/* form grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">

            {/* name */}
            <div className="col-span-2">
              <label style={labelBase}>Item Name *</label>
              <input style={inputBase} value={form.name} onChange={e => set("name", e.target.value)}
                onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Butter Chicken" />
            </div>

            {/* description */}
            <div className="col-span-2">
              <label style={labelBase}>Description</label>
              <textarea style={{ ...inputBase, resize: "vertical", minHeight: 72 }}
                value={form.description} onChange={e => set("description", e.target.value)}
                onFocus={onFocus} onBlur={onBlur} placeholder="What's in it? What makes it special?" />
            </div>

            {/* price */}
            <div>
              <label style={labelBase}>Price (₹) *</label>
              <input style={inputBase} type="number" min="0" value={form.price}
                onChange={e => set("price", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="299" />
            </div>

            {/* discounted price */}
            <div>
              <label style={labelBase}>Discounted Price (₹)</label>
              <input style={inputBase} type="number" min="0" value={form.discountedPrice}
                onChange={e => set("discountedPrice", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="249 (optional)" />
            </div>

            {/* category */}
            <div>
              <label style={labelBase}>Category *</label>
              <select style={{ ...inputBase, cursor: "pointer" }} value={form.category}
                onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* prep time */}
            <div>
              <label style={labelBase}>Prep Time (mins)</label>
              <input style={inputBase} type="number" min="1" value={form.preparationTime}
                onChange={e => set("preparationTime", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="20" />
            </div>

            {/* status */}
            <div>
              <label style={labelBase}>Status</label>
              <select style={{ ...inputBase, cursor: "pointer" }} value={form.status}
                onChange={e => set("status", e.target.value as ItemStatus)}>
                <option value="available">Available</option>
                <option value="paused">Paused</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* veg toggle */}
            <div className="flex flex-col justify-end pb-0.5">
              <label style={labelBase}>Type</label>
              <button
                onClick={() => set("isVeg", !form.isVeg)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-semibold transition-all"
                style={{
                  background: form.isVeg ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1.5px solid ${form.isVeg ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  color: form.isVeg ? "#16a34a" : "#ef4444", cursor: "pointer",
                }}
              >
                <VegDot isVeg={form.isVeg} />
                {form.isVeg ? "Vegetarian" : "Non-Vegetarian"}
              </button>
            </div>

            {/* tags */}
            <div className="col-span-2">
              <label style={labelBase}>Tags</label>
              <div className="flex gap-2">
                <input
                  style={{ ...inputBase, flex: 1 }}
                  value={form.tagInput}
                  onChange={e => set("tagInput", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  onFocus={onFocus} onBlur={onBlur}
                  placeholder='Type a tag and press Enter — e.g. "Spicy", "Bestseller"'
                />
                <button onClick={addTag}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
                  style={{ background: "rgba(226,55,116,0.08)", color: "#E23774", border: "1.5px solid rgba(226,55,116,0.15)", cursor: "pointer" }}>
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
                      style={{ background: "rgba(226,55,116,0.07)", color: "#E23774", border: "1px solid rgba(226,55,116,0.15)" }}>
                      {t}
                      <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#E23774", padding: 0, lineHeight: 1 }}>
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* modal footer */}
        <div className="flex items-center justify-between px-7 py-5 flex-shrink-0"
          style={{ borderTop: "1.5px solid rgba(226,55,116,0.08)" }}>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: "white", color: "#888", border: "1.5px solid rgba(226,55,116,0.12)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white"
            style={{
              background: saving ? "#F0E0E8" : "linear-gradient(135deg,#E23774,#FF6B35)",
              color: saving ? "#E23774" : "white", border: "none", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 16px rgba(226,55,116,0.3)",
            }}>
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#E23774", borderTopColor: "transparent" }} />Saving…</>
              : <><FiSave size={14} />{isEdit ? "Save Changes" : "Add Item"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete confirm modal ──────────────────────────────────────────────────
const DeleteModal = ({ item, onClose, onConfirm }: { item: MenuItem; onClose: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4"
    style={{ zIndex: 200, background: "rgba(26,10,0,0.45)", backdropFilter: "blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="w-full max-w-sm rounded-3xl overflow-hidden"
      style={{ background: "white", boxShadow: "0 32px 80px rgba(239,68,68,0.15)", animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <div className="px-7 py-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(239,68,68,0.08)" }}>
          <FiTrash2 size={20} style={{ color: "#ef4444" }} />
        </div>
        <h2 className="text-2xl tracking-wide mb-1" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
          Delete Item?
        </h2>
        <p className="text-sm mb-1" style={{ color: "#444" }}>
          You're about to delete <strong>{item.name}</strong>.
        </p>
        <p className="text-xs" style={{ color: "#aaa" }}>
          This cannot be undone. The item will be permanently removed from your menu.
        </p>
      </div>
      <div className="flex gap-3 px-7 pb-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: "white", color: "#888", border: "1.5px solid rgba(0,0,0,0.1)", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Item card (grid view) ─────────────────────────────────────────────────
const ItemCard = ({
  item, onEdit, onDelete, onToggleStatus, delay,
}: {
  item: MenuItem; onEdit: () => void; onDelete: () => void;
  onToggleStatus: () => void; delay: number;
}) => {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{
        background: "white", border: "1.5px solid rgba(226,55,116,0.08)",
        boxShadow: "0 4px 20px rgba(226,55,116,0.05)",
        animation: `fadeUp 0.4s ease ${delay}s both`,
        opacity: item.status === "paused" || item.status === "out_of_stock" ? 0.75 : 1,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(226,55,116,0.13)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(226,55,116,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      {/* image */}
      <div className="relative" style={{ height: 160, overflow: "hidden", background: "linear-gradient(135deg,rgba(226,55,116,0.06),rgba(255,107,53,0.06))" }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage size={32} style={{ color: "rgba(226,55,116,0.2)" }} />
          </div>
        )}

        {/* veg dot — top left */}
        <div className="absolute top-3 left-3">
          <VegDot isVeg={item.isVeg} />
        </div>

        {/* status badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} />
        </div>

        {/* discount ribbon */}
        {hasDiscount && (
          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}>
            {Math.round((1 - item.discountedPrice! / item.price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold leading-tight" style={{ color: "#1A0A00" }}>{item.name}</h3>
          <div className="flex gap-1.5 flex-shrink-0">
            {/* edit */}
            <button onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(226,55,116,0.07)", border: "none", cursor: "pointer", color: "#E23774" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(226,55,116,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(226,55,116,0.07)")}>
              <FiEdit2 size={12} />
            </button>
            {/* delete */}
            <button onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(239,68,68,0.07)", border: "none", cursor: "pointer", color: "#ef4444" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}>
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>

        {item.description && (
          <p className="text-xs mb-2 line-clamp-2" style={{ color: "#888" }}>{item.description}</p>
        )}

        {/* price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: "#1A0A00" }}>
            ₹{hasDiscount ? item.discountedPrice : item.price}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: "#ccc" }}>₹{item.price}</span>
          )}
        </div>

        {/* tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(226,55,116,0.06)", color: "#E23774" }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* footer — category + pause toggle */}
        <div className="flex items-center justify-between mt-auto pt-3"
          style={{ borderTop: "1px solid rgba(226,55,116,0.07)" }}>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg"
            style={{ background: "#FFF8F0", color: "#aaa" }}>
            {item.category}
          </span>

          {/* pause / resume toggle */}
          <button onClick={onToggleStatus}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-xl transition-all"
            style={{
              background: item.status === "available" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
              color: item.status === "available" ? "#d97706" : "#16a34a",
              border: `1.5px solid ${item.status === "available" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
              cursor: "pointer",
            }}>
            {item.status === "available"
              ? <><FiToggleLeft size={13} /> Pause</>
              : <><FiToggleRight size={13} /> Resume</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Item row (list view) ──────────────────────────────────────────────────
const ItemRow = ({
  item, onEdit, onDelete, onToggleStatus,
}: {
  item: MenuItem; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void;
}) => {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(226,55,116,0.02)]"
      style={{ borderBottom: "1px solid rgba(226,55,116,0.06)", opacity: item.status !== "available" ? 0.75 : 1 }}>

      {/* thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
        style={{ background: "rgba(226,55,116,0.06)" }}>
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><FiImage size={18} style={{ color: "rgba(226,55,116,0.2)" }} /></div>}
      </div>

      {/* name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <VegDot isVeg={item.isVeg} />
          <span className="text-sm font-semibold" style={{ color: "#1A0A00" }}>{item.name}</span>
          <StatusBadge status={item.status} />
          {item.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(226,55,116,0.06)", color: "#E23774" }}>{t}</span>
          ))}
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: "#aaa" }}>{item.category} · {item.preparationTime} min</p>
      </div>

      {/* price */}
      <div className="text-right flex-shrink-0 hidden md:block">
        <p className="text-sm font-bold" style={{ color: "#1A0A00" }}>₹{hasDiscount ? item.discountedPrice : item.price}</p>
        {hasDiscount && <p className="text-xs line-through" style={{ color: "#ccc" }}>₹{item.price}</p>}
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onToggleStatus}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-xl"
          style={{
            background: item.status === "available" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
            color: item.status === "available" ? "#d97706" : "#16a34a",
            border: `1.5px solid ${item.status === "available" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
            cursor: "pointer",
          }}>
          {item.status === "available" ? <><FiToggleLeft size={12} /> Pause</> : <><FiToggleRight size={12} /> Resume</>}
        </button>
        <button onClick={onEdit}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(226,55,116,0.07)", border: "none", cursor: "pointer", color: "#E23774" }}>
          <FiEdit2 size={13} />
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.07)", border: "none", cursor: "pointer", color: "#ef4444" }}>
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ── main component ─────────────────────────────────────────────────────────
const RestaurantMenu = () => {
  const { restaurantData } = useRestaurant();

  const [items, setItems]               = useState<MenuItem[]>(SEED_ITEMS);
  const [view, setView]                 = useState<"grid" | "list">("grid");
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<ItemStatus | "all">("all");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editItem, setEditItem]         = useState<MenuItem | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  // ── derived ──────────────────────────────────────────────────────────
  const usedCategories = ["All", ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = items.filter(item => {
    const matchCat    = activeCategory === "All" || item.category === activeCategory;
    const matchStatus = activeStatus === "all" || item.status === activeStatus;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchStatus && matchSearch;
  });

  const counts = {
    total:     items.length,
    available: items.filter(i => i.status === "available").length,
    paused:    items.filter(i => i.status === "paused").length,
    outStock:  items.filter(i => i.status === "out_of_stock").length,
  };

  // ── handlers ─────────────────────────────────────────────────────────
  const openAdd  = () => { setEditItem(undefined); setModalOpen(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setModalOpen(true); };

  const handleSave = (saved: Omit<MenuItem, "_id"> & { _id?: string }) => {
    if (saved._id) {
      setItems(prev => prev.map(i => i._id === saved._id ? { ...i, ...saved } as MenuItem : i));
      toast.success("Item updated!");
    } else {
      const newItem: MenuItem = { ...saved, _id: `item_${Date.now()}` } as MenuItem;
      setItems(prev => [...prev, newItem]);
      toast.success("Item added!");
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (item: MenuItem) => {
    const next: ItemStatus = item.status === "available" ? "paused" : "available";
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: next } : i));
    toast.success(`"${item.name}" ${next === "available" ? "resumed" : "paused"}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* bg blob */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", opacity: 0.04, background: "linear-gradient(135deg,#E23774,#FF6B35)", clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)" }} />
      </div>

      <div className="relative px-4 md:px-10 py-8 max-w-7xl mx-auto" style={{ zIndex: 1 }}>

        {/* ── page header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E23774" }}>Restaurant</p>
            <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>Menu</h1>
            <p className="text-sm mt-1" style={{ color: "#aaa" }}>Add, edit, pause or remove items from your menu</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(226,55,116,0.35)" }}>
            <FiPlus size={16} /> Add New Item
          </button>
        </div>

        {/* ── summary stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Items",    value: counts.total,     color: "#E23774", bg: "rgba(226,55,116,0.08)", icon: <FiPackage size={16} /> },
            { label: "Available",      value: counts.available, color: "#16a34a", bg: "rgba(34,197,94,0.08)",  icon: <FiToggleRight size={16} /> },
            { label: "Paused",         value: counts.paused,    color: "#d97706", bg: "rgba(245,158,11,0.08)", icon: <FiToggleLeft size={16} /> },
            { label: "Out of Stock",   value: counts.outStock,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",  icon: <FiAlertCircle size={16} /> },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)", animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg, color: s.color }}>{s.icon}</span>
              <div>
                <p className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#aaa" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── main panel ── */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 8px 40px rgba(226,55,116,0.07)" }}>

          {/* toolbar */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
            <div className="flex flex-col md:flex-row gap-3 mb-4">

              {/* search */}
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#ccc" }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search items by name, description or tag…"
                  className="w-full rounded-2xl text-sm outline-none"
                  style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: "1.5px solid rgba(226,55,116,0.12)", background: "#FFF8F0", color: "#1A0A00", fontFamily: "'DM Sans',sans-serif" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#E23774"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(226,55,116,0.12)"} />
              </div>

              {/* status filter */}
              <div className="relative">
                <select
                  value={activeStatus}
                  onChange={e => setActiveStatus(e.target.value as ItemStatus | "all")}
                  className="appearance-none rounded-2xl text-sm font-semibold pr-8 pl-4 py-2.5 outline-none"
                  style={{ background: "#FFF8F0", border: "1.5px solid rgba(226,55,116,0.12)", color: "#555", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="paused">Paused</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#aaa" }} />
              </div>

              {/* view toggle */}
              <div className="flex rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(226,55,116,0.12)" }}>
                {(["grid", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className="flex items-center justify-center px-3 py-2.5 transition-all"
                    style={{
                      background: view === v ? "linear-gradient(135deg,#E23774,#FF6B35)" : "white",
                      color: view === v ? "white" : "#aaa",
                      border: "none", cursor: "pointer",
                    }}>
                    {v === "grid" ? <FiGrid size={15} /> : <FiList size={15} />}
                  </button>
                ))}
              </div>
            </div>

            {/* category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {usedCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all"
                  style={{
                    background: activeCategory === cat ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.06)",
                    color: activeCategory === cat ? "white" : "#888",
                    border: "none", cursor: "pointer",
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* item list / grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(226,55,116,0.06)" }}>🍽️</div>
              <p className="text-xl tracking-wide mb-1" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
                {search ? "No Items Found" : "Your Menu Is Empty"}
              </p>
              <p className="text-sm text-center mb-6" style={{ color: "#bbb", maxWidth: 280 }}>
                {search
                  ? "Try a different search or clear the filter"
                  : "Start building your menu by adding your first dish"}
              </p>
              {!search && (
                <button onClick={openAdd}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(226,55,116,0.3)" }}>
                  <FiPlus size={15} /> Add Your First Item
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item, i) => (
                <ItemCard key={item._id} item={item} delay={i * 0.04}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggleStatus={() => handleToggleStatus(item)} />
              ))}
            </div>
          ) : (
            <div>
              {filtered.map(item => (
                <ItemRow key={item._id} item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onToggleStatus={() => handleToggleStatus(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── modals ── */}
      {modalOpen && (
        <ItemModal
          item={editItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden }
      `}</style>
    </div>
  );
};

export default RestaurantMenu;