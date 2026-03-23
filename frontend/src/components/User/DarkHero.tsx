export const DarkHero = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    position: "relative",
    background: "linear-gradient(160deg,#2A0A14 0%,#1A0A00 55%,#0C0806 100%)",
    overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(226,55,116,0.2),transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -100, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,0.13),transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.028, pointerEvents: "none" }} />
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);