// src/pages/User/Checkout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Route: /checkout/:orderId  (falls back to /checkout with orderId from state)
//
// Behaviour:
//  • Fetches the order by ID from the backend
//  • If payment.status !== "pending" → shows "Already Paid / Cancelled" screen
//  • If payment.status === "pending"  → shows full checkout UI with 15-min timer
//  • Timer expires → order is stale, redirects to /orders
//
// Design: same warm editorial system (Playfair / DM Sans / Bebas Neue,
//         cream canvas #FFF8F0, pink-orange gradients, dark hero header)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FiArrowLeft, FiClock, FiCreditCard, FiMapPin,
  FiPhone, FiPackage, FiAlertCircle, FiCheckCircle,
  FiShield, FiInfo,
} from "react-icons/fi";
import { SiRazorpay } from "react-icons/si";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (mirror the backend response shape)
// ─────────────────────────────────────────────────────────────────────────────

interface OrderItem {
  itemId:     string;
  itemName:   string;
  quantity:   number;
  price:      number;
  item_image: string;
}

interface IOrder {
  _id: string;
  user: {
    userId:       string;
    userPhone:    string;
    userLocation: {
      addressId:       string;
      coordinates:     [number, number];
      formatedAddress: string;
    };
  };
  restaurent: {
    restaurentId:   string;
    restaurent_name: string;
    restaurent_image:string
    restaurantPhone: string;
    restaurentLocation: {
      addressId:       string;
      coordinates:     [number, number];
      formatedAddress: string;
    };
  };
  item: OrderItem[];
  bill: {
    subtotal:      number;
    deliverCharges: number;
    platformFee:   number;
    totalAmount:   number;
  };
  payment: {
    method: "razorpay" | "stripe";
    status: "pending" | "paid" | "failed";
  };
  orderstatus: string;
  expiredAt:   string;
  createdAt:   string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Bebas+Neue&display=swap');

    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.92)}       to{opacity:1;transform:scale(1)}     }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
    @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(226,55,116,0.4)} 50%{box-shadow:0 0 0 10px rgba(226,55,116,0)} }
    @keyframes timerPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

    .pay-btn { transition: transform 0.18s, box-shadow 0.18s; }
    .pay-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(226,55,116,0.45) !important; }
    .pay-btn:not(:disabled):active { transform: scale(0.98); }
    .pay-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .info-card { transition: box-shadow 0.2s, transform 0.2s; }
    .info-card:hover { box-shadow: 0 4px 20px rgba(226,55,116,0.08); }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = ({ w = "100%", h = 16, r = 10, mb = 10 }: { w?: string | number; h?: number; r?: number; mb?: number }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: "linear-gradient(90deg,#f5e9f0 25%,#fdf0f5 50%,#f5e9f0 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
  }} />
);

const CheckoutSkeleton = () => (
  <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 20px" }}>
    <Skeleton h={28} w="60%" r={12} mb={24} />
    <Skeleton h={120} r={20} mb={16} />
    <Skeleton h={80}  r={20} mb={16} />
    <Skeleton h={160} r={20} mb={16} />
    <Skeleton h={56}  r={16} mb={0}  />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT COUNTDOWN TIMER
// ─────────────────────────────────────────────────────────────────────────────

const PaymentTimer = ({ expiredAt, onExpire }: { expiredAt: string; onExpire: () => void }) => {
  const calc = useCallback(() => {
    const diff = Math.max(0, Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000));
    return { mins: Math.floor(diff / 60), secs: diff % 60, expired: diff === 0 };
  }, [expiredAt]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => {
      const t = calc();
      setTime(t);
      if (t.expired) { clearInterval(id); onExpire(); }
    }, 1000);
    return () => clearInterval(id);
  }, [calc, onExpire]);

  const total = 15 * 60;
  const remaining = time.mins * 60 + time.secs;
  const pct = Math.max(0, (remaining / total) * 100);
  const urgent = remaining < 180; // < 3 min

  const color  = urgent ? "#ef4444" : "#d97706";
  const bgC    = urgent ? "rgba(239,68,68,0.07)"  : "rgba(245,158,11,0.07)";
  const border = urgent ? "rgba(239,68,68,0.25)"  : "rgba(245,158,11,0.25)";
  const grad   = urgent
    ? "linear-gradient(90deg,#ef4444,#f87171)"
    : "linear-gradient(90deg,#d97706,#f59e0b,#fbbf24)";

  return (
    <div style={{
      padding: "16px 18px", borderRadius: 18,
      background: bgC, border: `1.5px solid ${border}`,
      animation: "fadeUp 0.35s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FiClock size={14} style={{ color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.02em" }}>
            {urgent ? "⚠️ Hurry! Time running out" : "Complete payment before slot expires"}
          </span>
        </div>
        <span style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 28, letterSpacing: 2, color,
          animation: urgent ? "timerPulse 1s infinite" : "none",
          lineHeight: 1,
        }}>
          {String(time.mins).padStart(2, "0")}:{String(time.secs).padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: grad,
          width: `${pct}%`,
          transition: "width 1s linear",
        }} />
      </div>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
        {urgent
          ? "Your order reservation may be released if payment isn't completed."
          : "Your cart and restaurant slot are reserved. Pay now to confirm."}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: 10, fontWeight: 800, color: "#E23774",
    textTransform: "uppercase", letterSpacing: "0.10em",
    marginBottom: 12,
  }}>
    {children}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SUMMARY CARD
// ─────────────────────────────────────────────────────────────────────────────

const OrderSummaryCard = ({ order }: { order: IOrder }) => (
  <div className="info-card" style={{
    background: "white", borderRadius: 22,
    border: "1.5px solid rgba(226,55,116,0.09)",
    boxShadow: "0 4px 24px rgba(226,55,116,0.05)",
    overflow: "hidden",
    animation: "fadeUp 0.35s ease 0.05s both",
  }}>
    {/* Restaurant header */}
    <div style={{
      padding: "18px 20px",
      background: "linear-gradient(135deg,rgba(226,55,116,0.04),rgba(255,107,53,0.03))",
      borderBottom: "1px solid rgba(226,55,116,0.08)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16, flexShrink: 0,
        background: "linear-gradient(135deg,rgba(226,55,116,0.12),rgba(255,107,53,0.10))",
        border: "1.5px solid rgba(226,55,116,0.12)",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>
        {order.restaurent.restaurent_image
          ? <img
              src={order.restaurent.restaurent_image}
              alt={order.restaurent.restaurent_name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          : "🍽️"}
      </div>
      <div>
        <p style={{ fontSize: 9, fontWeight: 800, color: "#E23774", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 2 }}>
          From
        </p>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1A0A00", lineHeight: 1.2 }}>
          {order.restaurent.restaurent_name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
          <FiPhone size={10} style={{ color: "#E23774" }} />
          <span style={{ fontSize: 11, color: "#aaa" }}>{order.restaurent.restaurantPhone}</span>
        </div>
      </div>
    </div>

    {/* Items */}
    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
      <SectionLabel>Order Items</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {order.item.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(226,55,116,0.06)",
              border: "1px solid rgba(226,55,116,0.10)",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {it.item_image
                ? <img
                    src={it.item_image}
                    alt={it.itemName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                : "🍱"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1A0A00", lineHeight: 1.3 }}>{it.itemName}</p>
              <p style={{ fontSize: 11, color: "#bbb" }}>×{it.quantity} · ₹{it.price} each</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1A0A00" }}>
              ₹{it.price * it.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Delivery address */}
    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
      <SectionLabel>Deliver To</SectionLabel>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0,
          background: "rgba(226,55,116,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#E23774",
        }}>
          <FiMapPin size={13} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#1A0A00", lineHeight: 1.5 }}>
            {order.user.userLocation.formatedAddress}
          </p>
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
            <FiPhone size={9} style={{ marginRight: 4, verticalAlign: "middle" }} />
            {order.user.userPhone}
          </p>
        </div>
      </div>
    </div>

    {/* Bill breakdown */}
    <div style={{ padding: "14px 20px" }}>
      <SectionLabel>Bill Summary</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <BillRow label="Subtotal" value={`₹${order.bill.subtotal}`} />
        <BillRow label="Delivery charges" value={`₹${order.bill.deliverCharges}`} icon={<FiPackage size={10} style={{ color: "#E23774" }} />} />
        <BillRow label="Platform fee" value={`₹${order.bill.platformFee}`} />
        <div style={{ height: 1, background: "rgba(226,55,116,0.10)", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1A0A00" }}>Total Payable</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#E23774", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
            ₹{order.bill.totalAmount}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const BillRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 5 }}>
      {icon}{label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A0A00" }}>{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT METHOD BADGE
// ─────────────────────────────────────────────────────────────────────────────

const PaymentMethodBadge = ({ method }: { method: "razorpay" | "stripe" }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 18px", borderRadius: 18,
    background: "white",
    border: "1.5px solid rgba(226,55,116,0.12)",
    boxShadow: "0 2px 12px rgba(226,55,116,0.06)",
    animation: "fadeUp 0.35s ease 0.1s both",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
      background: method === "razorpay"
        ? "linear-gradient(135deg,#072654,#1a3a6e)"
        : "linear-gradient(135deg,#6772E5,#8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 14px rgba(7,38,84,0.25)",
    }}>
      <FiCreditCard size={20} color="white" />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#1A0A00", textTransform: "capitalize" }}>
        {method === "razorpay" ? "Razorpay" : "Stripe"}
      </p>
      <p style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>
        {method === "razorpay"
          ? "UPI, Cards, Net Banking, Wallets"
          : "International Cards & Wallets"}
      </p>
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)",
    }}>
      <FiShield size={10} style={{ color: "#16a34a" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>Secure</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ALREADY PAID / EXPIRED STATE
// ─────────────────────────────────────────────────────────────────────────────

const NonPendingState = ({
  status, orderId,
}: { status: "paid" | "failed" | "expired"; orderId: string }) => {
  const navigate = useNavigate();
  const config = {
    paid:    { emoji: "✅", title: "Already Paid",      sub: "This order has been paid and is being processed.",    color: "#16a34a", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)"  },
    failed:  { emoji: "❌", title: "Payment Failed",    sub: "This payment attempt failed. Please retry from orders.", color: "#ef4444", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.25)"  },
    expired: { emoji: "⏱️", title: "Session Expired",   sub: "The 15-minute payment window has closed.",              color: "#d97706", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.25)" },
  }[status];

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "80px 24px", textAlign: "center", animation: "popIn 0.35s ease both" }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>{config.emoji}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#1A0A00", marginBottom: 8 }}>
        {config.title}
      </h2>
      <p style={{ fontSize: 13, color: "#bbb", marginBottom: 28, lineHeight: 1.6 }}>{config.sub}</p>
      <div style={{
        padding: "10px 14px", borderRadius: 12,
        background: config.bg, border: `1.5px solid ${config.border}`,
        marginBottom: 28, display: "inline-block",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: config.color }}>
          Order #{orderId.slice(-8).toUpperCase()}
        </span>
      </div>
      <br />
      <button
        onClick={() => navigate("/orders")}
        style={{
          padding: "13px 32px", borderRadius: 16,
          background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white",
          border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 18px rgba(226,55,116,0.35)",
        }}
      >
        View My Orders
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAY BUTTON
// ─────────────────────────────────────────────────────────────────────────────

const PayButton = ({
  amount, method, loading, onPay,
}: { amount: number; method: string; loading: boolean; onPay: () => void }) => (
  <button
    className="pay-btn"
    disabled={loading}
    onClick={onPay}
    style={{
      width: "100%", padding: "17px 24px", borderRadius: 18,
      background: loading ? "#ccc" : "linear-gradient(135deg,#E23774 0%,#FF6B35 100%)",
      color: "white", border: "none",
      fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 6px 24px rgba(226,55,116,0.38)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      letterSpacing: "0.01em",
    }}
  >
    {loading ? (
      <>
        <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        Redirecting to {method}…
      </>
    ) : (
      <>
        <FiCreditCard size={18} />
        Pay ₹{amount} via {method === "razorpay" ? "Razorpay" : "Stripe"}
      </>
    )}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const navigate  = useNavigate();
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  const location  = useLocation();

  // Support both /checkout/:orderId (URL param) and /checkout (state from navigation)
  const stateOrder = (location.state as { order?: IOrder } | null)?.order;
  const orderId    = paramOrderId ?? stateOrder?._id;

  const [order,    setOrder]    = useState<IOrder | null>(stateOrder ?? null);
  const [loading,  setLoading]  = useState(!stateOrder);
  const [paying,   setPaying]   = useState(false);
  const [fetchErr, setFetchErr] = useState(false);
  const [expired,  setExpired]  = useState(false);

  // ── Fetch order if not passed via navigation state ──────────────────────
  useEffect(() => {
    if (stateOrder || !orderId) return;

    setLoading(true);
    fetch(`/api/order/details?orderId=${orderId}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.msg) setOrder(data.msg);
        else setFetchErr(true);
      })
      .catch(() => setFetchErr(true))
      .finally(() => setLoading(false));
  }, [orderId, stateOrder]);

  // ── Check if expired at mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!order) return;
    if (new Date(order.expiredAt).getTime() < Date.now()) {
      setExpired(true);
    }
  }, [order]);

  const handleExpire = useCallback(() => setExpired(true), []);

  // ── Payment handler ───────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      // ── Razorpay integration (uncomment & fill when you have the SDK) ──────
      // const { data } = await createPaymentOrder({ orderId: order._id, amount: order.bill.totalAmount });
      // const options: RazorpayOptions = {
      //   key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      //   amount:      data.amount,          // paise
      //   currency:    "INR",
      //   name:        order.restaurent.restaurent_name,
      //   description: `Order #${order._id.slice(-6).toUpperCase()}`,
      //   order_id:    data.id,
      //   prefill: {
      //     contact: order.user.userPhone,
      //   },
      //   handler: async (response) => {
      //     await verifyPayment({ ...response, orderId: order._id });
      //     navigate("/orders", { state: { justPaid: true } });
      //   },
      //   modal: { ondismiss: () => setPaying(false) },
      //   theme: { color: "#E23774" },
      // };
      // const rzp = new window.Razorpay(options);
      // rzp.open();

      // ── Placeholder: simulate redirect ────────────────────────────────────
      await new Promise(r => setTimeout(r, 1400));
      navigate("/orders");
    } catch {
      setPaying(false);
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (!orderId && !stateOrder) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GlobalStyles />
        <NonPendingState status="failed" orderId="unknown" />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
        <GlobalStyles />
        <CheckoutSkeleton />
      </div>
    );
  }

  if (fetchErr || !order) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
        <GlobalStyles />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#1A0A00", marginBottom: 10 }}>Order not found</h2>
          <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>We couldn't load this order. It may have been deleted or the link is invalid.</p>
          <button onClick={() => navigate("/orders")} style={{ padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
        <GlobalStyles />
        <NonPendingState status="expired" orderId={order._id} />
      </div>
    );
  }

  if (order.payment.status === "paid") {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
        <GlobalStyles />
        <NonPendingState status="paid" orderId={order._id} />
      </div>
    );
  }

  if (order.payment.status === "failed") {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
        <GlobalStyles />
        <NonPendingState status="failed" orderId={order._id} />
      </div>
    );
  }

  // ── HAPPY PATH: payment.status === "pending" ──────────────────────────────

  const dateStr = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0", fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* ── Dark hero header ── */}
      <div style={{
        position: "relative",
        background: "linear-gradient(160deg,#2A0A14 0%,#1A0A00 55%,#0C0806 100%)",
        overflow: "hidden",
      }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -70, right: -50, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.18),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.10),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 580, margin: "0 auto", padding: "100px 24px 48px" }}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,248,240,0.09)", border: "1px solid rgba(226,55,116,0.25)",
              color: "rgba(254,243,199,0.7)", borderRadius: 12, padding: "7px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 20,
            }}
          >
            <FiArrowLeft size={13} /> Back
          </button>

          <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(226,55,116,0.65)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            Secure Checkout
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, color: "#FEF3C7", lineHeight: 1.05, marginBottom: 6 }}>
            Complete Payment
          </h1>
          <p style={{ fontSize: 12, color: "rgba(254,243,199,0.4)" }}>
            Order #{order._id.slice(-8).toUpperCase()} · {dateStr}
          </p>
        </div>

        {/* Scalloped bottom — same as OrdersPage */}
        <svg viewBox="0 0 1440 40" style={{ display: "block", width: "100%", marginBottom: -1 }} preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="#FFF8F0" />
        </svg>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* ── Timer ── */}
        <div style={{ marginBottom: 20 }}>
          <PaymentTimer expiredAt={order.expiredAt} onExpire={handleExpire} />
        </div>

        {/* ── Payment method ── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Payment Method</SectionLabel>
          <PaymentMethodBadge method={order.payment.method} />
        </div>

        {/* ── Order summary ── */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Order Summary</SectionLabel>
          <OrderSummaryCard order={order} />
        </div>

        {/* ── Security note ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 16px", borderRadius: 14,
          background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
          marginBottom: 22, animation: "fadeUp 0.35s ease 0.15s both",
        }}>
          <FiInfo size={13} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>
            Your payment is encrypted end-to-end. We never store your card details. 
            You'll be redirected to <strong style={{ color: "#1A0A00" }}>{order.payment.method === "razorpay" ? "Razorpay" : "Stripe"}</strong> to complete the transaction securely.
          </p>
        </div>

        {/* ── Pay button ── */}
        <div style={{ animation: "fadeUp 0.35s ease 0.2s both" }}>
          <PayButton
            amount={order.bill.totalAmount}
            method={order.payment.method}
            loading={paying}
            onPay={handlePay}
          />
        </div>

        {/* ── Trust badges ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 20,
          marginTop: 18, flexWrap: "wrap",
        }}>
          {[
            { icon: "🔒", label: "256-bit SSL" },
            { icon: "🛡️", label: "Fraud protection" },
            { icon: "↩️",  label: "Instant refunds" },
          ].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13 }}>{b.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#bbb" }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Order ID footer */}
        <p style={{ textAlign: "center", fontSize: 10, color: "#d4d4d4", marginTop: 24 }}>
          Order ID: {order._id}
        </p>
      </div>
    </div>
  );
};

export default Checkout;