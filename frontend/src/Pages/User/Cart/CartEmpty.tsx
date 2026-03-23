import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

export const CartEmpty = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 80, animation: "popIn 0.3s ease",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 28, marginBottom: 16,
        background: "rgba(226,55,116,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FiShoppingCart size={32} style={{ color: "rgba(226,55,116,0.3)" }} />
      </div>

      <p style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: 26,
        color: "#1A0A00", marginBottom: 6,
      }}>
        Cart is Empty
      </p>

      <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>
        Add some delicious items!
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 28px", borderRadius: 20, fontSize: 13, fontWeight: 700,
          color: "white", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#E23774,#FF6B35)",
          boxShadow: "0 4px 16px rgba(226,55,116,0.3)",
        }}
      >
        Browse Menu
      </button>
    </div>
  );
};