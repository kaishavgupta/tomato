import { FiPackage, FiToggleLeft, FiToggleRight, FiAlertCircle } from "react-icons/fi";

interface MenuStatsBarProps {
  total: number;
  available: number;
  paused: number;
  outStock: number;
}

export const MenuStatsBar = ({ total, available, paused, outStock }: MenuStatsBarProps) => {
  const stats = [
    { label: "Total Items",  value: total,     color: "#E23774", bg: "rgba(226,55,116,0.08)", icon: <FiPackage size={16} /> },
    { label: "Available",    value: available, color: "#16a34a", bg: "rgba(34,197,94,0.08)",  icon: <FiToggleRight size={16} /> },
    { label: "Paused",       value: paused,    color: "#d97706", bg: "rgba(245,158,11,0.08)", icon: <FiToggleLeft size={16} /> },
    { label: "Out of Stock", value: outStock,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",  icon: <FiAlertCircle size={16} /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: "white",
            border: "1.5px solid rgba(226,55,116,0.08)",
            boxShadow: "0 4px 20px rgba(226,55,116,0.05)",
            animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
          }}
        >
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg, color: s.color }}
          >
            {s.icon}
          </span>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}
            >
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "#aaa" }}>{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};