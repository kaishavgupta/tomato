// src/pages/Cart/PaymentMethod.tsx
// When closed: section header stays fully coloured. Only the COD/Online
// buttons are disabled and their colours muted.
import { FiCreditCard } from "react-icons/fi";
import { SiRazorpay } from "react-icons/si";
import { FaStripe } from "react-icons/fa6";

interface PaymentMethodProps {
  paymentMethod: "razorpay" | "strip";
  setPaymentMethod: (method: "razorpay" | "strip") => void;
}

export const PaymentMethod = ({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodProps) => (
  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      border: "1.5px solid rgba(226,55,116,0.08)",
      boxShadow: "0 2px 12px rgba(226,55,116,0.05)",
    }}
  >
    {/* Header — always full colour */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 10,
      }}
    >
      <FiCreditCard size={14} style={{ color: "#E23774" }} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#E23774",
        }}
      >
        Payment Method
      </span>
    </div>

    {/* Buttons — always enabled; ordering is blocked at PlaceOrderButton level */}
    <div style={{ display: "flex", gap: 12 }}>
      {(["razorpay", "stripe"] as const).map((method) => {
        const isActive = paymentMethod === method;

        return (
          <button
            key={method}
            onClick={() => setPaymentMethod(method)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 0",
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",

              background: isActive
                ? "linear-gradient(135deg,#E23774,#FF6B35)"
                : "white",

              color: isActive ? "#fff" : "#444",

              border: isActive ? "none" : "1.5px solid rgba(0,0,0,0.08)",

              boxShadow: isActive
                ? "0 6px 18px rgba(226,55,116,0.25)"
                : "0 2px 6px rgba(0,0,0,0.04)",

              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {method === "razorpay" ? (
              <>
                <SiRazorpay size={16} />
                Razorpay
              </>
            ) : (
              <>
                <FaStripe size={40} />
                
              </>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
