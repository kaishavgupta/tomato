// src/pages/OrdersPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Aesthetic: Same warm editorial system as the rest of the app.
// Cream canvas, Playfair / DM Sans / Bebas Neue, pink-orange gradients.
// Full-bleed dark header bleeding into cream body, staggered animations.
//
// Features:
//  • Active orders (Confirmed / Preparing / On The Way) — live progress stepper
//  • Payment Pending — 15-minute countdown timer with payment CTA
//  • Past orders (Delivered / Cancelled) — compact history cards
//  • Each expanded order shows:
//      - User: name, phone, address
//      - Restaurant: logo, name, email, phone, address
//      - Google Static Map (restaurant + user pins) — only when payment confirmed
//      - Ordered items with quantities
//      - Full bill breakdown
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin, FiPhone, FiMail, FiPackage, FiClock,
  FiCheckCircle, FiXCircle, FiTruck, FiChevronDown,
  FiAlertCircle, FiCreditCard,
} from "react-icons/fi";
import useUser from "../../Hooks/useUser";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "payment_pending"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  price: number;          // per unit effective price
  originalPrice?: number; // if discounted
  image?: string;
  isVeg?: boolean;
}

interface OrderAddress {
  line1: string;
  city: string;
  pincode?: string;
}

interface RestaurantInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  address: OrderAddress;
  location?: { lat: number; lng: number };
}

interface UserInfo {
  name: string;
  phone: string;
  email?: string;
  address: OrderAddress;
  location?: { lat: number; lng: number };
}

interface Order {
  _id: string;
  status: OrderStatus;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  placedAt: string;          // ISO date string
  paymentDeadline?: string;  // ISO — only for payment_pending
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  restaurant: RestaurantInfo;
  user: UserInfo;
  estimatedDelivery?: string; // e.g. "35–45 min"
  otp?: string;               // delivery OTP
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — replace with real API hook
// ─────────────────────────────────────────────────────────────────────────────

const now = new Date();
const mins = (m: number) => new Date(now.getTime() + m * 60_000).toISOString();
const past = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

const MOCK_ORDERS: Order[] = [
  // ── Payment pending — 15-min timer ──────────────────────────────────────
  {
    _id: "ord_pend_001",
    status: "payment_pending",
    paymentMethod: "online",
    paymentStatus: "pending",
    placedAt: past(3),
    paymentDeadline: mins(12), // 12 minutes remaining
    items: [
      { _id: "i1", name: "Butter Chicken", qty: 1, price: 340, isVeg: false, image: "" },
      { _id: "i2", name: "Garlic Naan",    qty: 2, price: 55,  isVeg: true  },
    ],
    subtotal: 450, deliveryFee: 40, discount: 0, total: 490,
    restaurant: {
      _id: "r1", name: "Spice Garden", email: "spice@garden.in",
      phone: "+91 98765 11111",
      address: { line1: "Plot 12, Sector 18, Noida", city: "Noida", pincode: "201301" },
      location: { lat: 28.5700, lng: 77.3219 },
    },
    user: {
      name: "Kaishav Gupta", phone: "+91 93456 78901",
      address: { line1: "Flat 4B, Sunrise Apartments, Vaishali", city: "Ghaziabad", pincode: "201010" },
      location: { lat: 28.6304, lng: 77.3447 },
    },
  },

  // ── Confirmed ────────────────────────────────────────────────────────────
  {
    _id: "ord_conf_002",
    status: "confirmed",
    paymentMethod: "cod",
    paymentStatus: "pending",
    placedAt: past(8),
    estimatedDelivery: "30–40 min",
    items: [
      { _id: "i3", name: "Margherita Pizza", qty: 1, price: 320, originalPrice: 380, isVeg: true, image: "" },
      { _id: "i4", name: "Coke 500ml",        qty: 2, price: 60,  isVeg: true },
    ],
    subtotal: 440, deliveryFee: 35, discount: 60, total: 415,
    restaurant: {
      _id: "r2", name: "Pizza Factory", email: "hello@pizzafactory.in",
      phone: "+91 98765 22222",
      address: { line1: "Shop 7, Indirapuram Mall Road", city: "Ghaziabad", pincode: "201014" },
      location: { lat: 28.6436, lng: 77.3689 },
    },
    user: {
      name: "Kaishav Gupta", phone: "+91 93456 78901",
      address: { line1: "Flat 4B, Sunrise Apartments, Vaishali", city: "Ghaziabad", pincode: "201010" },
      location: { lat: 28.6304, lng: 77.3447 },
    },
    otp: "5829",
  },

  // ── On The Way ───────────────────────────────────────────────────────────
  {
    _id: "ord_otw_003",
    status: "on_the_way",
    paymentMethod: "online",
    paymentStatus: "paid",
    placedAt: past(35),
    estimatedDelivery: "8–12 min",
    items: [
      { _id: "i5", name: "Hakka Noodles",  qty: 1, price: 210, isVeg: true, image: "" },
      { _id: "i6", name: "Spring Rolls",   qty: 6, price: 30,  isVeg: true },
      { _id: "i7", name: "Veg Manchurian", qty: 1, price: 190, isVeg: true },
    ],
    subtotal: 580, deliveryFee: 40, discount: 0, total: 620,
    restaurant: {
      _id: "r3", name: "Wok & Roll", email: "wokroll@food.in",
      phone: "+91 98765 33333",
      address: { line1: "B-24, Raj Nagar Extension", city: "Ghaziabad", pincode: "201017" },
      location: { lat: 28.6611, lng: 77.4138 },
    },
    user: {
      name: "Kaishav Gupta", phone: "+91 93456 78901",
      address: { line1: "Flat 4B, Sunrise Apartments, Vaishali", city: "Ghaziabad", pincode: "201010" },
      location: { lat: 28.6304, lng: 77.3447 },
    },
    otp: "3741",
  },

  // ── Delivered ────────────────────────────────────────────────────────────
  {
    _id: "ord_del_004",
    status: "delivered",
    paymentMethod: "cod",
    paymentStatus: "paid",
    placedAt: past(180),
    items: [
      { _id: "i8", name: "Dal Makhani", qty: 1, price: 220, isVeg: true },
      { _id: "i9", name: "Chapati",     qty: 4, price: 20,  isVeg: true },
    ],
    subtotal: 300, deliveryFee: 30, discount: 0, total: 330,
    restaurant: {
      _id: "r1", name: "Spice Garden", email: "spice@garden.in",
      phone: "+91 98765 11111",
      address: { line1: "Plot 12, Sector 18, Noida", city: "Noida", pincode: "201301" },
      location: { lat: 28.5700, lng: 77.3219 },
    },
    user: {
      name: "Kaishav Gupta", phone: "+91 93456 78901",
      address: { line1: "Flat 4B, Sunrise Apartments, Vaishali", city: "Ghaziabad", pincode: "201010" },
      location: { lat: 28.6304, lng: 77.3447 },
    },
  },

  // ── Cancelled ────────────────────────────────────────────────────────────
  {
    _id: "ord_can_005",
    status: "cancelled",
    paymentMethod: "online",
    paymentStatus: "refunded",
    placedAt: past(1440),
    items: [
      { _id: "i10", name: "Chicken Biryani", qty: 2, price: 280, isVeg: false },
    ],
    subtotal: 560, deliveryFee: 40, discount: 0, total: 600,
    restaurant: {
      _id: "r4", name: "Biryani House", email: "biryani@house.in",
      phone: "+91 98765 44444",
      address: { line1: "23 MG Road", city: "Ghaziabad", pincode: "201001" },
      location: { lat: 28.6692, lng: 77.4538 },
    },
    user: {
      name: "Kaishav Gupta", phone: "+91 93456 78901",
      address: { line1: "Flat 4B, Sunrise Apartments, Vaishali", city: "Ghaziabad", pincode: "201010" },
      location: { lat: 28.6304, lng: 77.3447 },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; step: number;
}> = {
  payment_pending: { label: "Payment Pending", color: "#d97706", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.3)", icon: <FiCreditCard size={13} />, step: 0 },
  confirmed:       { label: "Order Confirmed", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.22)", icon: <FiCheckCircle size={13} />, step: 1 },
  preparing:       { label: "Preparing",       color: "#E23774", bg: "rgba(226,55,116,0.08)", border: "rgba(226,55,116,0.2)", icon: <FiPackage size={13} />, step: 2 },
  on_the_way:      { label: "On The Way",       color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", icon: <FiTruck size={13} />, step: 3 },
  delivered:       { label: "Delivered",        color: "#16a34a", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", icon: <FiCheckCircle size={13} />, step: 4 },
  cancelled:       { label: "Cancelled",        color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", icon: <FiXCircle size={13} />, step: -1 },
};

const STEPS = [
  { key: "confirmed",  label: "Confirmed",  icon: "✓" },
  { key: "preparing",  label: "Preparing",  icon: "👨‍🍳" },
  { key: "on_the_way", label: "On the way", icon: "🛵" },
  { key: "delivered",  label: "Delivered",  icon: "🏠" },
];

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Today, ${formatTime(iso)}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${formatTime(iso)}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const cleanName = (n?: string) =>
  (n ?? "").replace(/^\d+[-\s]*/, "").trim() || (n ?? "User");

// Google Static Maps URL — shows restaurant (red) and user (blue) pins
const staticMapUrl = (order: Order) => {
  const rLat = order.restaurant.location?.lat;
  const rLng = order.restaurant.location?.lng;
  const uLat = order.user.location?.lat;
  const uLng = order.user.location?.lng;
  if (!rLat || !uLat) return null;
  const center = `${((rLat + uLat) / 2)},${((rLng! + uLng!) / 2)}`;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${center}&zoom=13&size=600x200&scale=2` +
    `&markers=color:red%7Clabel:R%7C${rLat},${rLng}` +
    `&markers=color:blue%7Clabel:U%7C${uLat},${uLng}` +
    `&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x1A0A00` +
    `&key=YOUR_GOOGLE_MAPS_API_KEY`
  );
};

// Fallback map using OpenStreetMap iframe (no API key needed)
const osmMapUrl = (order: Order) => {
  const rLat = order.restaurant.location?.lat;
  const rLng = order.restaurant.location?.lng;
  const uLat = order.user.location?.lat;
  const uLng = order.user.location?.lng;
  if (!rLat || !uLat) return null;
  const cLat = (rLat + uLat) / 2;
  const cLng = (rLng! + uLng!) / 2;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${cLng! - 0.05},${cLat - 0.04},${cLng! + 0.05},${cLat + 0.04}&layer=mapnik&marker=${cLat},${cLng}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT TIMER
// ─────────────────────────────────────────────────────────────────────────────

const PaymentTimer = ({ deadline }: { deadline: string }) => {
  const calc = useCallback(() => {
    const diff = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
    return { mins: Math.floor(diff / 60), secs: diff % 60, expired: diff === 0 };
  }, [deadline]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  const pct = Math.max(0, ((new Date(deadline).getTime() - Date.now()) / (15 * 60_000)) * 100);
  const urgent = time.mins < 3;

  if (time.expired) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)" }}>
        <FiAlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>Payment window expired — order will be cancelled</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", borderRadius: 14, background: urgent ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)", border: `1.5px solid ${urgent ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiClock size={13} style={{ color: urgent ? "#ef4444" : "#d97706" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: urgent ? "#ef4444" : "#d97706" }}>
            Complete payment in
          </span>
        </div>
        <span style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1,
          color: urgent ? "#ef4444" : "#d97706",
          animation: urgent ? "pulse 1s infinite" : "none",
        }}>
          {String(time.mins).padStart(2, "0")}:{String(time.secs).padStart(2, "0")}
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: urgent ? "#ef4444" : "linear-gradient(90deg,#d97706,#f59e0b)",
          width: `${pct}%`, transition: "width 1s linear",
        }} />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
        {urgent ? "⚠️ Hurry! Your slot may be released." : "Your order is reserved. Pay now to confirm."}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER PROGRESS STEPPER
// ─────────────────────────────────────────────────────────────────────────────

const OrderStepper = ({ order }: { order: Order }) => {
  const currentStep = STATUS_META[order.status].step;
  if (currentStep <= 0) return null;

  return (
    <div style={{ padding: "16px 0 4px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
        {/* Connecting line */}
        <div style={{ position: "absolute", top: 18, left: "12.5%", right: "12.5%", height: 2, background: "rgba(226,55,116,0.1)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: 18, left: "12.5%", height: 2, background: "linear-gradient(90deg,#E23774,#FF6B35)", zIndex: 1, transition: "width 0.6s ease", width: `${Math.max(0, (currentStep - 1) / 3 * 75)}%` }} />

        {STEPS.map((step, i) => {
          const done    = i < currentStep;
          const active  = i === currentStep - 1;
          const pending = i >= currentStep;
          return (
            <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, position: "relative", zIndex: 2 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: done ? "linear-gradient(135deg,#E23774,#FF6B35)" : active ? "white" : "white",
                border: done ? "none" : active ? "2.5px solid #E23774" : "2px solid rgba(226,55,116,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                boxShadow: active ? "0 0 0 4px rgba(226,55,116,0.15)" : "none",
                transition: "all 0.3s ease",
              }}>
                {done ? <span style={{ fontSize: 14, color: "white" }}>✓</span> : <span style={{ filter: pending && !active ? "grayscale(1) opacity(0.4)" : "none" }}>{step.icon}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: active || done ? 700 : 500, color: active ? "#E23774" : done ? "#E23774" : "#bbb", textAlign: "center", lineHeight: 1.3 }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ETA or OTP */}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {order.estimatedDelivery && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(226,55,116,0.07)", border: "1px solid rgba(226,55,116,0.15)" }}>
            <FiClock size={11} style={{ color: "#E23774" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#E23774" }}>ETA: {order.estimatedDelivery}</span>
          </div>
        )}
        {order.otp && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", letterSpacing: "0.1em" }}>OTP: {order.otp}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAP SECTION
// ─────────────────────────────────────────────────────────────────────────────

const OrderMap = ({ order }: { order: Order }) => {
  const rLat = order.restaurant.location?.lat;
  const rLng = order.restaurant.location?.lng;
  const uLat = order.user.location?.lat;
  const uLng = order.user.location?.lng;

  if (!rLat || !uLat) return null;

  const cLat = (rLat + uLat) / 2;
  const cLng = (rLng! + uLng!) / 2;
  const latDiff = Math.abs(rLat - uLat) + 0.04;
  const lngDiff = Math.abs(rLng! - uLng!) + 0.06;

  const iframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${cLng - lngDiff / 2},${cLat - latDiff / 2},${cLng + lngDiff / 2},${cLat + latDiff / 2}&layer=mapnik`;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        📍 Live Route
      </p>
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(226,55,116,0.12)", position: "relative" }}>
        <iframe
          src={iframeUrl}
          title="Order Map"
          style={{ width: "100%", height: 200, border: "none", display: "block" }}
          loading="lazy"
        />
        {/* Pin legend overlay */}
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "rgba(255,248,240,0.95)", backdropFilter: "blur(6px)",
          borderRadius: 10, padding: "7px 10px",
          border: "1px solid rgba(226,55,116,0.12)",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, color: "#1A0A00" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E23774", flexShrink: 0 }} />
            {order.restaurant.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, color: "#1A0A00" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
            Your location
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INFO ROW (reusable: icon + label + value)
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
    <span style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(226,55,116,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#E23774", marginTop: 1 }}>
      {icon}
    </span>
    <div>
      <p style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 1 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#1A0A00", fontWeight: 500, lineHeight: 1.4 }}>{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BILL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

const BillBlock = ({ order }: { order: Order }) => (
  <div style={{ background: "rgba(226,55,116,0.03)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(226,55,116,0.09)" }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
      Bill Summary
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: "#888" }}>Subtotal</span>
        <span style={{ fontWeight: 600, color: "#1A0A00" }}>₹{order.subtotal}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: "#888", display: "flex", alignItems: "center", gap: 4 }}><FiTruck size={10} /> Delivery fee</span>
        <span style={{ fontWeight: 600, color: "#1A0A00" }}>₹{order.deliveryFee}</span>
      </div>
      {order.discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#16a34a" }}>Discount</span>
          <span style={{ fontWeight: 600, color: "#16a34a" }}>− ₹{order.discount}</span>
        </div>
      )}
      <div style={{ height: 1, background: "rgba(226,55,116,0.1)", margin: "4px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>Total</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#E23774" }}>₹{order.total}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: "#bbb" }}>Payment</span>
        <span style={{ color: order.paymentStatus === "paid" ? "#16a34a" : order.paymentStatus === "refunded" ? "#3b82f6" : "#d97706", fontWeight: 600, textTransform: "capitalize" }}>
          {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentStatus === "refunded" ? "↩ Refunded" : order.paymentMethod.toUpperCase()}
        </span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ITEMS LIST
// ─────────────────────────────────────────────────────────────────────────────

const ItemsList = ({ items }: { items: OrderItem[] }) => (
  <div>
    <p style={{ fontSize: 11, fontWeight: 700, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
      Order Items
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* veg dot */}
          <span style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${item.isVeg ? "#16a34a" : "#ef4444"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.isVeg ? "#16a34a" : "#ef4444", display: "block" }} />
          </span>
          <span style={{ fontSize: 13, color: "#1A0A00", flex: 1 }}>{item.name}</span>
          <span style={{ fontSize: 12, color: "#aaa", marginRight: 8 }}>× {item.qty}</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1A0A00" }}>₹{item.price * item.qty}</span>
            {item.originalPrice && (
              <span style={{ fontSize: 10, textDecoration: "line-through", color: "#ccc", display: "block" }}>₹{item.originalPrice * item.qty}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FULL ORDER CARD
// ─────────────────────────────────────────────────────────────────────────────

const OrderCard = ({ order, defaultOpen = false }: { order: Order; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const meta = STATUS_META[order.status];
  const isPast = order.status === "delivered" || order.status === "cancelled";
  const showMap = order.paymentStatus === "paid" && order.status !== "cancelled";

  return (
    <div style={{
      background: "white", borderRadius: 24, overflow: "hidden",
      border: `1.5px solid ${order.status === "payment_pending" ? "rgba(245,158,11,0.3)" : order.status === "cancelled" ? "rgba(239,68,68,0.12)" : "rgba(226,55,116,0.08)"}`,
      boxShadow: isPast ? "none" : "0 6px 32px rgba(226,55,116,0.08)",
      transition: "box-shadow 0.2s",
      animation: "fadeUp 0.4s ease both",
    }}>

      {/* ── Card header ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
      >
        {/* Restaurant avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0, overflow: "hidden",
          background: "linear-gradient(135deg,rgba(226,55,116,0.10),rgba(255,107,53,0.10))",
          border: "1.5px solid rgba(226,55,116,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, filter: order.status === "cancelled" ? "grayscale(60%) brightness(0.9)" : "none",
        }}>
          {order.restaurant.image
            ? <img src={order.restaurant.image} alt={order.restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🍽️"}
        </div>

        {/* Centre info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: order.status === "cancelled" ? "#888" : "#1A0A00", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {order.restaurant.name}
            </p>
            {/* Status badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 9px", borderRadius: 99, flexShrink: 0,
              background: meta.bg, border: `1px solid ${meta.border}`,
              fontSize: 10, fontWeight: 700, color: meta.color,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#bbb" }}>
            {order.items.map(i => i.name).join(", ")}
          </p>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
            {formatDate(order.placedAt)} · ₹{order.total}
          </p>
        </div>

        {/* Chevron */}
        <FiChevronDown size={16} style={{ color: "#E23774", flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </div>

      {/* ── Active order — payment timer or stepper always visible ── */}
      {!isPast && !open && (
        <div style={{ padding: "0 20px 16px" }}>
          {order.status === "payment_pending" && order.paymentDeadline && (
            <PaymentTimer deadline={order.paymentDeadline} />
          )}
          {order.status !== "payment_pending" && (
            <OrderStepper order={order} />
          )}
        </div>
      )}

      {/* ── Expanded detail ── */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(226,55,116,0.07)", padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Payment timer (inside expanded too) */}
          {order.status === "payment_pending" && order.paymentDeadline && (
            <div>
              <PaymentTimer deadline={order.paymentDeadline} />
              <button style={{
                marginTop: 10, width: "100%", padding: "13px", borderRadius: 14,
                background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
                border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(226,55,116,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <FiCreditCard size={14} /> Pay Now · ₹{order.total}
              </button>
            </div>
          )}

          {/* Order stepper */}
          {order.status !== "payment_pending" && !isPast && (
            <div style={{ paddingTop: 4 }}>
              <OrderStepper order={order} />
            </div>
          )}

          {/* Map — only when payment confirmed */}
          {showMap && <OrderMap order={order} />}

          {/* ── User info ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Delivery To
            </p>
            <div style={{
              background: "rgba(59,130,246,0.04)", borderRadius: 16, padding: "14px 16px",
              border: "1px solid rgba(59,130,246,0.12)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <InfoRow icon={<span style={{ fontSize: 13 }}>👤</span>} label="Name" value={cleanName(order.user.name)} />
              <InfoRow icon={<FiPhone size={12} />} label="Phone" value={order.user.phone} />
              <InfoRow icon={<FiMapPin size={12} />} label="Address" value={`${order.user.address.line1}, ${order.user.address.city}${order.user.address.pincode ? " — " + order.user.address.pincode : ""}`} />
            </div>
          </div>

          {/* ── Restaurant info ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Restaurant
            </p>
            <div style={{
              background: "rgba(226,55,116,0.03)", borderRadius: 16, padding: "14px 16px",
              border: "1px solid rgba(226,55,116,0.09)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {/* Logo + name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: "1px solid rgba(226,55,116,0.07)", marginBottom: 2 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,rgba(226,55,116,0.10),rgba(255,107,53,0.10))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {order.restaurant.image ? <img src={order.restaurant.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} /> : "🍽️"}
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#1A0A00" }}>{order.restaurant.name}</p>
                  <p style={{ fontSize: 11, color: "#aaa" }}>{order.restaurant.address.city}</p>
                </div>
              </div>
              <InfoRow icon={<FiMail size={12} />}   label="Email"   value={order.restaurant.email} />
              <InfoRow icon={<FiPhone size={12} />}   label="Phone"   value={order.restaurant.phone} />
              <InfoRow icon={<FiMapPin size={12} />}  label="Address" value={`${order.restaurant.address.line1}, ${order.restaurant.address.city}${order.restaurant.address.pincode ? " — " + order.restaurant.address.pincode : ""}`} />
            </div>
          </div>

          {/* ── Items ── */}
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(226,55,116,0.09)" }}>
            <ItemsList items={order.items} />
          </div>

          {/* ── Bill ── */}
          <BillBlock order={order} />

          {/* ── Order ID ── */}
          <p style={{ fontSize: 10, color: "#ccc", textAlign: "center" }}>
            Order ID: {order._id}
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EmptyOrders = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease both" }}>
      <div style={{ fontSize: 52, marginBottom: 16, animation: "float 3s ease infinite" }}>📦</div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: "#1A0A00", marginBottom: 8 }}>
        No orders yet
      </h3>
      <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>Your order history will appear here</p>
      <button onClick={() => navigate("/")}
        style={{ padding: "12px 28px", borderRadius: 16, background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(226,55,116,0.3)" }}>
        Browse Restaurants
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Bebas+Neue&display=swap');

    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const OrdersPage = () => {
  const { userData } = useUser();
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  // Replace MOCK_ORDERS with your real API call:
  // const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const orders = MOCK_ORDERS;

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const pastOrders   = orders.filter(o =>  ["delivered", "cancelled"].includes(o.status));

  const shown = filter === "active" ? activeOrders : filter === "past" ? pastOrders : orders;

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* ── Dark hero header ── */}
      <div style={{
        position: "relative",
        background: "linear-gradient(160deg,#2A0A14 0%,#1A0A00 55%,#0C0806 100%)",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.18),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.10),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "80rem", margin: "0 auto", padding: "136px 40px 56px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(226,55,116,0.6)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            My Orders
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,5vw,48px)", fontWeight: 900, color: "#FEF3C7", lineHeight: 1.05, marginBottom: 6 }}>
            Order History
          </h1>
          <p style={{ fontSize: 13, color: "rgba(254,243,199,0.42)", marginBottom: 28 }}>
            {activeOrders.length > 0
              ? `${activeOrders.length} active order${activeOrders.length > 1 ? "s" : ""} · ${pastOrders.length} past`
              : `${pastOrders.length} past orders`}
          </p>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "all",    label: "All",    count: orders.length },
              { key: "active", label: "Active", count: activeOrders.length },
              { key: "past",   label: "Past",   count: pastOrders.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.18s",
                  background: filter === tab.key ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(255,248,240,0.07)",
                  color: filter === tab.key ? "white" : "rgba(254,243,199,0.5)",
                  border: filter === tab.key ? "none" : "1.5px solid rgba(226,55,116,0.2)",
                  boxShadow: filter === tab.key ? "0 4px 14px rgba(226,55,116,0.3)" : "none",
                }}
              >
                {tab.label}
                <span style={{
                  width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: filter === tab.key ? "rgba(255,255,255,0.25)" : "rgba(226,55,116,0.15)",
                  color: filter === tab.key ? "white" : "#E23774",
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scalloped bottom */}
        <svg viewBox="0 0 1440 40" style={{ display: "block", width: "100%", marginBottom: -1 }} preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="#FFF8F0" />
        </svg>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "28px 40px 80px" }}>

        {shown.length === 0 && <EmptyOrders />}

        {/* Active orders section */}
        {filter !== "past" && activeOrders.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            {filter === "all" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E23774", animation: "pulse 2s infinite" }} />
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#1A0A00" }}>
                  Active Orders
                </h2>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {activeOrders.map((order, i) => (
                <div key={order._id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <OrderCard order={order} defaultOpen={order.status === "payment_pending" || order.status === "on_the_way"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past orders section */}
        {filter !== "active" && pastOrders.length > 0 && (
          <div>
            {filter === "all" && (
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#1A0A00", marginBottom: 16 }}>
                Past Orders
              </h2>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pastOrders.map((order, i) => (
                <div key={order._id} style={{ animationDelay: `${(activeOrders.length + i) * 0.05}s` }}>
                  <OrderCard order={order} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;