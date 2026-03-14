import { useState, useRef } from "react";
import { useRestaurant } from "../../Hooks/useRestaurant";
import toast from "react-hot-toast";
import {
  FiUser, FiMapPin, FiPhone, FiMail, FiImage, FiSave,
  FiToggleLeft, FiToggleRight, FiAlertCircle, FiCheckCircle,
  FiLock, FiBell, FiShield, FiTrash2, FiChevronRight,
} from "react-icons/fi";

// ── shared shell ──────────────────────────────────────────────────────────
const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'DM Sans', sans-serif" }}>
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", opacity: 0.04, background: "linear-gradient(135deg,#E23774,#FF6B35)", clipPath: "polygon(20% 0%,100% 0%,100% 100%,0% 100%)" }} />
    </div>
    <div className="relative px-4 md:px-10 py-8 max-w-5xl mx-auto" style={{ zIndex: 1 }}>
      {children}
    </div>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  </div>
);

// ── reusable field components ─────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "1.5px solid rgba(226,55,116,0.15)", background: "white",
  fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1A0A00",
  outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s",
};
const labelBase: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase" as const, color: "#E23774", marginBottom: 6,
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <label style={labelBase}>{label}</label>
    {children}
  </div>
);

const SectionCard = ({
  title, sub, icon, children, delay = 0,
}: {
  title: string; sub?: string; icon: React.ReactNode; children: React.ReactNode; delay?: number;
}) => (
  <div className="rounded-2xl overflow-hidden mb-6"
    style={{ background: "white", border: "1.5px solid rgba(226,55,116,0.08)", boxShadow: "0 4px 24px rgba(226,55,116,0.05)", animation: `fadeUp 0.4s ease ${delay}s both` }}>
    <div className="flex items-start gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(226,55,116,0.07)" }}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(226,55,116,0.08)", color: "#E23774" }}>
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

const Toggle = ({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(226,55,116,0.05)" }}>
    <div>
      <p className="text-sm font-semibold" style={{ color: "#1A0A00" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{sub}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200"
      style={{
        background: value ? "rgba(34,197,94,0.10)" : "rgba(226,55,116,0.08)",
        color: value ? "#16a34a" : "#E23774",
        border: `1.5px solid ${value ? "rgba(34,197,94,0.2)" : "rgba(226,55,116,0.15)"}`,
        cursor: "pointer",
      }}>
      {value ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
      {value ? "On" : "Off"}
    </button>
  </div>
);

const SaveButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button onClick={onClick} disabled={loading}
    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white mt-2"
    style={{
      background: loading ? "#F0E0E8" : "linear-gradient(135deg,#E23774,#FF6B35)",
      color: loading ? "#E23774" : "white",
      border: "none", cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 4px 16px rgba(226,55,116,0.3)",
    }}>
    {loading
      ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#E23774", borderTopColor: "transparent" }} />Saving…</>
      : <><FiSave size={14} /> Save Changes</>}
  </button>
);

// ── main component ─────────────────────────────────────────────────────────
const RestaurantSettings = () => {
  const { restaurantData } = useRestaurant();
  const r = restaurantData;
  const imageRef = useRef<HTMLInputElement>(null);

  // ── form state seeded from real data ──
  const [profile, setProfile] = useState({
    name:        r?.name        ?? "",
    email:       r?.email       ?? "",
    phone:       r?.phone       ?? "",
    description: r?.description ?? "",
    cusiene:     r?.cusiene     ?? "",
  });
  const [imagePreview, setImagePreview] = useState<string>(r?.image ?? "");
  const [imageFile,    setImageFile]    = useState<File | null>(null);

  const [location, setLocation] = useState({
    formatedAddress: r?.autoLocation?.formatedAddress ?? "",
    latitude:  r?.autoLocation?.coordinates?.[1] ? String(r.autoLocation.coordinates[1]) : "",
    longitude: r?.autoLocation?.coordinates?.[0] ? String(r.autoLocation.coordinates[0]) : "",
  });

  const [ops, setOps] = useState({
    isOpen:            r?.isOpen ?? false,
    autoAcceptOrders:  false,
    prepTime:          "25",
    minOrderAmount:    "100",
  });

  const [notifs, setNotifs] = useState({
    newOrderSound:  true,
    emailOnOrder:   false,
    smsOnOrder:     false,
    dailyReport:    false,
  });

  const [saving, setSaving] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async (section: string) => {
    setSaving(section);
    // TODO: wire to your API here
    await new Promise(r => setTimeout(r, 900));
    toast.success(`${section} saved!`);
    setSaving(null);
  };

  const CUISINE_OPTIONS = ["Indian","Chinese","Italian","Mexican","Japanese","Thai","American","Mediterranean","Korean"];

  return (
    <PageShell>
      {/* header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E23774" }}>Restaurant</p>
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00", letterSpacing: 1 }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#aaa" }}>Manage your restaurant profile, operations, and preferences</p>
      </div>

      {/* verification banner */}
      {!r?.isVerified && (
        <div className="rounded-2xl p-4 flex gap-3 mb-6"
          style={{ background: "rgba(245,158,11,0.06)", border: "1.5px solid rgba(245,158,11,0.2)" }}>
          <FiAlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#d97706" }}>Verification Pending</p>
            <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#a16207" }}>
              Your restaurant is under review. You can edit your profile while waiting — changes will apply once verified. Verification typically takes 24–48 hours.
            </p>
          </div>
        </div>
      )}

      {r?.isVerified && (
        <div className="rounded-2xl p-4 flex gap-3 mb-6"
          style={{ background: "rgba(34,197,94,0.06)", border: "1.5px solid rgba(34,197,94,0.2)" }}>
          <FiCheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
          <p className="text-sm" style={{ color: "#16a34a" }}>
            Your restaurant is <strong>verified</strong> and visible to customers.
          </p>
        </div>
      )}

      {/* ── 1. profile ── */}
      <SectionCard title="Restaurant Profile" sub="Basic info visible to customers" icon={<FiUser size={16} />} delay={0}>

        {/* photo */}
        <div className="mb-6">
          <label style={labelBase}>Restaurant Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)", border: "3px solid rgba(226,55,116,0.15)" }}
              onClick={() => imageRef.current?.click()}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                : <FiImage size={24} color="white" />}
            </div>
            <div>
              <button onClick={() => imageRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mb-1.5"
                style={{ background: "rgba(226,55,116,0.08)", color: "#E23774", border: "1.5px solid rgba(226,55,116,0.15)", cursor: "pointer" }}>
                <FiImage size={12} /> Change Photo
              </button>
              <p className="text-[11px]" style={{ color: "#ccc" }}>JPG or PNG, max 5MB. This is what customers see first.</p>
              <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleImageChange(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <Field label="Restaurant Name *">
            <input style={inputBase} value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="e.g. Spice Garden" />
          </Field>
          <Field label="Cuisine Type">
            <select style={{ ...inputBase, cursor: "pointer" }}
              value={profile.cusiene}
              onChange={e => setProfile(p => ({ ...p, cusiene: e.target.value }))}>
              <option value="">Select cuisine…</option>
              {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Email *">
            <input style={inputBase} type="email" value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="restaurant@email.com" />
          </Field>
          <Field label="Phone *">
            <input style={inputBase} value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="+91 98765 43210" />
          </Field>
        </div>

        <Field label="Description">
          <textarea style={{ ...inputBase, resize: "vertical", minHeight: 90 }}
            value={profile.description}
            onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
            onFocus={e => e.target.style.borderColor = "#E23774"}
            onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
            placeholder="Tell customers what makes your restaurant special…" />
        </Field>

        <SaveButton onClick={() => save("Profile")} loading={saving === "Profile"} />
      </SectionCard>

      {/* ── 2. location ── */}
      <SectionCard title="Location" sub="Your restaurant's address and coordinates" icon={<FiMapPin size={16} />} delay={0.07}>
        <Field label="Formatted Address">
          <textarea style={{ ...inputBase, resize: "vertical", minHeight: 80 }}
            value={location.formatedAddress}
            onChange={e => setLocation(l => ({ ...l, formatedAddress: e.target.value }))}
            onFocus={e => e.target.style.borderColor = "#E23774"}
            onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
            placeholder="Full address visible to customers…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input style={inputBase} value={location.latitude}
              onChange={e => setLocation(l => ({ ...l, latitude: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="28.6139" />
          </Field>
          <Field label="Longitude">
            <input style={inputBase} value={location.longitude}
              onChange={e => setLocation(l => ({ ...l, longitude: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="77.2090" />
          </Field>
        </div>
        <div className="rounded-xl p-3 flex items-start gap-2 mb-4"
          style={{ background: "rgba(226,55,116,0.04)", border: "1px solid rgba(226,55,116,0.1)" }}>
          <FiAlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#E23774" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#888" }}>
            Delivery time and charges are calculated automatically based on the customer's distance from these coordinates.
          </p>
        </div>
        <SaveButton onClick={() => save("Location")} loading={saving === "Location"} />
      </SectionCard>

      {/* ── 3. operations ── */}
      <SectionCard title="Operations" sub="Control how your restaurant accepts and handles orders" icon={<FiShield size={16} />} delay={0.14}>
        <Toggle value={ops.isOpen} onChange={v => setOps(o => ({ ...o, isOpen: v }))}
          label="Restaurant Open" sub="Customers can place orders when this is on" />
        <Toggle value={ops.autoAcceptOrders} onChange={v => setOps(o => ({ ...o, autoAcceptOrders: v }))}
          label="Auto-Accept Orders" sub="Automatically confirm incoming orders without manual review" />

        <div className="grid grid-cols-2 gap-4 mt-5">
          <Field label="Average Prep Time (mins)">
            <input style={inputBase} type="number" min="1" value={ops.prepTime}
              onChange={e => setOps(o => ({ ...o, prepTime: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="25" />
          </Field>
          <Field label="Minimum Order Amount (₹)">
            <input style={inputBase} type="number" min="0" value={ops.minOrderAmount}
              onChange={e => setOps(o => ({ ...o, minOrderAmount: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#E23774"}
              onBlur={e => e.target.style.borderColor = "rgba(226,55,116,0.15)"}
              placeholder="100" />
          </Field>
        </div>
        <SaveButton onClick={() => save("Operations")} loading={saving === "Operations"} />
      </SectionCard>

      {/* ── 4. notifications ── */}
      <SectionCard title="Notifications" sub="Choose how you want to be alerted about activity" icon={<FiBell size={16} />} delay={0.21}>
        <Toggle value={notifs.newOrderSound} onChange={v => setNotifs(n => ({ ...n, newOrderSound: v }))}
          label="New Order Sound Alert" sub="Play a sound when a new order comes in" />
        <Toggle value={notifs.emailOnOrder} onChange={v => setNotifs(n => ({ ...n, emailOnOrder: v }))}
          label="Email on New Order" sub={`Send an email to ${profile.email || "your email"}`} />
        <Toggle value={notifs.smsOnOrder} onChange={v => setNotifs(n => ({ ...n, smsOnOrder: v }))}
          label="SMS on New Order" sub={`Send an SMS to ${profile.phone || "your phone"}`} />
        <Toggle value={notifs.dailyReport} onChange={v => setNotifs(n => ({ ...n, dailyReport: v }))}
          label="Daily Summary Report" sub="Get a daily email with your key metrics" />
        <SaveButton onClick={() => save("Notifications")} loading={saving === "Notifications"} />
      </SectionCard>

      {/* ── 5. danger zone ── */}
      <div className="rounded-2xl overflow-hidden mb-6"
        style={{ background: "white", border: "1.5px solid rgba(239,68,68,0.15)", boxShadow: "0 4px 24px rgba(239,68,68,0.04)", animation: "fadeUp 0.4s ease 0.28s both" }}>
        <div className="flex items-start gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
            <FiTrash2 size={16} />
          </span>
          <div>
            <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Bebas Neue',sans-serif", color: "#1A0A00" }}>Danger Zone</h2>
            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {[
            { label: "Pause Restaurant",        sub: "Temporarily hide from customers without deleting",         color: "#d97706", bg: "rgba(245,158,11,0.08)" },
            { label: "Delete All Menu Items",   sub: "Permanently remove your entire menu",                      color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
            { label: "Delete Restaurant",       sub: "Permanently delete your restaurant and all its data",      color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
          ].map(action => (
            <div key={action.label} className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: action.bg, border: `1px solid ${action.color}22` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: action.color }}>{action.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{action.sub}</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl"
                style={{ background: "white", color: action.color, border: `1.5px solid ${action.color}33`, cursor: "pointer" }}
                onClick={() => toast.error("Confirm this action in a dialog — wire up a confirmation modal here")}>
                <FiChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default RestaurantSettings;