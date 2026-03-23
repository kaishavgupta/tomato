import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiPackage, FiClock, FiCheck,
  FiTruck, FiAlertCircle, FiChevronDown, FiShoppingCart,
} from "react-icons/fi";
import { OrderProgress } from "./order/OrderProgress";

// ── Types ─────────────────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderItem {
  item_id: { _id: string; item_name: string; image?: { url: string }; isVeg: boolean };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  paymentMethod: "cod" | "online";
  createdAt: string;
  restaurantName?: string;
}

// ── Status metadata ────────────────────────────────────────────────────────
const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: JSX.Element; step: number }> = {
  pending:           { label: "Pending",           color: "#d97706", bg: "rgba(245,158,11,0.1)",  icon: <FiClock size={13} />,     step: 0 },
  confirmed:         { label: "Confirmed",         color: "#2563eb", bg: "rgba(37,99,235,0.1)",   icon: <FiCheck size={13} />,     step: 1 },
  preparing:         { label: "Preparing",         color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  icon: <FiPackage size={13} />,   step: 2 },
  out_for_delivery:  { label: "Out for Delivery",  color: "#E23774", bg: "rgba(226,55,116,0.1)",  icon: <FiTruck size={13} />,     step: 3 },
  delivered:         { label: "Delivered",         color: "#16a34a", bg: "rgba(34,197,94,0.1)",   icon: <FiCheck size={13} />,     step: 4 },
  cancelled:         { label: "Cancelled",         color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: <FiAlertCircle size={13} />, step: -1 },
};
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  `}</style>
);


// ── Progress Tracker ───────────────────────────────────────────────────────
<OrderProgress status={status}/>

// ── Order Card ─────────────────────────────────────────────────────────────
const OrderCard = ({ order, delay }: { order: Order; delay: number }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.status];
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: "white",
        border: "1.5px solid rgba(226,55,116,0.08)",
        boxShadow: "0 4px 20px rgba(226,55,116,0.05)",
        animation: `fadeUp 0.4s ease ${delay}s both`,
      }}>
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#aaa" }}>
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
            <p className="font-bold text-base leading-tight" style={{ color: "#1A0A00" }}>
              {order.restaurantName ?? "Restaurant"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#ccc" }}>{dateStr} · {timeStr}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-base font-black" style={{ color: "#1A0A00" }}>
              ₹{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Item thumbnails */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((oi, i) => (
              <div key={i} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white flex-shrink-0"
                style={{ background: "rgba(226,55,116,0.06)", zIndex: 3 - i }}>
                {oi.item_id?.image?.url
                  ? <img src={oi.item_id.image.url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm">🍽️</div>}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: "rgba(226,55,116,0.08)", color: "#E23774", border: "2px solid white" }}>
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs" style={{ color: "#aaa" }}>
            {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setExpanded((e) => !e)}
            className="ml-auto flex items-center gap-1 text-xs font-semibold"
            style={{ background: "none", border: "none", color: "#E23774", cursor: "pointer" }}>
            {expanded ? "Less" : "Details"}
            <FiChevronDown size={12} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>
      </div>

      {/* Progress tracker */}
      {(order.status !== "delivered" && order.status !== "cancelled") && (
        <div className="px-5 pb-1">
          <OrderProgress status={order.status} />
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(226,55,116,0.07)" }}>
          <div className="pt-4 flex flex-col gap-2">
            {order.items.map((oi, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "#888" }}>×{oi.quantity}</span>
                  <span className="text-sm font-medium" style={{ color: "#1A0A00" }}>{oi.item_id?.item_name ?? "Item"}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#1A0A00" }}>₹{(oi.price * oi.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="h-px my-1" style={{ background: "rgba(226,55,116,0.07)" }} />
            <div className="flex justify-between text-xs" style={{ color: "#aaa" }}>
              <span>Payment</span>
              <span className="font-semibold" style={{ color: "#555" }}>
                {order.paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Online"}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between text-xs" style={{ color: "#aaa" }}>
                <span>Address</span>
                <span className="font-semibold text-right" style={{ color: "#555", maxWidth: "60%" }}>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="rounded-3xl p-5" style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.07)" }}>
    {[80, 50, 100].map((w, i) => (
      <div key={i} className="mb-3 rounded-xl"
        style={{ height: 16, width: `${w}%`, background: "linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    ))}
  </div>
);

// ── Filter Tabs ────────────────────────────────────────────────────────────
type FilterTab = "all" | "active" | "delivered" | "cancelled";
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

// ── Page ───────────────────────────────────────────────────────────────────
const Order = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/orders/my-orders", { credentials: "include" });
        const json = await res.json();
        setOrders(json.data ?? json.orders ?? json.msg ?? []);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (activeTab === "active") return !["delivered", "cancelled"].includes(o.status);
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3"
        style={{ background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226,55,116,0.08)" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(226,55,116,0.07)", border: "none", cursor: "pointer", color: "#E23774" }}>
              <FiArrowLeft size={16} />
            </button>
            <div className="flex-1">
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#1A0A00", letterSpacing: 0.5, lineHeight: 1 }}>
                My Orders
              </h1>
              <p className="text-xs" style={{ color: "#aaa" }}>{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: activeTab === tab.key ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.06)",
                  color: activeTab === tab.key ? "white" : "#888",
                  border: "none", cursor: "pointer",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20" style={{ animation: "popIn 0.3s ease" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: "rgba(226,55,116,0.06)" }}>
              <FiShoppingCart size={32} style={{ color: "rgba(226,55,116,0.3)" }} />
            </div>
            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#1A0A00" }}>No Orders Yet</p>
            <p className="text-sm mb-5" style={{ color: "#bbb" }}>
              {activeTab === "all" ? "Place your first order!" : `No ${activeTab} orders`}
            </p>
            <button onClick={() => navigate("/")}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "none", cursor: "pointer" }}>
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col gap-4">
            {filtered.map((order, i) => (
              <OrderCard key={order._id} order={order} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;