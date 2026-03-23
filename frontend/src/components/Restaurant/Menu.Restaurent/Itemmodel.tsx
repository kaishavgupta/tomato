import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { FiX, FiImage, FiSave } from "react-icons/fi";
import type { MenuItem, ItemStatus } from "../../../types/menu.types";
import {
  CATEGORIES,
  inputBase,
  labelBase,
  onFocusInput,
  onBlurInput,
} from "../Menu.Restaurent/Menu.Constants";
import { VegDot } from "../Menu.Restaurent/Menuprimitives";

interface ItemModalProps {
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, "_id"> & { _id?: string }) => void;
  onEdit: (params: {
    item: MenuItem & { _newFile?: File };
    item_id: string;
    public_id: string;
  }) => void;
}

export const ItemModal = ({
  item,
  onClose,
  onSave,
  onEdit,
}: ItemModalProps) => {
  const isEdit = !!item;
  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    item_name: item?.item_name ?? "",
    description: item?.description ?? "",
    price: item?.price ? String(item.price) : "",
    discountedPrice: item?.discountedPrice ? String(item.discountedPrice) : "",
    category: item?.category ?? CATEGORIES[0],
    isVeg: item?.isVeg ?? true,
    status: (item?.status ?? "paused") as ItemStatus,
    preparationTime: item?.preparationTime
      ? String(item.preparationTime)
      : "20",
    tagInput: "",
    tags: item?.tags ? [...item.tags] : [],
    imagePreview: item?.image?.url ?? "",
    file: null as File | null,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (file: File | null) => {
    if (!file) return;
    set("file", file);
    const reader = new FileReader();
    reader.onload = (e) => set("imagePreview", e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = form.tagInput.trim();
    if (!t) return;

    setForm((prev) => {
      if (prev.tags.includes(t)) {
        return { ...prev, tagInput: "" };
      }

      return {
        ...prev,
        tags: [...prev.tags, t], // ✅ always latest state
        tagInput: "",
      };
    });
  };
  
  const removeTag = (t: string) =>
    set(
      "tags",
      form.tags.filter((x) => x !== t),
    );

  const handleEditSave = async () => {
    if (!form.item_name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error("Valid price is required");
      return;
    }

    setSaving(true);

    if (isEdit) {
      const public_id = item.image?.public_id ?? "";
      const item_id = item._id;

      const updatedItem: MenuItem & { _newFile?: File } = {
        ...item,
        item_name: form.item_name,
        description: form.description,
        price: Number(form.price),
        discountedPrice: form.discountedPrice
          ? Number(form.discountedPrice)
          : undefined,
        category: form.category,
        isVeg: form.isVeg,
        status: form.status,
        preparationTime: Number(form.preparationTime),
        tags: form.tags,
        image: item.image, // always keep { url, public_id } here
        _newFile: form.file ?? undefined,
      };
      onEdit({ item: updatedItem, item_id, public_id });
    } else {
      onSave(form);
    }

    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 200,
        background: "rgba(26,10,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 shrink-0"
          style={{ borderBottom: "1.5px solid rgba(226,55,116,0.08)" }}
        >
          <div>
            <h2
              className="text-2xl tracking-wide"
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                color: "#1A0A00",
              }}
            >
              {isEdit ? "Edit Menu Item" : "Add New Item"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
              {isEdit
                ? "Update this item's details"
                : "Fill in the details to add a new dish"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(226,55,116,0.07)",
              border: "none",
              cursor: "pointer",
              color: "#E23774",
            }}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          {/* Image upload */}
          <div className="mb-6">
            <label style={labelBase}>Item Photo</label>
            <div
              className="w-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center relative group"
              style={{
                height: 160,
                background: form.imagePreview
                  ? "transparent"
                  : "linear-gradient(135deg,rgba(226,55,116,0.06),rgba(255,107,53,0.06))",
                border: "2px dashed rgba(226,55,116,0.2)",
              }}
              onClick={() => imageRef.current?.click()}
            >
              {form.imagePreview ? (
                <>
                  <img
                    src={form.imagePreview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <span className="text-white text-sm font-semibold flex items-center gap-2">
                      <FiImage size={14} /> Change Photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FiImage
                    size={28}
                    style={{ color: "rgba(226,55,116,0.3)" }}
                  />
                  <p className="text-sm" style={{ color: "#ccc" }}>
                    Click to upload item photo
                  </p>
                </div>
              )}
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div className="col-span-2">
              <label style={labelBase}>Item Name *</label>
              <input
                style={inputBase}
                value={form.item_name}
                onChange={(e) => set("item_name", e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                placeholder="e.g. Butter Panner"
              />
            </div>
            <div className="col-span-2">
              <label style={labelBase}>Description</label>
              <textarea
                style={{ ...inputBase, resize: "vertical", minHeight: 72 }}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                placeholder="What's in it? What makes it special?"
              />
            </div>
            <div>
              <label style={labelBase}>Price (₹) *</label>
              <input
                style={inputBase}
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                placeholder="299"
              />
            </div>
            <div>
              <label style={labelBase}>Discounted Price (₹)</label>
              <input
                style={inputBase}
                type="number"
                min="0"
                value={form.discountedPrice}
                onChange={(e) => set("discountedPrice", e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                placeholder="249 (optional)"
              />
            </div>
            <div>
              <label style={labelBase}>Category *</label>
              <select
                style={{ ...inputBase, cursor: "pointer" }}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelBase}>Prep Time (mins)</label>
              <input
                style={inputBase}
                type="number"
                min="1"
                value={form.preparationTime}
                onChange={(e) => set("preparationTime", e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                placeholder="20"
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label style={labelBase}>Type</label>
              <button
                onClick={() => set("isVeg", !form.isVeg)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-semibold transition-all"
                style={{
                  background: form.isVeg
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(239,68,68,0.08)",
                  border: `1.5px solid ${form.isVeg ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  color: form.isVeg ? "#16a34a" : "#ef4444",
                  cursor: "pointer",
                }}
              >
                <VegDot isVeg={form.isVeg} />
                {form.isVeg ? "Vegetarian" : "Non-Vegetarian"}
              </button>
            </div>
            <div className="col-span-2">
              <label style={labelBase}>Tags</label>
              <div className="flex gap-2">
                <input
                  style={{ ...inputBase, flex: 1 }}
                  value={form.tagInput}
                  onChange={(e) => set("tagInput", e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  placeholder='Type a tag and press Enter — e.g. "Spicy", "Bestseller"'
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
                  style={{
                    background: "rgba(226,55,116,0.08)",
                    color: "#E23774",
                    border: "1.5px solid rgba(226,55,116,0.15)",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
                      style={{
                        background: "rgba(226,55,116,0.07)",
                        color: "#E23774",
                        border: "1px solid rgba(226,55,116,0.15)",
                      }}
                    >
                      {t}
                      <button
                        onClick={() => removeTag(t)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#E23774",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-7 py-5 shrink-0"
          style={{ borderTop: "1.5px solid rgba(226,55,116,0.08)" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold"
            style={{
              background: "white",
              color: "#888",
              border: "1.5px solid rgba(226,55,116,0.12)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold"
            style={{
              background: saving
                ? "#F0E0E8"
                : "linear-gradient(135deg,#E23774,#FF6B35)",
              color: saving ? "#E23774" : "white",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 16px rgba(226,55,116,0.3)",
            }}
          >
            {saving ? (
              <>
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "#E23774",
                    borderTopColor: "transparent",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <FiSave size={14} />
                {isEdit ? "Save Changes" : "Add Item"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
