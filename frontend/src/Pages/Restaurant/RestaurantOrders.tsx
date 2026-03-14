import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../../Hooks/useRestaurant";
import {
  FiShoppingBag, FiClock, FiCheckCircle, FiXCircle,
  FiSearch, FiFilter, FiChevronDown, FiChevronRight,
  FiRefreshCw, FiTruck, FiPackage, FiAlertCircle,
} from "react-icons/fi";

// ── types ─────────────────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderItem { name: string; qty: number; price: number; }
interface Order {
  _id: string; number: number; customer: string; phone: string;
  items: OrderItem[]; total: number; status: OrderStatus;
  placedAt: string; address: string; paymentMethod: string;
}

// ── placeholder data ──────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = []; // replace with real API data

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:           { label: "Pending",           color: "#d97706", bg: "rgba(245,158,11,0.10)",  icon: <FiClock size={12} /> },
  confirmed:         { label: "Confirmed",         color: "#6366f1", bg: "rgba(99,102,241,0.10)",  icon: <FiCheckCircle size={12} /> },
  preparing:         { label: "Preparing",         color: "#E23774", bg: "rgba(226,55,116,0.10)",  icon: <FiPackage size={12} /> },
  out_for_delivery:  { label: "Out for Delivery",  color: "#FF6B35", bg: "rgba(255,107,53,0.10)",  icon: <FiTruck size={12} /> },
  delivered:         { label: "Delivered",         color: "#16a34a", bg: "rgba(34,197,94,0.10)",   icon: <FiCheckCircle size={12} /> },
  cancelled:         { label: "Cancelled",         color: "#aaa",    bg: "rgba(0,0,0,0.06)",       icon: <FiXCircle size={12} /> },
};

const TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All",           value: "all" },
  { label: "Pending",       value: "pending" },
  { label: "Preparing",     value: "preparing" },
  { label: "On the Way",    value: "out_for_delivery" },
  { label: "Delivered",     value: "delivered" },
  { label: "Cancelled",     value: "cancelled" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          "confirmed",
  confirmed:        "preparing",
  preparing:        "out_for_delivery",
  out_for_delivery: "delivered",
};

// ── sub-components ────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const m = STATUS_META[status];
  return (
    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.color }}>
      {m.icon} {m.label}
    </span>
  );
};

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}>
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", opacity: 0.04, background: "linear-gradient(135deg,#E23774,#FF6B35)", clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)" }} />
    </div>
    <div className="relative px-4 md:px-10 py-8 max-w-7xl mx-auto" style={{ zIndex: 1 }}>
      {children}
    </div>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  </div>
);

const PageHeader = ({ title, sub }: { title: string; sub: string }) => (
  <div className="mb-8">
    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E23774" }}>Restaurant</p>
    <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>{title}</h1>
    <p className="text-sm mt-1" style={{ color: "#aaa" }}>{sub}</p>
  </div>
);

// ── main component ─────────────────────────────────────────────────────────
const RestaurantOrders = () => {
  const { restaurantData } = useRestaurant();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) ||
      String(o.number).includes(search);
    return matchTab && matchSearch;
  });

  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o._id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "cancelled" } : o));
  };

  // stat counts
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const SUMMARY = [
    { label: "Total Today",   value: orders.length,               icon: <FiShoppingBag size={16} />, color: "#E23774", bg: "rgba(226,55,116,0.08)" },
    { label: "Pending",       value: counts["pending"] ?? 0,      icon: <FiClock size={16} />,       color: "#d97706", bg: "rgba(245,158,11,0.08)" },
    { label: "Preparing",     value: counts["preparing"] ?? 0,    icon: <FiPackage size={16} />,     color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
    { label: "Delivered",     value: counts["delivered"] ?? 0,    icon: <FiCheckCircle size={16} />, color: "#16a34a", bg: "rgba(34,197,94,0.08)" },
  ];

  return (
    <PageShell>
      <PageHeader title="Orders" sub="Manage and track all incoming orders in real time" />

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY.map((s, i) => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)", animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>{s.value}</p>
              <p className="text-xs" style={{ color: "#aaa" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* orders panel */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 8px 40px rgba(226,55,116,0.07)" }}>

        {/* toolbar */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* search */}
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#ccc" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer name or order #..."
                className="w-full rounded-2xl text-sm outline-none"
                style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: "1.5px solid rgba(226,55,116,0.12)", background: "#FFF8F0", color: "#1A0A00", fontFamily: "'DM Sans',sans-serif" }}
                onFocus={e => e.currentTarget.style.borderColor = "#E23774"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(226,55,116,0.12)"}
              />
            </div>
            {/* refresh */}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: "rgba(226,55,116,0.07)", color: "#E23774", border: "1.5px solid rgba(226,55,116,0.13)", cursor: "pointer" }}>
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{
                  background: activeTab === tab.value ? "linear-gradient(135deg,#E23774,#FF6B35)" : "transparent",
                  color: activeTab === tab.value ? "white" : "#888",
                  border: "none", cursor: "pointer",
                }}>
                {tab.label}
                {tab.value !== "all" && counts[tab.value] ? (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{ background: activeTab === tab.value ? "rgba(255,255,255,0.25)" : "rgba(226,55,116,0.1)", color: activeTab === tab.value ? "white" : "#E23774" }}>
                    {counts[tab.value]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* order list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: "rgba(226,55,116,0.06)" }}>🛍️</div>
            <p className="text-lg tracking-wide mb-1" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>
              {search ? "No Orders Found" : "No Orders Yet"}
            </p>
            <p className="text-sm" style={{ color: "#bbb" }}>
              {search ? "Try a different search term" : "Orders will appear here once customers start placing them"}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((order, i) => {
              const isExpanded = expanded === order._id;
              const meta = STATUS_META[order.status];
              const nextStatus = NEXT_STATUS[order.status];

              return (
                <div key={order._id}
                  style={{ borderBottom: "1px solid rgba(226,55,116,0.06)", animation: `fadeUp 0.35s ease ${i * 0.05}s both` }}>

                  {/* row */}
                  <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[rgba(226,55,116,0.02)] transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}>

                    {/* order number */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color }}>
                      #{order.number}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: "#1A0A00" }}>{order.customer}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#aaa" }}>
                        {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                      </p>
                    </div>

                    {/* total + time */}
                    <div className="text-right flex-shrink-0 hidden md:block">
                      <p className="text-sm font-bold" style={{ color: "#1A0A00" }}>₹{order.total}</p>
                      <p className="text-xs" style={{ color: "#bbb" }}>{order.placedAt}</p>
                    </div>

                    <FiChevronDown size={14} style={{ color: "#ccc", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }} />
                  </div>

                  {/* expanded detail */}
                  {isExpanded && (
                    <div className="px-6 pb-5" style={{ borderTop: "1px solid rgba(226,55,116,0.06)", background: "#FFFBF8" }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

                        {/* items */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#E23774" }}>Items Ordered</p>
                          <div className="flex flex-col gap-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span style={{ color: "#444" }}>{item.name} <span style={{ color: "#ccc" }}>×{item.qty}</span></span>
                                <span className="font-semibold" style={{ color: "#1A0A00" }}>₹{item.price * item.qty}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid rgba(226,55,116,0.08)" }}>
                              <span style={{ color: "#1A0A00" }}>Total</span>
                              <span style={{ color: "#E23774" }}>₹{order.total}</span>
                            </div>
                          </div>
                        </div>

                        {/* customer info */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#E23774" }}>Customer Info</p>
                          <div className="flex flex-col gap-2 text-sm" style={{ color: "#666" }}>
                            <p>📞 {order.phone}</p>
                            <p>📍 {order.address}</p>
                            <p>💳 {order.paymentMethod}</p>
                            <p>🕐 Placed at {order.placedAt}</p>
                          </div>
                        </div>
                      </div>

                      {/* action buttons */}
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <div className="flex gap-3 mt-5">
                          {nextStatus && (
                            <button onClick={() => advanceStatus(order._id)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white"
                              style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(226,55,116,0.3)" }}>
                              <FiChevronRight size={14} />
                              Mark as {STATUS_META[nextStatus].label}
                            </button>
                          )}
                          <button onClick={() => cancelOrder(order._id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold"
                            style={{ background: "rgba(0,0,0,0.04)", color: "#888", border: "1.5px solid rgba(0,0,0,0.08)", cursor: "pointer" }}>
                            <FiXCircle size={14} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default RestaurantOrders;