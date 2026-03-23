import { FiAlertCircle, FiCheck, FiClock, FiPackage, FiTruck } from "react-icons/fi";

export const STEPS: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

// ── Global Styles ──────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: JSX.Element; step: number }> = {
  pending:           { label: "Pending",           color: "#d97706", bg: "rgba(245,158,11,0.1)",  icon: <FiClock size={13} />,     step: 0 },
  confirmed:         { label: "Confirmed",         color: "#2563eb", bg: "rgba(37,99,235,0.1)",   icon: <FiCheck size={13} />,     step: 1 },
  preparing:         { label: "Preparing",         color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  icon: <FiPackage size={13} />,   step: 2 },
  out_for_delivery:  { label: "Out for Delivery",  color: "#E23774", bg: "rgba(226,55,116,0.1)",  icon: <FiTruck size={13} />,     step: 3 },
  delivered:         { label: "Delivered",         color: "#16a34a", bg: "rgba(34,197,94,0.1)",   icon: <FiCheck size={13} />,     step: 4 },
  cancelled:         { label: "Cancelled",         color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: <FiAlertCircle size={13} />, step: -1 },
};

export const OrderProgress = ({ status }: { status: OrderStatus }) => {
  if (status === "cancelled") return null;
  const currentStep = STATUS_META[status].step;

  return (
    <div className="flex items-center gap-0 my-4 overflow-x-auto">
      {STEPS.map((s, i) => {
        const meta = STATUS_META[s];
        const done = i <= currentStep;
        const active = i === currentStep;

        return (
          <div key={s} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: done ? "linear-gradient(135deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.1)",
                  color: done ? "white" : "#ccc",
                  boxShadow: active ? "0 0 0 3px rgba(226,55,116,0.2)" : "none",
                  transition: "all 0.3s ease",
                }}>
                {done ? <FiCheck size={12} /> : <span style={{ color: "#ccc" }}>{i + 1}</span>}
              </div>
              <span className="text-[9px] font-semibold mt-1 text-center whitespace-nowrap"
                style={{ color: done ? "#E23774" : "#ccc", maxWidth: 60 }}>
                {meta.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mx-1 rounded-full"
                style={{ background: i < currentStep ? "linear-gradient(90deg,#E23774,#FF6B35)" : "rgba(226,55,116,0.1)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};