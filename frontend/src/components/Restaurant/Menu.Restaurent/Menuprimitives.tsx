import React from "react";
import type { ItemStatus } from "../../../types/menu.types";
import { STATUS_META, labelBase } from "../Menu.Restaurent/Menu.Constants";

// ── Veg / Non-veg dot ─────────────────────────────────────────────────────
export const VegDot = ({ isVeg }: { isVeg: boolean }) => (
  <span
    className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
    style={{ border: `2px solid ${isVeg ? "#16a34a" : "#ef4444"}` }}
  >
    <span
      className="w-2 h-2 rounded-full"
      style={{ background: isVeg ? "#16a34a" : "#ef4444" }}
    />
  </span>
);

// ── Status badge ──────────────────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const m = STATUS_META[status];
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
};

// ── Generic form field wrapper ────────────────────────────────────────────
export const Field = ({
  label,
  children,
  half,
}: {
  label: string;
  children: React.ReactNode;
  half?: boolean;
}) => (
  <div className={half ? "" : "col-span-2"} style={{ marginBottom: 4 }}>
    <label style={labelBase}>{label}</label>
    {children}
  </div>
);