import { useState } from "react";
import { useRestaurant } from "../../Hooks/useRestaurant";
import {
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiStar,
  FiUsers, FiClock, FiCalendar, FiArrowUp, FiArrowDown,
} from "react-icons/fi";

// ── shared shell + header (same as orders page) ───────────────────────────
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
      @keyframes barGrow { from{height:0} to{height:var(--h)} }
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

// ── placeholder data ──────────────────────────────────────────────────────
const WEEKLY_REVENUE   = [0, 0, 0, 0, 0, 0, 0];
const WEEKLY_ORDERS    = [0, 0, 0, 0, 0, 0, 0];
const DAY_LABELS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TOP_ITEMS: { name: string; orders: number; revenue: number }[] = [];

const PERIODS = ["7 Days", "30 Days", "3 Months", "All Time"] as const;
type Period = typeof PERIODS[number];

// ── bar chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, color, label }: { data: number[]; color: string; label: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {data.map((v, i) => {
          const pct = Math.round((v / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold" style={{ color: v > 0 ? color : "#ddd" }}>
                {v > 0 ? v : ""}
              </span>
              <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: 88, background: "rgba(226,55,116,0.05)" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700"
                  style={{ height: `${pct}%`, background: v > 0 ? `linear-gradient(to top,${color},${color}99)` : "transparent" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="flex-1 text-center text-[10px]" style={{ color: "#ccc" }}>{d}</div>
        ))}
      </div>
    </div>
  );
};

// ── donut chart placeholder ───────────────────────────────────────────────
const DonutPlaceholder = () => (
  <div className="flex flex-col items-center justify-center py-6">
    <div className="relative w-28 h-28 mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(226,55,116,0.08)" strokeWidth="16" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(226,55,116,0.15)" strokeWidth="16"
          strokeDasharray="40 239" strokeLinecap="round" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#E23774" strokeWidth="16"
          strokeDasharray="0 239" strokeLinecap="round" strokeDashoffset="-40" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color: "#ccc" }}>No data</span>
      </div>
    </div>
    <p className="text-xs" style={{ color: "#ccc" }}>Order breakdown will appear here</p>
  </div>
);

// ── main component ─────────────────────────────────────────────────────────
const RestaurantAnalytics = () => {
  const { restaurantData } = useRestaurant();
  const [period, setPeriod] = useState<Period>("7 Days");

  const KPI = [
    { label: "Total Revenue",   value: "₹0",  sub: "vs last period",  delta: null, icon: <FiDollarSign size={16} />,  color: "#E23774", bg: "rgba(226,55,116,0.08)" },
    { label: "Total Orders",    value: "0",   sub: "vs last period",  delta: null, icon: <FiShoppingBag size={16} />, color: "#FF6B35", bg: "rgba(255,107,53,0.08)" },
    { label: "Avg. Order Value",value: "₹0",  sub: "per order",       delta: null, icon: <FiTrendingUp size={16} />,  color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
    { label: "Avg. Rating",     value: "—",   sub: "customer rating", delta: null, icon: <FiStar size={16} />,        color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { label: "New Customers",   value: "0",   sub: "first-time orders",delta: null, icon: <FiUsers size={16} />,      color: "#16a34a", bg: "rgba(34,197,94,0.08)" },
    { label: "Avg. Prep Time",  value: "—",   sub: "minutes",         delta: null, icon: <FiClock size={16} />,      color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  ];

  return (
    <PageShell>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <PageHeader title="Analytics" sub="Track your restaurant's performance over time" />

        {/* period selector */}
        <div className="flex gap-1 mb-8 md:mb-0 flex-wrap">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-200"
              style={{
                background: period === p ? "linear-gradient(135deg,#E23774,#FF6B35)" : "white",
                color: period === p ? "white" : "#888",
                border: `1.5px solid ${period === p ? "transparent" : "rgba(226,55,116,0.12)"}`,
                cursor: "pointer",
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {KPI.map((k, i) => (
          <div key={k.label} className="rounded-2xl p-5"
            style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)", animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.bg, color: k.color }}>{k.icon}</span>
              {k.delta !== null && (
                <span className="flex items-center gap-0.5 text-xs font-semibold"
                  style={{ color: (k.delta as number) >= 0 ? "#16a34a" : "#ef4444" }}>
                  {(k.delta as number) >= 0 ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
                  {Math.abs(k.delta as number)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>{k.value}</p>
            <p className="text-xs" style={{ color: "#aaa" }}>{k.label}</p>
            <p className="text-[11px] mt-1" style={{ color: "#ddd" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* revenue bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Revenue Trend</h2>
              <p className="text-xs" style={{ color: "#aaa" }}>Daily revenue for the past 7 days</p>
            </div>
            <FiCalendar size={14} style={{ color: "#E23774" }} />
          </div>
          {WEEKLY_REVENUE.every(v => v === 0) ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <FiTrendingUp size={28} style={{ color: "rgba(226,55,116,0.15)" }} />
              <p className="text-sm" style={{ color: "#ccc" }}>No revenue data yet for this period</p>
            </div>
          ) : (
            <BarChart data={WEEKLY_REVENUE} color="#E23774" label="Revenue (₹)" />
          )}
        </div>

        {/* order breakdown donut */}
        <div className="rounded-2xl p-6"
          style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)" }}>
          <h2 className="text-xl tracking-wide mb-1" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Order Status</h2>
          <p className="text-xs mb-4" style={{ color: "#aaa" }}>Breakdown by status</p>
          <DonutPlaceholder />

          {/* legend */}
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: "Delivered",    color: "#16a34a" },
              { label: "Cancelled",    color: "#E23774" },
              { label: "In Progress",  color: "#6366f1" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: "#888" }}>{l.label}</span>
                <span className="ml-auto text-xs font-semibold" style={{ color: "#ccc" }}>—</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* orders bar chart */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Orders Volume</h2>
            <p className="text-xs" style={{ color: "#aaa" }}>Number of orders per day</p>
          </div>
        </div>
        {WEEKLY_ORDERS.every(v => v === 0) ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <FiShoppingBag size={28} style={{ color: "rgba(255,107,53,0.15)" }} />
            <p className="text-sm" style={{ color: "#ccc" }}>No order data yet for this period</p>
          </div>
        ) : (
          <BarChart data={WEEKLY_ORDERS} color="#FF6B35" label="Orders" />
        )}
      </div>

      {/* top items table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 20px rgba(226,55,116,0.05)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
          <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Top Menu Items</h2>
          <p className="text-xs" style={{ color: "#aaa" }}>Best sellers ranked by orders</p>
        </div>

        {TOP_ITEMS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm font-semibold" style={{ color: "#bbb" }}>No menu data yet</p>
            <p className="text-xs" style={{ color: "#ccc" }}>Your best-selling items will appear here once orders come in</p>
          </div>
        ) : (
          <div>
            {/* header */}
            <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ccc", borderBottom: "1px solid rgba(226,55,116,0.05)" }}>
              <span className="col-span-1">#</span>
              <span className="col-span-5">Item</span>
              <span className="col-span-3 text-right">Orders</span>
              <span className="col-span-3 text-right">Revenue</span>
            </div>
            {TOP_ITEMS.map((item, i) => (
              <div key={item.name} className="grid grid-cols-12 px-6 py-3 items-center text-sm"
                style={{ borderBottom: "1px solid rgba(226,55,116,0.04)" }}>
                <span className="col-span-1 font-bold" style={{ color: i < 3 ? "#E23774" : "#ccc" }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                </span>
                <span className="col-span-5 font-medium" style={{ color: "#1A0A00" }}>{item.name}</span>
                <span className="col-span-3 text-right font-semibold" style={{ color: "#444" }}>{item.orders}</span>
                <span className="col-span-3 text-right font-bold" style={{ color: "#E23774" }}>₹{item.revenue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default RestaurantAnalytics;