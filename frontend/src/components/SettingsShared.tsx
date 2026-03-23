
// All reusable primitives shared between Restaurant Settings and User Settings.
// Import from here — never duplicate these in individual pages.
//
// FIX: PageShell now uses paddingTop: 136px (120px fixed navbar + 16px gap)
// so content is never hidden behind the two-row navbar.

import React from "react";
import { FiSave, FiToggleLeft, FiToggleRight } from "react-icons/fi";

// ── styles ────────────────────────────────────────────────────────────────────

export const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid rgba(226,55,116,0.15)",
  background: "white",
  fontFamily: "'DM Sans',sans-serif",
  fontSize: 14,
  color: "#1A0A00",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#E23774",
  marginBottom: 6,
};

// ── PageShell ─────────────────────────────────────────────────────────────────
// paddingTop: 136px = 120px (fixed navbar height) + 16px breathing room.
// The Navbar is fixed and two-row tall:
//   row 1 → 64px  (logo + links + avatar)
//   row 2 → ~56px (search bar + location pill)
//   total → 120px  confirmed by Navbar's own spacer <div style={{ height: 120 }} />

export const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen"
    style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}
  >
    {/* decorative gradient strip */}
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        style={{
          position: "absolute", top: 0, right: 0,
          width: "40%", height: "100%",
          opacity: 0.04,
          background: "linear-gradient(135deg,#E23774,#FF6B35)",
          clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)",
        }}
      />
    </div>

    {/*
      pt-[136px] pushes content below the fixed 120px navbar.
      pb-10 gives breathing room at the bottom.
      px-4 / md:px-10 matches the rest of the app's horizontal rhythm.
    */}
    <div
      className="relative px-4 md:px-10 pb-10 max-w-5xl mx-auto"
      style={{ zIndex: 1, paddingTop: 136 }}
    >
      {children}
    </div>

    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  </div>
);

// ── PageHeader ────────────────────────────────────────────────────────────────

export const PageHeader = ({
  eyebrow, title, sub,
}: {
  eyebrow: string; title: string; sub: string;
}) => (
  <div className="mb-8">
    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E23774" }}>
      {eyebrow}
    </p>
    <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>
      {title}
    </h1>
    <p className="text-sm mt-1" style={{ color: "#aaa" }}>{sub}</p>
  </div>
);

// ── SectionCard ───────────────────────────────────────────────────────────────

export const SectionCard = ({
  title, sub, icon, children, delay = 0,
}: {
  title: string; sub?: string; icon: React.ReactNode;
  children: React.ReactNode; delay?: number;
}) => (
  <div
    className="rounded-2xl overflow-hidden mb-6"
    style={{
      background: "white",
      border: "1.5px solid rgba(226,55,116,0.08)",
      boxShadow: "0 4px 24px rgba(226,55,116,0.05)",
      animation: `fadeUp 0.4s ease ${delay}s both`,
    }
  }
  id="address"
  >
    <div className="flex items-start gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(226,55,116,0.08)", color: "#E23774" }}>
        {icon}
      </span>
      <div>
        <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{sub}</p>}
      </div>
    </div>
    <div className="px-6 pt-5 pb-6">{children}</div>
  </div>
);

// ── DangerZoneCard ────────────────────────────────────────────────────────────

export const DangerZoneCard = ({
  children, delay = 0,
}: {
  children: React.ReactNode; delay?: number;
}) => (
  <div
    className="rounded-2xl overflow-hidden mb-6"
    style={{
      background: "white",
      border: "1.5px solid rgba(239,68,68,0.15)",
      boxShadow: "0 4px 24px rgba(239,68,68,0.04)",
      animation: `fadeUp 0.4s ease ${delay}s both`,
    }}
  >
    <div className="flex items-start gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
        ⚠️
      </span>
      <div>
        <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Danger Zone</h2>
        <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>Irreversible actions — proceed with caution</p>
      </div>
    </div>
    <div className="px-6 py-5 flex flex-col gap-3">{children}</div>
  </div>
);

// ── DangerRow ─────────────────────────────────────────────────────────────────

export const DangerRow = ({
  label, sub, buttonLabel, onClick, loading = false, disabled = false, variant = "red",
}: {
  label: string; sub: string; buttonLabel: React.ReactNode;
  onClick?: () => void; loading?: boolean; disabled?: boolean;
  variant?: "red" | "amber" | "green";
}) => {
  const colors = {
    red:   { bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.15)",  text: "#ef4444", btnBorder: "rgba(239,68,68,0.25)" },
    amber: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  text: "#d97706", btnBorder: "rgba(245,158,11,0.3)" },
    green: { bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.2)",   text: "#16a34a", btnBorder: "rgba(34,197,94,0.3)" },
  }[variant];

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: colors.text }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{sub}</p>
      </div>
      <button
        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap ml-4"
        style={{
          background: "white", color: colors.text,
          border: `1.5px solid ${colors.btnBorder}`,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled || loading ? 0.5 : 1,
        }}
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading
          ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: colors.text, borderTopColor: "transparent" }} />
          : buttonLabel}
      </button>
    </div>
  );
};

// ── Field ─────────────────────────────────────────────────────────────────────

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <label style={labelBase}>{label}</label>
    {children}
  </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────

export const Toggle = ({
  value, onChange, label, sub,
}: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(226,55,116,0.05)" }}>
    <div>
      <p className="text-sm font-semibold" style={{ color: "#1A0A00" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{sub}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200"
      style={{
        background: value ? "rgba(34,197,94,0.10)" : "rgba(226,55,116,0.08)",
        color: value ? "#16a34a" : "#E23774",
        border: `1.5px solid ${value ? "rgba(34,197,94,0.2)" : "rgba(226,55,116,0.15)"}`,
        cursor: "pointer",
      }}
    >
      {value ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
      {value ? "On" : "Off"}
    </button>
  </div>
);

// ── SaveButton ────────────────────────────────────────────────────────────────

export const SaveButton = ({
  onClick, loading, label = "Save Changes",
}: {
  onClick: () => void; loading: boolean; label?: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold mt-2"
    style={{
      background: loading ? "#F0E0E8" : "linear-gradient(135deg,#E23774,#FF6B35)",
      color: loading ? "#E23774" : "white",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 4px 16px rgba(226,55,116,0.3)",
    }}
  >
    {loading
      ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E23774", borderTopColor: "transparent" }} />Saving…</>
      : <><FiSave size={14} /> {label}</>}
  </button>
);

// ── AvatarUpload ──────────────────────────────────────────────────────────────

export const AvatarUpload = ({
  preview, onFile, inputRef, placeholder,
}: {
  preview: string; onFile: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement>; placeholder?: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 mb-6">
    <div
      className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer"
      style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "3px solid rgba(226,55,116,0.15)" }}
      onClick={() => inputRef.current?.click()}
    >
      {preview
        ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        : placeholder ?? <span style={{ fontSize: 28, color: "white" }}>👤</span>}
    </div>
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mb-1.5"
        style={{ background: "rgba(226,55,116,0.08)", color: "#E23774", border: "1.5px solid rgba(226,55,116,0.15)", cursor: "pointer" }}
      >
        Change Photo
      </button>
      <p className="text-[11px]" style={{ color: "#ccc" }}>JPG or PNG, max 5 MB.</p>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0] ?? null)} />
    </div>
  </div>
);

// ── InfoBanner ────────────────────────────────────────────────────────────────

export const InfoBanner = ({
  icon, title, sub, variant = "amber",
}: {
  icon: React.ReactNode; title: string; sub?: string;
  variant?: "amber" | "green" | "red" | "pink";
}) => {
  const colors = {
    amber: { bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.25)", title: "#d97706", sub: "#a16207" },
    green: { bg: "rgba(34,197,94,0.06)",   border: "rgba(34,197,94,0.2)",   title: "#16a34a", sub: "#15803d" },
    red:   { bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.2)",   title: "#ef4444", sub: "#b91c1c" },
    pink:  { bg: "rgba(226,55,116,0.06)",  border: "rgba(226,55,116,0.2)",  title: "#E23774", sub: "#9d174d" },
  }[variant];

  return (
    <div className="rounded-2xl p-4 flex gap-3 mb-6"
      style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}>
      <span className="flex-shrink-0 mt-0.5" style={{ color: colors.title }}>{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: colors.title }}>{title}</p>
        {sub && <p className="text-xs leading-relaxed mt-0.5" style={{ color: colors.sub }}>{sub}</p>}
      </div>
    </div>
  );
};

// ── ConfirmModal ──────────────────────────────────────────────────────────────

export const ConfirmModal = ({
  open, title, message, confirmLabel, onConfirm, onCancel, loading = false, variant = "red",
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
  variant?: "red" | "amber";
}) => {
  if (!open) return null;
  const color = variant === "red" ? "#ef4444" : "#d97706";
  const bg    = variant === "red" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(26,10,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "white", borderRadius: 24, padding: 28,
        maxWidth: 400, width: "100%",
        border: `1.5px solid ${bg}`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        animation: "fadeUp 0.2s ease both",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
          {variant === "red" ? "🗑️" : "⚠️"}
        </div>
        <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#1A0A00", marginBottom: 8, letterSpacing: 0.5 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: "11px", borderRadius: 14, border: "1.5px solid rgba(226,55,116,0.15)", background: "transparent", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: 14, border: "none", background: color, color: "white", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading
              ? <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "white", borderTopColor: "transparent" }} />
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};