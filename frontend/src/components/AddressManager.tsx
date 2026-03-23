// src/components/AddressManager.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable address management panel.
//
// Modes:
//   default (user settings) → multi-address. Add / Edit / Delete / SetDefault.
//                             The ADD form always shows at top.
//                             Each card has Edit (pencil) + Delete + Star buttons.
//   singleMode (restaurant) → ONE address. If none → show add form with
//                             map auto-locating. If exists → card + Edit button.
//   listOnly (cart)         → read-only selectable cards, no form.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  MapContainer, TileLayer, Marker,
  useMapEvents, useMap,
} from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import { LuLocateFixed } from "react-icons/lu";
import {
  BiLoader, BiPlus, BiTrash, BiStar, BiCheck, BiEdit, BiX,
} from "react-icons/bi";
import {
  FiMapPin, FiPhone, FiHome, FiBriefcase, FiMoreHorizontal,
} from "react-icons/fi";
import type { UserAddress, AddAddressPayload, UpdateAddressPayload } from "../api/api.address";

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── types ─────────────────────────────────────────────────────────────────────

interface AddressManagerProps {
  addresses: UserAddress[];
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  removingId: string | undefined;
  isSettingDefault: boolean;
  settingDefaultId: string | undefined;
  addAddress: (payload: AddAddressPayload) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  // ✅ NEW — for edit support in user settings
  updateAddress?: (payload: UpdateAddressPayload) => void;
  isUpdating?: boolean;
  updatingId?: string;
  // cart
  listOnly?: boolean;
  selectedId?: string;
  onSelect?: (address: UserAddress) => void;
  // restaurant
  singleMode?: boolean;
}

type AddrType = "home" | "work" | "other";

const TYPE_OPTIONS: { value: AddrType; label: string; icon: React.ReactNode }[] = [
  { value: "home",  label: "Home",  icon: <FiHome size={12} /> },
  { value: "work",  label: "Work",  icon: <FiBriefcase size={12} /> },
  { value: "other", label: "Other", icon: <FiMoreHorizontal size={12} /> },
];

// ── Map helpers ───────────────────────────────────────────────────────────────

const LocationPicker = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// Auto-flies map to given coords when they change
export const MapFlyTo = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { animate: true });
  }, [lat, lng]);
  return null;
};

const LocateMeButton = ({
  onLocate,
  seedLat,
  seedLng,
}: {
  onLocate: (lat: number, lng: number) => void;
  seedLat?: number | null;
  seedLng?: number | null;
}) => {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  // Auto-locate on mount when no seed coords (fresh add form)
  useEffect(() => {
    if (seedLat != null && seedLng != null) return; // already seeded
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => {} // silent — user can click button manually
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
        setLoading(false);
      },
      () => { toast.error("Location permission denied"); setLoading(false); }
    );
  };

  return (
    <button
      onClick={locate}
      style={{
        position: "absolute", top: 12, right: 12, zIndex: 1000,
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 14px", borderRadius: 12,
        background: "white", border: "1.5px solid rgba(226,55,116,0.18)",
        color: "#E23774", fontSize: 12, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 2px 10px rgba(226,55,116,0.15)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {loading
        ? <BiLoader size={14} style={{ animation: "spin 0.7s linear infinite" }} />
        : <LuLocateFixed size={14} />}
      Use my location
    </button>
  );
};

// ── Address card ──────────────────────────────────────────────────────────────

const AddressCard = ({
  addr, isRemoving, isSettingDefault,
  onRemove, onSetDefault, onEdit,
  selected, onSelect, singleMode,
}: {
  addr: UserAddress;
  isRemoving: boolean;
  isSettingDefault: boolean;
  onRemove: () => void;
  onSetDefault: () => void;
  onEdit: () => void;
  selected?: boolean;
  onSelect?: () => void;
  singleMode?: boolean;
}) => {
  const isClickable = !!onSelect;
  const lat = addr.userAddress.coordinates[1];
  const lng = addr.userAddress.coordinates[0];

  return (
    <div
      onClick={isClickable ? onSelect : undefined}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 16px", borderRadius: 18,
        background: "white",
        border: selected
          ? "2px solid #E23774"
          : addr.isDefault
          ? "1.5px solid rgba(226,55,116,0.35)"
          : "1.5px solid rgba(226,55,116,0.10)",
        boxShadow: selected
          ? "0 4px 20px rgba(226,55,116,0.18)"
          : "0 2px 10px rgba(226,55,116,0.05)",
        cursor: isClickable ? "pointer" : "default",
        transition: "all 0.18s",
        animation: "fadeUp 0.28s ease both",
        position: "relative",
      }}
    >
      {/* icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: addr.isDefault
          ? "linear-gradient(135deg,#E23774,#FF6B35)"
          : "rgba(226,55,116,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FiMapPin size={16} color={addr.isDefault ? "white" : "#E23774"} />
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
          {addr.isDefault && (
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "2px 8px", borderRadius: 99,
              background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
            }}>Default</span>
          )}
          {addr.userAddress.typeOfAddress && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#E23774",
              padding: "2px 8px", borderRadius: 99,
              background: "rgba(226,55,116,0.08)",
            }}>
              {addr.userAddress.typeOfAddress.charAt(0).toUpperCase() + addr.userAddress.typeOfAddress.slice(1)}
            </span>
          )}
        </div>
        <p style={{
          fontSize: 13, fontWeight: 600, color: "#1A0A00", lineHeight: 1.4,
          marginBottom: 4, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {addr.userAddress.formatedAddress}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#aaa" }}>
          <FiPhone size={10} /> {addr.phone}
        </div>
        <p style={{ fontSize: 9, color: "#ccc", marginTop: 4 }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>

      {/* actions (not shown in cart list-only mode) */}
      {!isClickable && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {/* Edit — shown in both modes */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit"
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: "rgba(226,55,116,0.07)",
              border: "1.5px solid rgba(226,55,116,0.18)",
              cursor: "pointer", color: "#E23774",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <BiEdit size={13} />
          </button>

          {/* Star — only in multi-address mode, only for non-default */}
          {!singleMode && !addr.isDefault && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
              disabled={isSettingDefault}
              title="Set as default"
              style={{
                width: 30, height: 30, borderRadius: 10,
                background: "rgba(226,55,116,0.07)",
                border: "1.5px solid rgba(226,55,116,0.18)",
                cursor: isSettingDefault ? "wait" : "pointer",
                color: "#E23774",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {isSettingDefault
                ? <BiLoader size={13} style={{ animation: "spin 0.7s linear infinite" }} />
                : <BiStar size={13} />}
            </button>
          )}

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            disabled={isRemoving}
            title="Remove"
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: "rgba(239,68,68,0.07)",
              border: "1.5px solid rgba(239,68,68,0.18)",
              cursor: isRemoving ? "wait" : "pointer",
              color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {isRemoving
              ? <BiLoader size={13} style={{ animation: "spin 0.7s linear infinite" }} />
              : <BiTrash size={13} />}
          </button>
        </div>
      )}

      {/* cart selected tick */}
      {isClickable && selected && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 22, height: 22, borderRadius: "50%",
          background: "linear-gradient(135deg,#E23774,#FF6B35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BiCheck size={14} color="white" />
        </div>
      )}
    </div>
  );
};

// ── Map form (add or edit) ────────────────────────────────────────────────────

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

interface MapFormProps {
  // when editing, pre-fill these
  initialLat?: number;
  initialLng?: number;
  initialPhone?: string;
  initialType?: AddrType;
  initialFmtAddr?: string;
  initialIsDefault?: boolean;
  // context
  addresses: UserAddress[];
  isSubmitting: boolean;
  onSave: (payload: {
    phone: string;
    latitude: number;
    longitude: number;
    formatedAddress: string;
    typeOfAddress: AddrType;
    setdefault: boolean;
  }) => void;
  onCancel?: () => void;
  singleMode?: boolean;
  headerLabel?: string;
  submitLabel?: string;
}

const MapForm = ({
  initialLat, initialLng,
  initialPhone = "", initialType = "home",
  initialFmtAddr = "", initialIsDefault = false,
  addresses, isSubmitting,
  onSave, onCancel,
  singleMode, headerLabel = "Add New Address", submitLabel,
}: MapFormProps) => {
  const [lat,         setLat]         = useState<number | null>(initialLat ?? null);
  const [lng,         setLng]         = useState<number | null>(initialLng ?? null);
  const [fmtAddr,     setFmtAddr]     = useState(initialFmtAddr);
  const [phone,       setPhone]       = useState(initialPhone);
  const [type,        setType]        = useState<AddrType>(initialType);
  const [makeDefault, setMakeDefault] = useState(initialIsDefault);
  const [geocoding,   setGeocoding]   = useState(false);

  const reverseGeocode = async (la: number, lo: number) => {
    setGeocoding(true);
    try {
      const res  = await fetch(`${NOMINATIM}?format=json&lat=${la}&lon=${lo}`);
      const data = await res.json();
      setFmtAddr(data.display_name || "");
    } catch {
      toast.error("Could not fetch address label");
    } finally {
      setGeocoding(false);
    }
  };

  const handlePick = (la: number, lo: number) => {
    setLat(la); setLng(lo);
    reverseGeocode(la, lo);
  };

  const handleSave = () => {
    if (!phone.trim())            { toast.error("Phone number is required"); return; }
    if (lat === null || lng === null) { toast.error("Please pick a location on the map"); return; }
    if (!fmtAddr.trim())          { toast.error("Address could not be resolved — try again"); return; }
    onSave({
      phone: phone.trim(),
      latitude: lat,
      longitude: lng,
      formatedAddress: fmtAddr,
      typeOfAddress: type,
      setdefault: singleMode ? true : (makeDefault || addresses.length === 0),
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 12,
    border: "1.5px solid rgba(226,55,116,0.18)",
    background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, color: "#1A0A00", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.18s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
    textTransform: "uppercase", color: "#E23774", marginBottom: 6, display: "block",
  };

  const mapCenter: [number, number] = [lat ?? 28.6139, lng ?? 77.209];

  return (
    <div style={{
      background: "white", borderRadius: 22,
      border: "1.5px solid rgba(226,55,116,0.10)",
      boxShadow: "0 4px 24px rgba(226,55,116,0.07)",
      overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(226,55,116,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 10,
            background: "linear-gradient(135deg,#E23774,#FF6B35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BiEdit size={15} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1A0A00" }}>{headerLabel}</span>
        </div>
        {onCancel && (
          <button onClick={onCancel} style={{
            width: 28, height: 28, borderRadius: 9,
            background: "rgba(226,55,116,0.07)",
            border: "1.5px solid rgba(226,55,116,0.15)",
            cursor: "pointer", color: "#E23774",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BiX size={15} />
          </button>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        {/* map */}
        <div style={{
          position: "relative", borderRadius: 16, overflow: "hidden",
          height: 280, marginBottom: 16,
          border: "1.5px solid rgba(226,55,116,0.10)",
        }}>
          <MapContainer
            center={mapCenter}
            zoom={lat ? 15 : 13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationPicker onPick={handlePick} />
            {/* ✅ Auto-locate on mount if no seed, or fly to seed coords */}
            <LocateMeButton
              onLocate={handlePick}
              seedLat={initialLat}
              seedLng={initialLng}
            />
            {/* ✅ If editing, fly map to existing coords */}
            {initialLat && initialLng && (
              <MapFlyTo lat={initialLat} lng={initialLng} />
            )}
            {lat !== null && lng !== null && <Marker position={[lat, lng]} />}
          </MapContainer>
        </div>

        {/* address preview */}
        {(fmtAddr || geocoding) && (
          <div style={{
            padding: "10px 14px", borderRadius: 12, marginBottom: 14,
            background: "rgba(226,55,116,0.04)",
            border: "1px solid rgba(226,55,116,0.15)",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <FiMapPin size={14} style={{ color: "#E23774", marginTop: 2, flexShrink: 0 }} />
            {geocoding
              ? <span style={{ fontSize: 12, color: "#aaa", animation: "pulse 1.2s infinite" }}>Detecting address…</span>
              : <span style={{ fontSize: 12, color: "#1A0A00", lineHeight: 1.5 }}>{fmtAddr}</span>}
          </div>
        )}

        {/* type pills */}
        <div style={{ marginBottom: 14 }}>
          <span style={labelStyle}>Address Type</span>
          <div style={{ display: "flex", gap: 8 }}>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                  background: type === opt.value
                    ? "linear-gradient(135deg,#E23774,#FF6B35)"
                    : "rgba(226,55,116,0.06)",
                  color: type === opt.value ? "white" : "#888",
                  border: type === opt.value ? "none" : "1.5px solid rgba(226,55,116,0.15)",
                  boxShadow: type === opt.value ? "0 3px 12px rgba(226,55,116,0.25)" : "none",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* phone */}
        <div style={{ marginBottom: 14 }}>
          <span style={labelStyle}>Phone Number</span>
          <div style={{ position: "relative" }}>
            <FiPhone size={13} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#E23774" }} />
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
              onFocus={e => (e.target.style.borderColor = "#E23774")}
              onBlur={e  => (e.target.style.borderColor = "rgba(226,55,116,0.18)")}
            />
          </div>
        </div>

        {/* set-default toggle — multi-address mode only, not first address */}
        {!singleMode && addresses.length > 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 18 }}>
            <div
              onClick={() => setMakeDefault(v => !v)}
              style={{
                width: 38, height: 22, borderRadius: 99, position: "relative",
                background: makeDefault ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.12)",
                transition: "background 0.2s", flexShrink: 0, cursor: "pointer",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: makeDefault ? 19 : 3,
                width: 16, height: 16, borderRadius: "50%", background: "white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Set as default address</span>
          </label>
        )}

        {/* save button */}
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 16, border: "none",
            cursor: isSubmitting ? "wait" : "pointer",
            background: isSubmitting
              ? "rgba(226,55,116,0.3)"
              : "linear-gradient(135deg,#E23774,#FF6B35)",
            color: "white", fontSize: 13, fontWeight: 800, letterSpacing: "0.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(226,55,116,0.3)",
            transition: "all 0.2s",
          }}
        >
          {isSubmitting
            ? <><BiLoader size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Saving…</>
            : <><BiPlus size={16} /> {submitLabel ?? "Save Address"}</>}
        </button>
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

export const AddressManager = ({
  addresses,
  isLoading,
  isAdding,
  isRemoving,
  removingId,
  isSettingDefault,
  settingDefaultId,
  addAddress,
  removeAddress,
  setDefault,
  updateAddress,
  isUpdating = false,
  updatingId,
  listOnly = false,
  selectedId,
  onSelect,
  singleMode = false,
}: AddressManagerProps) => {

  // which card is currently in edit mode (by _id), null = none
  const [editingId, setEditingId] = useState<string | null>(null);

  // singleMode — track whether the edit form is open
  const [singleEditOpen, setSingleEditOpen] = useState(false);

  // ── helper: build edit initial values from an address ────────────────────
  const editInitial = (addr: UserAddress) => ({
    initialLat: addr.userAddress.coordinates[1],
    initialLng: addr.userAddress.coordinates[0],
    initialPhone: addr.phone,
    initialType: (addr.userAddress.typeOfAddress ?? "home") as AddrType,
    initialFmtAddr: addr.userAddress.formatedAddress,
    initialIsDefault: addr.isDefault,
  });

  // ── singleMode ────────────────────────────────────────────────────────────
  if (singleMode) {
    if (isLoading) return <Spinner />;

    // No address → show add form (map auto-locates, no cancel button)
    if (addresses.length === 0) {
      return (
        <>
          <MapForm
            addresses={addresses}
            isSubmitting={isAdding}
            onSave={(p) => addAddress(p)}
            singleMode
            headerLabel="Add Your Address"
            submitLabel="Save Address"
          />
          <Keyframes />
        </>
      );
    }

    const addr = addresses[0];

    // Edit mode
    if (singleEditOpen) {
      return (
        <>
          <MapForm
            {...editInitial(addr)}
            addresses={addresses}
            isSubmitting={isUpdating}
            onSave={(p) => {
              updateAddress?.({ addressId: addr._id, ...p });
              setSingleEditOpen(false);
            }}
            onCancel={() => setSingleEditOpen(false)}
            singleMode
            headerLabel="Edit Your Address"
            submitLabel="Update Address"
          />
          <Keyframes />
        </>
      );
    }

    // Show card with edit + delete
    return (
      <>
        <AddressCard
          addr={addr}
          isRemoving={isRemoving && removingId === addr._id}
          isSettingDefault={false}
          onRemove={() => removeAddress(addr._id)}
          onSetDefault={() => {}}
          onEdit={() => setSingleEditOpen(true)}
          singleMode
        />
        <Keyframes />
      </>
    );
  }

  // ── multi-address (user settings) ─────────────────────────────────────────

  // listOnly = cart — just selectable cards
  if (listOnly) {
    if (isLoading) return <Spinner />;
    if (addresses.length === 0) return (
      <EmptyState listOnly />
    );
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {addresses.map(addr => (
            <AddressCard
              key={addr._id}
              addr={addr}
              isRemoving={false}
              isSettingDefault={false}
              onRemove={() => {}}
              onSetDefault={() => {}}
              onEdit={() => {}}
              selected={selectedId === addr._id}
              onSelect={onSelect ? () => onSelect(addr) : undefined}
            />
          ))}
        </div>
        <Keyframes />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Add form — always visible at top in multi-address mode ── */}
      {editingId === null && (
        <MapForm
          addresses={addresses}
          isSubmitting={isAdding}
          onSave={(p) => addAddress(p)}
          headerLabel="Add New Address"
          submitLabel="Save Address"
        />
      )}

      {/* ── Saved list ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>Saved Addresses</h2>
          <span style={{ fontSize: 12, color: "#aaa" }}>{addresses.length} saved</span>
        </div>

        {isLoading ? (
          <Spinner />
        ) : addresses.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {addresses.map(addr => (
              <div key={addr._id}>
                {/* Edit form inline, below the card being edited */}
                {editingId === addr._id ? (
                  <MapForm
                    {...editInitial(addr)}
                    addresses={addresses}
                    isSubmitting={isUpdating && updatingId === addr._id}
                    onSave={(p) => {
                      updateAddress?.({ addressId: addr._id, ...p });
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    headerLabel="Edit Address"
                    submitLabel="Update Address"
                  />
                ) : (
                  <AddressCard
                    addr={addr}
                    isRemoving={isRemoving && removingId === addr._id}
                    isSettingDefault={isSettingDefault && settingDefaultId === addr._id}
                    onRemove={() => removeAddress(addr._id)}
                    onSetDefault={() => setDefault(addr._id)}
                    onEdit={() => {
                      setEditingId(addr._id);
                      // scroll the form into view smoothly
                      setTimeout(() => {
                        document.getElementById(`edit-form-${addr._id}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                    selected={selectedId === addr._id}
                    onSelect={onSelect ? () => onSelect(addr) : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Keyframes />
    </div>
  );
};

// ── tiny helpers ──────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
    <BiLoader size={24} style={{ color: "#E23774", animation: "spin 0.7s linear infinite" }} />
  </div>
);

const EmptyState = ({ listOnly }: { listOnly?: boolean }) => (
  <div style={{
    textAlign: "center", padding: "40px 20px",
    background: "white", borderRadius: 18,
    border: "1.5px dashed rgba(226,55,116,0.18)",
  }}>
    <FiMapPin size={28} style={{ color: "rgba(226,55,116,0.25)", marginBottom: 10 }} />
    <p style={{ fontSize: 13, fontWeight: 600, color: "#bbb" }}>No addresses yet</p>
    <p style={{ fontSize: 11, color: "#ddd", marginTop: 4 }}>
      {listOnly
        ? "Add an address in Settings to continue."
        : "Pin a location on the map above to get started."}
    </p>
  </div>
);

const Keyframes = () => (
  <style>{`
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `}</style>
);

export default AddressManager;