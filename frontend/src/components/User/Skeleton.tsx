// src/components/Skeletons.tsx
// Used by: Home (CardSkeleton, RowSkeleton), Menu (CatSkeleton, RowSkeleton)
// ─────────────────────────────────────────────────────────────────────────────

/** Restaurant strip card skeleton — used in Home's horizontal scroll */
export const CardSkeleton = () => (
  <div style={{ flexShrink: 0, width: 260, borderRadius: 24, overflow: "hidden", border: "1.5px solid rgba(226,55,116,0.07)", background: "white" }}>
    <div className="s-skel" style={{ height: 140 }} />
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="s-skel" style={{ height: 16, width: "60%" }} />
      <div className="s-skel" style={{ height: 12, width: "35%" }} />
      <div className="s-skel" style={{ height: 12, width: "80%" }} />
    </div>
  </div>
);

/** Item list-row skeleton — used in Home (all dishes) and Menu (list view) */
export const RowSkeleton = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "white", borderRadius: 16, border: "1.5px solid rgba(226,55,116,0.07)" }}>
    <div className="s-skel" style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="s-skel" style={{ height: 14, width: "55%" }} />
      <div className="s-skel" style={{ height: 11, width: "35%" }} />
    </div>
    <div className="s-skel" style={{ width: 60, height: 30, borderRadius: 12, flexShrink: 0 }} />
  </div>
);

/** Category accordion skeleton — used in Menu only */
export const CatSkeleton = () => (
  <div style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.07)", borderRadius: 18, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
    <div className="s-skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
    <div className="s-skel" style={{ height: 16, width: "40%" }} />
  </div>
);