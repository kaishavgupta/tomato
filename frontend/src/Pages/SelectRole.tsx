import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../types/user.type";
import { roleHome } from "../components/ProtectedRoute";

// Add these to your index.css or global CSS:
// @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');


type Role = "user" | "restaurant" | "rider";

interface RoleOption {
  role: Role;
  emoji: string;
  tag: string;
  headline: string;
  description: string;
  perks: string[];
  label: string;
}

const roles: RoleOption[] = [
  {
    role: "user",
    emoji: "🍕",
    tag: "Customer",
    headline: "Hungry?",
    description: "Browse menus, place orders, and track your food in real time.",
    perks: ["Browse restaurants", "Live order tracking", "Reorder favorites"],
    label: "You're joining as a Customer 🍕",
  },
  {
    role: "restaurant",
    emoji: "🍳",
    tag: "Restaurant",
    headline: "Cook it.",
    description: "List your menu, manage orders, and grow your business online.",
    perks: ["Menu management", "Order dashboard", "Revenue analytics"],
    label: "You're joining as a Restaurant owner 🍳",
  },
  {
    role: "rider",
    emoji: "🛵",
    tag: "Rider",
    headline: "Deliver.",
    description: "Pick up orders and earn money on your own schedule, your way.",
    perks: ["Flexible hours", "Route navigation", "Instant payouts"],
    label: "You're joining as a Rider 🛵",
  },
];

const SelectRole = () => {
 const context = use(AppContext);
  const roleMutation = context?.roleMutation;
  const isLoading=context?.isLoading;
  const [selected, setSelected] = useState<Role | null>(null);
const navigate =useNavigate();
  const handleSubmit = async () => {
    if (!selected || !roleMutation) return;
     roleMutation.mutate(selected, {
    onSuccess: () => navigate(roleHome(selected)), // ✅ role-aware redirect
  });
  };

  const selectedLabel = roles.find((r) => r.role === selected)?.label;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
      style={{ backgroundColor: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background blobs */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        {/* Large diagonal stripe */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full opacity-[0.07]"
          style={{
            background: "linear-gradient(135deg, #E23774 0%, #FF6B35 100%)",
            clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Top-left dot */}
        <div
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: 320,
            height: 320,
            top: -100,
            left: -80,
            background: "#E23774",
          }}
        />
        {/* Bottom-right dot */}
        <div
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: 180,
            height: 180,
            bottom: 40,
            right: 60,
            background: "#FF6B35",
          }}
        />
        {/* Mid-left dot */}
        <div
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: 60,
            height: 60,
            top: "40%",
            left: "10%",
            background: "#E23774",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">

        {/* Logo */}
        <p
          className="mb-2 text-5xl tracking-wider"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#E23774" }}
        >
          Tomato
        </p>

        {/* Headline */}
        <h1
          className="text-6xl md:text-7xl text-center leading-none mb-3"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#1A0A00" }}
        >
          Who are<br />you today?
        </h1>

        <p className="text-center text-sm mb-12 max-w-xs" style={{ color: "#888" }}>
          Pick your role to get started. You can always change this later.
        </p>

        {/* Role Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {roles.map((r) => {
            const isSelected = selected === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setSelected(r.role)}
                className="relative text-left rounded-[20px] p-7 border-2 transition-all duration-300 overflow-hidden"
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, #E23774, #FF6B35)"
                    : "white",
                  borderColor: isSelected ? "#E23774" : "transparent",
                  boxShadow: isSelected
                    ? "0 24px 56px rgba(226,55,116,0.25)"
                    : "0 4px 24px rgba(226,55,116,0.06)",
                  transform: isSelected
                    ? "translateY(-8px) scale(1.03)"
                    : "translateY(0) scale(1)",
                }}
              >
                {/* Checkmark */}
                <span
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300"
                  style={{
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? "scale(1)" : "scale(0)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="#E23774"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "#FFF0F5",
                  }}
                >
                  {r.emoji}
                </div>

                {/* Tag */}
                <span
                  className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "#FFF0F5",
                    color: isSelected ? "white" : "#E23774",
                  }}
                >
                  {r.tag}
                </span>

                {/* Headline */}
                <h2
                  className="mt-3 mb-2 text-3xl"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: isSelected ? "white" : "#1A0A00",
                    letterSpacing: "0.04em",
                  }}
                >
                  {r.headline}
                </h2>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: isSelected ? "rgba(255,255,255,0.85)" : "#888" }}
                >
                  {r.description}
                </p>

                {/* Perks */}
                <ul className="mt-4 space-y-1">
                  {r.perks.map((perk) => (
                    <li
                      key={perk}
                      className="text-[12px]"
                      style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "#aaa" }}
                    >
                      ✓ &nbsp;{perk}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSubmit}
          disabled={!selected || isLoading}
          className="px-12 py-[18px] rounded-2xl text-white text-[22px] tracking-widest transition-all duration-300"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            background: "linear-gradient(135deg, #E23774, #FF6B35)",
            boxShadow: selected ? "0 8px 32px rgba(226,55,116,0.3)" : "none",
            opacity: !selected ? 0.4 : 1,
            transform: selected ? "translateY(0)" : "none",
            cursor: !selected ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Saving..." : "Continue →"}
        </button>

        {/* Selected label */}
        <p className="mt-5 text-sm min-h-5" style={{ color: "#bbb" }}>
          {selectedLabel ?? ""}
        </p>
      </div>
    </div>
  );
};

export default SelectRole;