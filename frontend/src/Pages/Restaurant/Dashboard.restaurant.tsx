// src/pages/Restaurant/Dashboard.restaurant.tsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useRestaurant } from "../../Hooks/useRestaurant";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiArrowRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiPackage,
  FiEdit2,
} from "react-icons/fi";

// ── Fix Leaflet default marker icon (missing in Vite builds) ─────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Flies the map view to coords when they are available ─────────────────────
const FlyToLocation = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  map.setView([lat, lng], 15);
  return null;
};

// ── Self-contained mini map for the location card ────────────────────────────
const RestaurantMiniMap = ({ lat, lng }: { lat: number; lng: number }) => (
  <MapContainer
    center={[lat, lng]}
    zoom={15}
    scrollWheelZoom={false}
    dragging={false}
    zoomControl={false}
    doubleClickZoom={false}
    attributionControl={false}
    style={{ width: "100%", height: "100%", borderRadius: 12 }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <FlyToLocation lat={lat} lng={lng} />
    <Marker position={[lat, lng]} />
  </MapContainer>
);

// ── placeholder stats (swap with real API data when ready) ────────────────────
const STATS = [
  {
    label: "Today's Orders",
    value: "0",
    sub: "No orders yet today",
    icon: <FiShoppingBag size={18} />,
    color: "#E23774",
    bg: "rgba(226,55,116,0.08)",
  },
  {
    label: "Revenue Today",
    value: "₹0",
    sub: "Updated in real time",
    icon: <FiDollarSign size={18} />,
    color: "#FF6B35",
    bg: "rgba(255,107,53,0.08)",
  },
  {
    label: "Avg. Rating",
    value: "—",
    sub: "No reviews yet",
    icon: <FiStar size={18} />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    label: "Avg. Prep Time",
    value: "—",
    sub: "Set in settings",
    icon: <FiClock size={18} />,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
];

const RECENT_ORDERS: any[] = [];

const QUICK_ACTIONS = [
  { label: "Add Menu Item", icon: "🍽️", to: "/restaurant/menu" },
  { label: "View Orders",   icon: "📦", to: "/restaurant/orders" },
  { label: "Analytics",     icon: "📈", to: "/restaurant/analytics" },
  { label: "Settings",      icon: "⚙️", to: "/restaurant/settings" },
];

// ── component ──────────────────────────────────────────────────────────────────
const RestaurantDashboard = () => {
  const {
    restaurantData,
    isLoading,
    isRestaurantExist,
    isauth,
    isOpen,
    setOpenClose,
  } = useRestaurant();

  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  // ── loading / auth guard ────────────────────────────────────────────────────
  if (isLoading || !isauth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: "#E23774", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#ccc" }}>
            Loading your restaurant…
          </p>
        </div>
      </div>
    );
  }

  if (!isRestaurantExist) return <Navigate to="/restaurant/create" replace />;

  // ── data (only accessed after guard above) ─────────────────────────────────
  const r = restaurantData!;

  // GeoJSON stores [lng, lat] — extract safely
  const coords = r.autoLocation?.coordinates;
  const lat  = coords ? Number(coords[1]) : null;
  const lng  = coords ? Number(coords[0]) : null;
  const hasLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const canAcceptOrders = isOpen && !r.pauseRestaurent;
  const isPaused        = r.pauseRestaurent;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* bg blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          style={{
            position: "absolute", top: 0, right: 0,
            width: "45%", height: "100%", opacity: 0.04,
            background: "linear-gradient(135deg,#E23774,#FF6B35)",
            clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)",
          }}
        />
        <div style={{ position: "absolute", borderRadius: "50%", opacity: 0.05, width: 320, height: 320, top: -80, left: -80, background: "#E23774" }} />
        <div style={{ position: "absolute", borderRadius: "50%", opacity: 0.04, width: 180, height: 180, bottom: 60, right: 80, background: "#FF6B35" }} />
      </div>

      <div className="relative px-4 md:px-10 py-8 max-w-7xl mx-auto" style={{ zIndex: 1 }}>

        {/* ── hero banner ── */}
        <div
          className="rounded-3xl overflow-hidden mb-8"
          style={{
            background: "white",
            border: "1.5px solid rgba(226,55,116,0.10)",
            boxShadow: "0 8px 48px rgba(226,55,116,0.08)",
          }}
        >
          {/* cover image */}
          <div className="relative w-full" style={{ height: 190 }}>
            <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
              {r.image && !imgErr ? (
                <img
                  src={r.image.url}
                  alt={r.name}
                  onError={() => setImgErr(true)}
                  className={`w-full h-full object-cover ${!r.isVerified || r.pauseRestaurent ? "grayscale" : "grayscale-0"}`}
                />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.5))" }} />
            </div>

            {/* edit button */}
            <button
              onClick={() => navigate("/restaurant/settings")}
              className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", backdropFilter: "blur(8px)" }}
            >
              <FiEdit2 size={12} /> Edit Profile
            </button>

            {/* open/close toggle */}
            <button
              onClick={() => setOpenClose.mutate(!isOpen)}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300"
              style={{
                background: isOpen ? "rgba(34,197,94,0.92)" : "rgba(226,55,116,0.92)",
                color: "white", border: "none", cursor: "pointer",
                backdropFilter: "blur(8px)",
                boxShadow: isOpen ? "0 4px 16px rgba(34,197,94,0.35)" : "0 4px 16px rgba(226,55,116,0.35)",
              }}
            >
              {isOpen ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
              {isOpen ? "Open" : "Closed"}
            </button>

            {/* avatar — hangs below cover */}
            <div
              className="absolute left-6 flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
              style={{
                bottom: -28, width: 56, height: 56, borderRadius: 14,
                border: "3px solid white",
                background: "linear-gradient(135deg,#E23774,#FF6B35)",
                boxShadow: "0 8px 24px rgba(226,55,116,0.35)",
                zIndex: 10,
              }}
            >
              {r.image && !imgErr ? (
                <img src={r.image.url} alt={r.name} className="w-full h-full object-cover" />
              ) : (
                (r.name?.[0]?.toUpperCase() ?? "R")
              )}
            </div>
          </div>

          {/* info */}
          <div className="px-6 pt-10 pb-5 flex flex-col md:flex-row md:items-start gap-4">
            <div className="hidden md:block flex-shrink-0" style={{ width: 56 }} />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1
                  className="text-3xl md:text-4xl tracking-wide"
                  style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", lineHeight: 1 }}
                >
                  {r.name}
                </h1>
                {r.isVerified ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                    <FiCheckCircle size={10} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>
                    <FiAlertCircle size={10} /> Pending Verification
                  </span>
                )}
                <span
                  className="flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: canAcceptOrders ? "#16a34a" : isPaused ? "#eab308" : "#aaa" }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      background: canAcceptOrders ? "#22c55e" : isPaused ? "#facc15" : "#ddd",
                      boxShadow: canAcceptOrders ? "0 0 0 3px rgba(34,197,94,0.2)" : isPaused ? "0 0 0 3px rgba(250,204,21,0.25)" : "none",
                    }}
                  />
                  {canAcceptOrders ? "Accepting Orders" : isPaused ? "Restaurant Paused" : "Not Accepting Orders"}
                </span>
              </div>

              {r.description && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: "#888", maxWidth: 560 }}>
                  {r.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <FiMail size={11} />,  val: r.email },
                  { icon: <FiPhone size={11} />, val: r.phone },
                  {
                    icon: <FiMapPin size={11} />,
                    val: r.autoLocation?.formatedAddress
                      ? r.autoLocation.formatedAddress.slice(0, 55) + (r.autoLocation.formatedAddress.length > 55 ? "…" : "")
                      : null,
                  },
                ].map(({ icon, val }) =>
                  val ? (
                    <span
                      key={val}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
                      style={{ background: "#FFF8F0", color: "#777", border: "1px solid rgba(226,55,116,0.08)" }}
                    >
                      <span style={{ color: "#E23774" }}>{icon}</span>
                      {val}
                    </span>
                  ) : null
                )}
                {r.cusiene && (
                  <span
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold"
                    style={{ background: "rgba(226,55,116,0.07)", color: "#E23774", border: "1px solid rgba(226,55,116,0.13)" }}
                  >
                    🍴 {r.cusiene}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: "white",
                border: "1.5px solid rgba(226,55,116,0.08)",
                boxShadow: "0 4px 24px rgba(226,55,116,0.05)",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
                  {stat.icon}
                </span>
                <FiTrendingUp size={13} style={{ color: "#e2e8f0" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{stat.label}</p>
              </div>
              <p className="text-[11px]" style={{ color: "#ccc" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── 2-col main ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* orders panel */}
          <div
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 24px rgba(226,55,116,0.05)" }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
              <div className="flex items-center gap-2">
                <FiPackage size={16} style={{ color: "#E23774" }} />
                <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
                  Recent Orders
                </h2>
              </div>
              <button
                onClick={() => navigate("/restaurant/orders")}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#E23774", background: "none", border: "none", cursor: "pointer" }}
              >
                View all <FiArrowRight size={12} />
              </button>
            </div>

            {RECENT_ORDERS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: "rgba(226,55,116,0.06)" }}>
                  🛍️
                </div>
                <p className="text-lg tracking-wide mb-1" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
                  No Orders Yet
                </p>
                <p className="text-sm text-center" style={{ color: "#bbb", maxWidth: 280 }}>
                  Orders will appear here once customers start placing them. Make sure your restaurant is set to Open!
                </p>
                <button
                  onClick={() => setOpenClose.mutate(!isOpen)}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(226,55,116,0.3)" }}
                >
                  <FiToggleRight size={14} /> Set to Open
                </button>
              </div>
            ) : (
              <div>
                {RECENT_ORDERS.map((order: any) => (
                  <div key={order._id} className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.05)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "rgba(226,55,116,0.08)", color: "#E23774" }}>
                      #{order.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1A0A00" }}>{order.customer}</p>
                      <p className="text-xs truncate" style={{ color: "#aaa" }}>{order.items}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: "#1A0A00" }}>₹{order.total}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* right column */}
          <div className="flex flex-col gap-6">

            {/* quick actions */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 24px rgba(226,55,116,0.05)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
                <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.to)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-200"
                    style={{ background: "#FFF8F0", border: "1.5px solid rgba(226,55,116,0.08)", cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(226,55,116,0.06)";
                      e.currentTarget.style.borderColor = "rgba(226,55,116,0.2)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#FFF8F0";
                      e.currentTarget.style.borderColor = "rgba(226,55,116,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: "#555" }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── location card ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 24px rgba(226,55,116,0.05)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
                <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
                  Location
                </h2>
                <button
                  onClick={() => navigate("/restaurant/settings")}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ color: "#E23774", background: "rgba(226,55,116,0.07)", border: "1.5px solid rgba(226,55,116,0.15)", cursor: "pointer" }}
                >
                  <FiEdit2 size={11} /> Edit
                </button>
              </div>

              <div className="p-5">
                {/* Leaflet map — only when we have real coordinates */}
                {hasLocation ? (
                  <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{
                      height: 160,
                      border: "1.5px solid rgba(226,55,116,0.12)",
                      boxShadow: "0 2px 12px rgba(226,55,116,0.08)",
                    }}
                  >
                    <RestaurantMiniMap lat={lat!} lng={lng!} />
                  </div>
                ) : (
                  /* Placeholder when no location is saved yet */
                  <div
                    className="rounded-xl w-full mb-4 flex flex-col items-center justify-center gap-2"
                    style={{
                      height: 160,
                      background: "linear-gradient(135deg,rgba(226,55,116,0.04),rgba(255,107,53,0.04))",
                      border: "1.5px dashed rgba(226,55,116,0.18)",
                    }}
                  >
                    <FiMapPin size={28} style={{ color: "rgba(226,55,116,0.3)" }} />
                    <p className="text-xs font-semibold" style={{ color: "#bbb" }}>No location set</p>
                    <button
                      onClick={() => navigate("/restaurant/settings")}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(226,55,116,0.08)", color: "#E23774", border: "1.5px solid rgba(226,55,116,0.15)", cursor: "pointer" }}
                    >
                      Set Location in Settings
                    </button>
                  </div>
                )}

                {/* address text */}
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "#888" }}>
                  {r.autoLocation?.formatedAddress ?? "No address saved yet."}
                </p>

                {/* lat / lng pills — only when coords exist */}
                {hasLocation && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Latitude",  value: lat!.toFixed(6) },
                      { label: "Longitude", value: lng!.toFixed(6) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl px-3 py-2" style={{ background: "#FFF8F0" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#E23774" }}>
                          {label}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "#444" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* pending verification notice */}
            {!r.isVerified && (
              <div className="rounded-2xl p-5 flex gap-3" style={{ background: "rgba(245,158,11,0.06)", border: "1.5px solid rgba(245,158,11,0.2)" }}>
                <FiAlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#d97706" }}>Verification Pending</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#a16207" }}>
                    Your restaurant is under review. You can set up your menu while you wait. Verification usually takes 24–48 hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RestaurantDashboard;