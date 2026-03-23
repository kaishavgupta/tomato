// src/pages/user/UserProfile.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Design direction: "Personal Food Journal" — editorial warmth meets loyalty
// card. Big expressive typography, hand-crafted feel, data told as stories
// not dashboards. Dark hero bleeding into warm cream canvas.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSettings, FiEdit2, FiAward, FiHeart, FiShoppingBag,
  FiTrendingUp, FiStar, FiMapPin, FiClock, FiZap,
  FiGift, FiChevronRight,
} from "react-icons/fi";
import useUser from "../../Hooks/useUser";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Bebas+Neue&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes slideRight{ from{width:0} to{width:var(--w)} }
    @keyframes popIn     { 0%{opacity:0;transform:scale(0.82)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
    @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes countUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

    .profile-card {
      background: white;
      border: 1.5px solid rgba(226,55,116,0.08);
      border-radius: 24px;
      overflow: hidden;
      transition: box-shadow 0.25s, transform 0.25s;
    }
    .profile-card:hover {
      box-shadow: 0 12px 40px rgba(226,55,116,0.10);
      transform: translateY(-2px);
    }

    .milestone-chip {
      transition: all 0.2s;
      cursor: default;
    }
    .milestone-chip:hover {
      transform: scale(1.04);
    }

    .rest-card {
      transition: box-shadow 0.22s, transform 0.22s;
    }
    .rest-card:hover {
      box-shadow: 0 10px 32px rgba(226,55,116,0.13);
      transform: translateY(-3px);
    }

    .order-row {
      transition: background 0.15s;
    }
    .order-row:hover {
      background: rgba(226,55,116,0.03) !important;
    }

    .scroll-hide { -ms-overflow-style:none; scrollbar-width:none; }
    .scroll-hide::-webkit-scrollbar { display:none; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — replace with real API calls
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalOrders:    47,
  totalSaved:     1840,      // ₹ saved via discounts
  totalSpent:     12350,     // ₹ lifetime spend
  avgOrderValue:  263,
  memberSince:    "March 2023",
  streak:         5,         // days active this week
  favCuisine:     "North Indian",
  mostOrderedItem:"Butter Chicken",
  lateNightOrders:12,        // orders after 11 PM
};

const MOCK_RESTAURANTS = [
  { id: "1", name: "Spice Garden",   cuisine: "North Indian", orders: 14, img: null, rating: 4.8 },
  { id: "2", name: "Wok & Roll",     cuisine: "Chinese",      orders: 9,  img: null, rating: 4.5 },
  { id: "3", name: "Pizza Factory",  cuisine: "Italian",      orders: 7,  img: null, rating: 4.7 },
];

const MOCK_RECENT_ORDERS = [
  { id: "o1", restaurant: "Spice Garden",   items: "Butter Chicken, Garlic Naan",   amount: 480, date: "Today, 8:30 PM",   status: "Delivered" },
  { id: "o2", restaurant: "Wok & Roll",     items: "Hakka Noodles, Spring Rolls",   amount: 320, date: "Yesterday",        status: "Delivered" },
  { id: "o3", restaurant: "Pizza Factory",  items: "Margherita Pizza",              amount: 350, date: "Mon, 12 Jan",      status: "Delivered" },
  { id: "o4", restaurant: "Spice Garden",   items: "Dal Makhani, 2× Chapati",       amount: 220, date: "Fri, 8 Jan",       status: "Delivered" },
];

const MILESTONES = [
  { icon: "🍽️", label: "First Bite",      desc: "Placed your first order",                unlocked: true  },
  { icon: "🔟",  label: "Ten Timers",      desc: "10 orders placed",                        unlocked: true  },
  { icon: "🌙",  label: "Night Owl",       desc: "12 late-night orders",                    unlocked: true  },
  { icon: "💸",  label: "Big Saver",       desc: "Saved ₹1,000+ on discounts",              unlocked: true  },
  { icon: "❤️",  label: "Regular",         desc: "Ordered from same place 5× in a month",  unlocked: true  },
  { icon: "🏆",  label: "Half Century",    desc: "50 orders",                               unlocked: false },
  { icon: "🎂",  label: "One Year",        desc: "Member for 1 year",                       unlocked: false },
  { icon: "🌶️",  label: "Spice Fanatic",   desc: "Order spicy food 20 times",               unlocked: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const StatPill = ({
  icon, value, label, delay = 0, accent = "#E23774",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
  accent?: string;
}) => (
  <div style={{
    background: "white", borderRadius: 20, padding: "18px 20px",
    border: "1.5px solid rgba(226,55,116,0.08)",
    boxShadow: "0 4px 20px rgba(226,55,116,0.05)",
    animation: `fadeUp 0.4s ease ${delay}s both`,
    display: "flex", flexDirection: "column", gap: 6,
  }}>
    <span style={{
      width: 36, height: 36, borderRadius: 12,
      background: `${accent}14`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: accent, marginBottom: 2,
    }}>
      {icon}
    </span>
    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#1A0A00", lineHeight: 1, animation: `countUp 0.5s ease ${delay + 0.2}s both` }}>
      {value}
    </p>
    <p style={{ fontSize: 11, color: "#aaa", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {label}
    </p>
  </div>
);

const SectionHeading = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div style={{ marginBottom: 18 }}>
    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "#1A0A00", lineHeight: 1.15 }}>
      {children}
    </h2>
    {sub && <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{sub}</p>}
  </div>
);

const ProgressBar = ({ pct, color = "#E23774" }: { pct: number; color?: string }) => (
  <div style={{ height: 6, background: "rgba(226,55,116,0.08)", borderRadius: 99, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 99,
      background: `linear-gradient(90deg,${color},#FF6B35)`,
      width: `${pct}%`,
      transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
    }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FOOD PERSONALITY CARD
// ─────────────────────────────────────────────────────────────────────────────
const FoodPersonality = () => {
  const traits = [
    { label: "Spice Level",    pct: 75, icon: "🌶️" },
    { label: "Variety Seeker", pct: 60, icon: "🌍" },
    { label: "Night Eater",    pct: 88, icon: "🌙" },
    { label: "Health Focus",   pct: 30, icon: "🥗" },
    { label: "Sweet Tooth",    pct: 55, icon: "🍮" },
  ];

  return (
    <div className="profile-card" style={{ padding: "24px 24px 20px", animation: "fadeUp 0.4s ease 0.32s both" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 900, color: "#1A0A00" }}>
            Your Food Personality
          </h3>
          <p style={{ fontSize: 11, color: "#aaa" }}>Based on your order history</p>
        </div>
        <span style={{
          marginLeft: "auto", padding: "3px 10px", borderRadius: 99,
          background: "linear-gradient(135deg,rgba(226,55,116,0.1),rgba(255,107,53,0.1))",
          border: "1px solid rgba(226,55,116,0.15)",
          fontSize: 10, fontWeight: 800, color: "#E23774",
          letterSpacing: "0.07em", textTransform: "uppercase",
        }}>
          Spice Lover
        </span>
      </div>

      {traits.map((t, i) => (
        <div key={t.label} style={{ marginBottom: 14, animation: `fadeUp 0.3s ease ${0.38 + i * 0.06}s both` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1A0A00", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{t.icon}</span>{t.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E23774" }}>{t.pct}%</span>
          </div>
          <ProgressBar pct={t.pct} />
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────────────────────
const MilestonesSection = () => (
  <div style={{ animation: "fadeUp 0.4s ease 0.4s both" }}>
    <SectionHeading sub={`${MILESTONES.filter(m => m.unlocked).length} of ${MILESTONES.length} unlocked`}>
      Achievements 🏅
    </SectionHeading>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      {MILESTONES.map((m, i) => (
        <div
          key={m.label}
          className="milestone-chip"
          style={{
            background: m.unlocked ? "white" : "#faf5f7",
            border: m.unlocked ? "1.5px solid rgba(226,55,116,0.12)" : "1.5px dashed rgba(226,55,116,0.12)",
            borderRadius: 18, padding: "14px 14px 12px",
            opacity: m.unlocked ? 1 : 0.55,
            animation: `popIn 0.4s ease ${0.44 + i * 0.04}s both`,
            position: "relative",
          }}
        >
          {/* Unlocked glow */}
          {m.unlocked && (
            <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "radial-gradient(circle at 50% 0%, rgba(226,55,116,0.05), transparent 70%)", pointerEvents: "none" }} />
          )}
          <div style={{ fontSize: 26, marginBottom: 8, animation: m.unlocked ? `float 3s ease ${i * 0.2}s infinite` : "none", display: "inline-block" }}>
            {m.unlocked ? m.icon : "🔒"}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: m.unlocked ? "#1A0A00" : "#999", lineHeight: 1.2, marginBottom: 3 }}>
            {m.label}
          </p>
          <p style={{ fontSize: 10, color: "#bbb", lineHeight: 1.4 }}>{m.desc}</p>
          {m.unlocked && (
            <div style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg,#E23774,#FF6B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 7, color: "white", fontWeight: 900 }}>✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FAVOURITE RESTAURANTS
// ─────────────────────────────────────────────────────────────────────────────
const FavRestaurants = () => {
  const navigate = useNavigate();
  const EMOJI_BG = ["#FF6B35", "#E23774", "#7C3AED"];

  return (
    <div style={{ animation: "fadeUp 0.4s ease 0.48s both" }}>
      <SectionHeading sub="Ranked by how often you order">
        Most Loved Restaurants ❤️
      </SectionHeading>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_RESTAURANTS.map((r, i) => (
          <div
            key={r.id}
            className="rest-card"
            onClick={() => navigate(`/menu?restaurantId=${r.id}`)}
            style={{
              background: "white", borderRadius: 18, padding: "14px 16px",
              border: "1.5px solid rgba(226,55,116,0.08)",
              boxShadow: "0 2px 12px rgba(226,55,116,0.05)",
              display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
              animation: `fadeUp 0.35s ease ${0.5 + i * 0.06}s both`,
            }}
          >
            {/* Rank */}
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: i === 0 ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 16,
              color: i === 0 ? "white" : "#E23774",
            }}>
              {i + 1}
            </div>

            {/* Logo placeholder */}
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg,${EMOJI_BG[i]}22,${EMOJI_BG[i]}11)`,
              border: `1.5px solid ${EMOJI_BG[i]}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              🍽️
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#1A0A00", marginBottom: 3 }}>
                {r.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>{r.cuisine}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ddd", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 3 }}>
                  <FiStar size={9} style={{ color: "#E23774" }} /> {r.rating}
                </span>
              </div>
            </div>

            {/* Order count */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#E23774", lineHeight: 1 }}>
                {r.orders}
              </p>
              <p style={{ fontSize: 10, color: "#bbb", fontWeight: 500 }}>orders</p>
            </div>

            <FiChevronRight size={14} style={{ color: "#ddd", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RECENT ORDERS
// ─────────────────────────────────────────────────────────────────────────────
const RecentOrders = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? MOCK_RECENT_ORDERS : MOCK_RECENT_ORDERS.slice(0, 3);

  return (
    <div style={{ animation: "fadeUp 0.4s ease 0.56s both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <SectionHeading sub="Your latest deliveries">Order History 📦</SectionHeading>
        <button onClick={() => navigate("/orders")}
          style={{ fontSize: 12, fontWeight: 700, color: "#E23774", background: "rgba(226,55,116,0.07)", border: "none", borderRadius: 12, padding: "6px 14px", cursor: "pointer" }}>
          View all
        </button>
      </div>

      <div className="profile-card" style={{ overflow: "hidden" }}>
        {shown.map((o, i) => (
          <div
            key={o.id}
            className="order-row"
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              borderBottom: i < shown.length - 1 ? "1px solid rgba(226,55,116,0.05)" : "none",
              background: "white",
              animation: `fadeUp 0.3s ease ${0.58 + i * 0.05}s both`,
            }}
          >
            {/* Icon */}
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: "rgba(226,55,116,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🛵
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1A0A00", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.restaurant}
              </p>
              <p style={{ fontSize: 11, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.items}
              </p>
            </div>

            {/* Right */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00", marginBottom: 2 }}>₹{o.amount}</p>
              <p style={{ fontSize: 10, color: "#ccc" }}>{o.date}</p>
            </div>
          </div>
        ))}

        {MOCK_RECENT_ORDERS.length > 3 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: "100%", padding: "12px", borderTop: "1px solid rgba(226,55,116,0.05)",
              background: "white", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: "#E23774",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            {expanded ? "Show less ↑" : `Show ${MOCK_RECENT_ORDERS.length - 3} more orders ↓`}
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FUN STATS ROW
// ─────────────────────────────────────────────────────────────────────────────
const FunFacts = () => {
  const facts = [
    { emoji: "🌙", title: "Night Owl",         desc: `${MOCK_STATS.lateNightOrders} orders after 11 PM` },
    { emoji: "🍛",  title: "Signature Dish",    desc: MOCK_STATS.mostOrderedItem },
    { emoji: "🌶️", title: "Fav Cuisine",        desc: MOCK_STATS.favCuisine },
    { emoji: "⚡",  title: "Avg. Delivery",      desc: "24 minutes" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease 0.38s both" }}>
      <SectionHeading>Fun Facts About You ✨</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {facts.map((f, i) => (
          <div key={f.title} style={{
            background: "white", borderRadius: 18, padding: "16px 16px 14px",
            border: "1.5px solid rgba(226,55,116,0.08)",
            boxShadow: "0 2px 12px rgba(226,55,116,0.04)",
            animation: `popIn 0.35s ease ${0.4 + i * 0.06}s both`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8, animation: `float 3s ease ${i * 0.4}s infinite`, display: "inline-block" }}>
              {f.emoji}
            </div>
            <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
              {f.title}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A0A00" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NEXT MILESTONE TEASER
// ─────────────────────────────────────────────────────────────────────────────
const NextMilestone = () => {
  const next    = MILESTONES.find(m => !m.unlocked);
  const current = MOCK_STATS.totalOrders; // orders
  const target  = 50;
  const pct     = Math.min(100, Math.round((current / target) * 100));

  if (!next) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg,#2A0A14 0%,#1A0A00 100%)",
      borderRadius: 24, padding: "20px 22px",
      border: "1.5px solid rgba(226,55,116,0.2)",
      position: "relative", overflow: "hidden",
      animation: "fadeUp 0.4s ease 0.44s both",
      marginBottom: 28,
    }}>
      {/* glow */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.18),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ fontSize: 32, animation: "float 2.5s ease infinite", flexShrink: 0 }}>{next.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(226,55,116,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            Next Achievement
          </p>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#FEF3C7", marginBottom: 2 }}>
            {next.label}
          </p>
          <p style={{ fontSize: 12, color: "rgba(254,243,199,0.45)", marginBottom: 14 }}>{next.desc}</p>

          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg,#E23774,#FF6B35)",
              width: `${pct}%`, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(254,243,199,0.4)" }}>
            {current} / {target} orders — {target - current} to go
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ProfileHero = ({ userData }: { userData: any }) => {
  const navigate = useNavigate();

  // Strip leading numeric prefix e.g. "114-Kaishav Gupta" → "Kaishav Gupta"
  const rawName  = userData?.name ?? "Food Lover";
  const name     = rawName.replace(/^\d+[-\s]*/, "").trim() || rawName;
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const avatar   = userData?.image ?? null;
  const joinYear = MOCK_STATS.memberSince;

  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(160deg,#2A0A14 0%,#1A0A00 55%,#0C0806 100%)",
      overflow: "hidden",
    }}>
      {/* decorative orbs */}
      <div style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.22),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.12),transparent 70%)", pointerEvents: "none" }} />

      {/*
        Max-width + horizontal padding mirror the app's page layout:
          max-w-5xl  = 80rem = 1280px  (same as PageShell / Navbar content)
          px-6 md:px-10  matches Navbar's px-6 md:px-10
        paddingTop: 136px = 120px fixed navbar + 16px gap
      */}
      <div style={{
        position: "relative",
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "136px 40px 64px",
      }}>

        {/* Top bar — "My Profile" label left, settings buttons right */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(226,55,116,0.6)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            My Profile
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/settings")}
              style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(226,55,116,0.12)", border: "1px solid rgba(226,55,116,0.2)", cursor: "pointer", color: "#E23774", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiSettings size={15} />
            </button>
            <button onClick={() => navigate("/settings")}
              style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(226,55,116,0.12)", border: "1px solid rgba(226,55,116,0.2)", cursor: "pointer", color: "#E23774", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiEdit2 size={14} />
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0, animation: "popIn 0.5s ease 0.1s both" }}>
            <div style={{
              width: 90, height: 90, borderRadius: 28,
              background: avatar ? "transparent" : "linear-gradient(135deg,#E23774,#FF6B35)",
              border: "3px solid rgba(226,55,116,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(226,55,116,0.35)",
              overflow: "hidden",
            }}>
              {avatar
                ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "white" }}>{initials}</span>}
            </div>
            <div style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2.5px solid #1A0A00" }} />
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, animation: "fadeUp 0.4s ease 0.15s both" }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, color: "#FEF3C7", lineHeight: 1.05, marginBottom: 8 }}>
              {name}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(254,243,199,0.45)" }}>
                <FiClock size={10} /> Since {joinYear}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(254,243,199,0.2)" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(254,243,199,0.45)" }}>
                <FiShoppingBag size={10} /> {MOCK_STATS.totalOrders} orders
              </span>
            </div>
          </div>
        </div>

        {/* Tagline pill + streak pill — always in one flex row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", animation: "fadeUp 0.4s ease 0.22s both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 99,
            background: "rgba(226,55,116,0.12)", border: "1px solid rgba(226,55,116,0.22)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E23774", animation: "pulse 2s infinite", display: "block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#E23774" }}>
              Spice Lover · Night Owl · {MOCK_STATS.favCuisine} fan
            </span>
          </div>

          {MOCK_STATS.streak >= 3 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99,
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
            }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>
                {MOCK_STATS.streak}-day streak this week!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scalloped bottom edge */}
      <svg viewBox="0 0 1440 40" style={{ display: "block", width: "100%", marginBottom: -1 }} preserveAspectRatio="none">
        <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="#FFF8F0" />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const UserProfile = () => {
  const { userData } = useUser();

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* Dark hero */}
      <ProfileHero userData={userData} />

      {/* Body — max-w-5xl + matching horizontal padding mirrors Navbar and PageShell */}
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 40px 80px" }}>

        {/* ── Stats grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
          <StatPill icon={<FiShoppingBag size={15} />} value={String(MOCK_STATS.totalOrders)}    label="Total Orders"   delay={0}    />
          <StatPill icon={<FiGift        size={15} />} value={`₹${MOCK_STATS.totalSaved}`}       label="Total Saved"    delay={0.06} accent="#16a34a" />
          <StatPill icon={<FiTrendingUp  size={15} />} value={`₹${MOCK_STATS.avgOrderValue}`}    label="Avg. Order"     delay={0.12} accent="#d97706" />
          <StatPill icon={<FiHeart       size={15} />} value={String(MOCK_RESTAURANTS.length)}   label="Fav Spots"      delay={0.18} accent="#E23774" />
        </div>

        {/* ── Next milestone ── */}
        <NextMilestone />

        {/* ── Fun facts ── */}
        <div style={{ marginBottom: 32 }}>
          <FunFacts />
        </div>

        {/* ── Food personality ── */}
        <div style={{ marginBottom: 32 }}>
          <FoodPersonality />
        </div>

        {/* ── Milestones ── */}
        <div style={{ marginBottom: 32 }}>
          <MilestonesSection />
        </div>

        {/* ── Favourite restaurants ── */}
        <div style={{ marginBottom: 32 }}>
          <FavRestaurants />
        </div>

        {/* ── Recent orders ── */}
        <div style={{ marginBottom: 32 }}>
          <RecentOrders />
        </div>

        {/* ── Referral card ── */}
        <div style={{
          background: "linear-gradient(135deg,#E23774,#FF6B35)",
          borderRadius: 24, padding: "22px 22px",
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.65s both",
        }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 20, bottom: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 10, animation: "float 2.5s ease infinite" }}>🎁</span>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "white", marginBottom: 4 }}>
              Invite friends, earn ₹100
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.5 }}>
              Share your referral link. You get ₹100 credit for every friend who places their first order.
            </p>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 14,
              background: "white", color: "#E23774",
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}>
              <FiZap size={13} /> Share Referral Link
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;