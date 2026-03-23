// src/pages/home/homeComponents/HomeHero.tsx
// Used by: Home only
// ─────────────────────────────────────────────────────────────────────────────
import { FiSearch, FiZap, FiTrendingUp } from "react-icons/fi";
import { DarkHero } from "../../../components/User/DarkHero";
import { GradText } from "../../../components/User/Ui";

interface HomeHeroProps {
  greeting: string;
  userName?: string;
  restaurantCount: number;
  dishCount: number;
  isInitialLoad: boolean;
  search: string;
  setSearch: (v: string) => void;
}

export const HomeHero = ({
  greeting, userName, restaurantCount, dishCount, isInitialLoad, search, setSearch,
}: HomeHeroProps) => (
  <DarkHero>
    <div style={{ padding: "52px 20px 60px", maxWidth: 640, margin: "0 auto" }}>
      {/* eyebrow */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(226,55,116,0.12)", border: "1px solid rgba(226,55,116,0.25)", marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E23774", animation: "s-pulse 2s infinite", display: "block" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#E23774", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Good {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}
        </span>
      </div>

      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(38px,8vw,60px)", fontWeight: 900, color: "#FEF3C7", lineHeight: 1.07, marginBottom: 16 }}>
        Hunger is a<br /><GradText>conversation.</GradText>
      </h1>

      <p style={{ fontSize: 15, color: "rgba(254,243,199,0.48)", lineHeight: 1.75, marginBottom: 30, maxWidth: 420 }}>
        Explore restaurants, discover dishes, and get the finest food delivered to your door.
      </p>

      {/* search */}
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,248,240,0.06)", border: "1.5px solid rgba(226,55,116,0.25)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 28px rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
        <span style={{ padding: "0 14px", color: "rgba(226,55,116,0.5)", flexShrink: 0, display: "flex" }}><FiSearch size={16} /></span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search restaurants or dishes…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "14px 0", fontSize: 14, color: "#FEF3C7", fontFamily: "'DM Sans',sans-serif" }} />
        {search && (
          <button onClick={() => setSearch("")}
            style={{ margin: 5, padding: "9px 14px", background: "rgba(226,55,116,0.15)", border: "1px solid rgba(226,55,116,0.3)", borderRadius: 12, color: "#E23774", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* stats */}
      <div style={{ display: "flex", gap: 28, marginTop: 26 }}>
        {[
          { icon: <FiZap size={12} />, val: isInitialLoad ? "—" : String(restaurantCount), label: "Restaurants" },
          { icon: <FiTrendingUp size={12} />, val: isInitialLoad ? "—" : `${dishCount}+`, label: "Dishes" },
          { icon: "⚡", val: "15 min", label: "Avg. delivery" },
        ].map(({ val, label }) => (
          <div key={label}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "#E23774" }}>{val}</p>
            <p style={{ fontSize: 11, color: "rgba(254,243,199,0.42)", marginTop: 1 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  </DarkHero>
);