export const CartLoading = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80 }}>
    <span style={{
      width: 32, height: 32, borderRadius: "50%",
      border: "2.5px solid #E23774", borderTopColor: "transparent",
      animation: "spin 0.7s linear infinite", display: "block", marginBottom: 12,
    }} />
    <p style={{ fontSize: 13, color: "#aaa" }}>Loading your cart…</p>
  </div>
);