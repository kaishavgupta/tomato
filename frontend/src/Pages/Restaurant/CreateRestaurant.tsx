// src/pages/Restaurant/CreateRestaurant.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Step 2 (Location) now uses a Leaflet map picker instead of raw lat/lng inputs.
// • Map auto-locates to user's GPS on arrival at step 2
// • Click anywhere on map → pin drops, reverse-geocode fills address
// • "Use my location" button re-locates
// • Manual lat/lng fields still available below as fallback
// All other steps (Details, Review) and all existing logic unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useRestaurant } from "../../Hooks/useRestaurant";
import { useUserLocation } from "../../Hooks/useUserLocation";
import {
  MapContainer, TileLayer, Marker,
  useMapEvents, useMap,
} from "react-leaflet";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader } from "react-icons/bi";
import { FiMapPin } from "react-icons/fi";

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface FormState {
  name: string;
  email: string;
  phone: string;
  description: string;
  image: File | null;
  imagePreview: string;
  latitude: string;
  longitude: string;
  formatedAddress: string;
}

// ─── styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 14,
  border: "1.5px solid #F0E0E8",
  background: "white",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "#1A0A00",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#E23774",
  marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif",
};

const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = "#E23774");
const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = "#F0E0E8");

// ─── Map sub-components ───────────────────────────────────────────────────────

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

// Click-to-pin
const LocationPicker = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// "Use my location" + auto-locate on first mount
const LocateMeButton = ({
  onLocate,
  autoOnMount,
}: {
  onLocate: (lat: number, lng: number) => void;
  autoOnMount?: boolean;
}) => {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  // Auto-locate when map first renders (step 2 arrival)
  useEffect(() => {
    if (!autoOnMount || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => {} // silent — user can click button
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  return (
    <button
      onClick={locate}
      style={{
        position: "absolute", top: 12, right: 12, zIndex: 1000,
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 14px", borderRadius: 12,
        background: "white", border: "1.5px solid rgba(226,55,116,0.25)",
        color: "#E23774", fontSize: 12, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 2px 10px rgba(226,55,116,0.15)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {loading
        ? <BiLoader size={14} style={{ animation: "spin 0.7s linear infinite" }} />
        : <LuLocateFixed size={14} />}
      Use my location
    </button>
  );
};

// ─── component ────────────────────────────────────────────────────────────────

const CreateRestaurant = () => {
  const { createMutation, isRestaurantExist, isLoading } = useRestaurant();
  const { locationData } = useUserLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRestaurantExist) {
      navigate("/restaurant", { replace: true });
    }
  }, [isRestaurantExist, navigate]);

  const [step, setStep] = useState<Step>(1);
  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", description: "",
    image: null, imagePreview: "",
    latitude: "", longitude: "", formatedAddress: "",
  });

  // ── map state (step 2) ────────────────────────────────────────────────────
  const [mapLat,    setMapLat]    = useState<number | null>(null);
  const [mapLng,    setMapLng]    = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const set = (key: keyof FormState, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleImage = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => set("imagePreview", e.target?.result as string);
    reader.readAsDataURL(file);
    set("image", file);
  };

  // Reverse-geocode and sync form fields
  const handleMapPick = async (lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    set("latitude",  String(lat));
    set("longitude", String(lng));
    setGeocoding(true);
    try {
      const res  = await fetch(`${NOMINATIM}?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.display_name ?? "";
      set("formatedAddress", addr);
    } catch {
      // silently ignore — user can type manually
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("name",            form.name);
    fd.append("email",           form.email);
    fd.append("phone",           form.phone);
    fd.append("description",     form.description);
    fd.append("latitude",        form.latitude);
    fd.append("longitude",       form.longitude);
    fd.append("formatedAddress", form.formatedAddress);
    if (form.image) fd.append("file", form.image);
    createMutation.mutate(fd);
  };

  const submitting = createMutation.isPending;

  if (isLoading && !createMutation.isSuccess) return null;
  if (isRestaurantExist && !createMutation.isPending) {
    return <Navigate to="/restaurant" replace />;
  }

  const mapCenter: [number, number] = [
    mapLat ?? 28.6139,
    mapLng ?? 77.209,
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFF8F0",
      fontFamily: "'DM Sans', sans-serif",
      padding: "40px 16px 80px",
    }}>
      {/* bg blobs — unchanged */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", opacity: 0.06, background: "linear-gradient(135deg,#E23774,#FF6B35)", clipPath: "polygon(18% 0%,100% 0%,100% 100%,0% 100%)" }} />
        <div style={{ position: "absolute", borderRadius: "50%", opacity: 0.06, width: 280, height: 280, top: -80, left: -60, background: "#E23774" }} />
        <div style={{ position: "absolute", borderRadius: "50%", opacity: 0.06, width: 160, height: 160, bottom: 40, right: 60, background: "#FF6B35" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>

        {/* header — unchanged */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#E23774", letterSpacing: 4, margin: "0 0 4px" }}>Tomato</p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: "#1A0A00", margin: "0 0 8px", lineHeight: 1, letterSpacing: 1 }}>
            Open Your<br />Restaurant
          </h1>
          <p style={{ color: "#aaa", fontSize: 14 }}>
            Delivery time & charges are calculated automatically at order time.
          </p>
        </div>

        {/* stepper — unchanged */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
          {([
            { num: 1, label: "Details",  icon: "🏪" },
            { num: 2, label: "Location", icon: "📍" },
            { num: 3, label: "Review",   icon: "✅" },
          ] as { num: Step; label: string; icon: string }[]).map((s, i, arr) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: s.num < step ? "pointer" : "default" }}
                onClick={() => s.num < step && setStep(s.num)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: step === s.num ? "linear-gradient(135deg,#E23774,#FF6B35)" : step > s.num ? "#FFF0F5" : "white",
                  border: step === s.num ? "none" : `2px solid ${step > s.num ? "#E23774" : "#F0E0E8"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: step > s.num ? 15 : 18, fontWeight: 700, color: step > s.num ? "#E23774" : "inherit",
                  boxShadow: step === s.num ? "0 8px 24px rgba(226,55,116,0.25)" : "none",
                  transition: "all 0.3s",
                }}>
                  {step > s.num ? "✓" : s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: step === s.num ? "#E23774" : "#bbb" }}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 60, height: 2, margin: "0 8px", marginBottom: 20, borderRadius: 2, transition: "background 0.3s", background: step > s.num ? "linear-gradient(90deg,#E23774,#FF6B35)" : "#F0E0E8" }} />
              )}
            </div>
          ))}
        </div>

        {/* card */}
        <div style={{ background: "white", borderRadius: 28, padding: 36, boxShadow: "0 8px 48px rgba(226,55,116,0.08)", border: "1.5px solid #FDE8F0" }}>

          {/* ── step 1: details — unchanged ── */}
          {step === 1 && (
            <div>
              <SectionTitle>Restaurant details</SectionTitle>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Restaurant photo *</label>
                <div
                  onClick={() => imageRef.current?.click()}
                  style={{ width: "100%", height: 160, borderRadius: 16, border: "2px dashed #F0C0D0", background: form.imagePreview ? "transparent" : "#FFF8F0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                >
                  {form.imagePreview
                    ? <img src={form.imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
                        <p style={{ color: "#ccc", fontSize: 13, margin: 0 }}>Click to upload restaurant photo</p>
                        <p style={{ color: "#ddd", fontSize: 11, margin: "4px 0 0" }}>This is the first thing customers see</p>
                      </div>
                  }
                </div>
                <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleImage(e.target.files?.[0] || null)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Restaurant name *</label>
                <input style={inputStyle} placeholder="e.g. Spice Garden"
                  value={form.name} onChange={(e) => set("name", e.target.value)}
                  onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="restaurant@email.com"
                    value={form.email} onChange={(e) => set("email", e.target.value)}
                    onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input style={inputStyle} placeholder="+91 98765 43210"
                    value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Description{" "}
                  <span style={{ color: "#ddd", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
                </label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  placeholder="Tell customers what makes your restaurant special..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  onFocus={focus} onBlur={blur}
                />
              </div>
            </div>
          )}

          {/* ── step 2: location — MAP PICKER ── */}
          {step === 2 && (
            <div>
              <SectionTitle>Restaurant location</SectionTitle>

              {/* Leaflet map */}
              <div style={{
                position: "relative", borderRadius: 18, overflow: "hidden",
                height: 320, marginBottom: 16,
                border: "1.5px solid rgba(226,55,116,0.18)",
                boxShadow: "0 4px 20px rgba(226,55,116,0.08)",
              }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapLat ? 15 : 12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationPicker onPick={handleMapPick} />
                  {/* ✅ Auto-locate on step 2 arrival */}
                  <LocateMeButton onLocate={handleMapPick} autoOnMount={!mapLat} />
                  {mapLat !== null && mapLng !== null && (
                    <Marker position={[mapLat, mapLng]} />
                  )}
                </MapContainer>
              </div>

              {/* hint */}
              <p style={{ fontSize: 12, color: "#bbb", marginBottom: 14, textAlign: "center" }}>
                📍 Tap anywhere on the map to pin your restaurant location
              </p>

              {/* Geocoded address preview */}
              {(form.formatedAddress || geocoding) && (
                <div style={{
                  padding: "10px 14px", borderRadius: 12, marginBottom: 16,
                  background: "rgba(226,55,116,0.04)",
                  border: "1px solid rgba(226,55,116,0.15)",
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <FiMapPin size={14} style={{ color: "#E23774", marginTop: 2, flexShrink: 0 }} />
                  {geocoding
                    ? <span style={{ fontSize: 12, color: "#aaa" }}>Detecting address…</span>
                    : <span style={{ fontSize: 12, color: "#1A0A00", lineHeight: 1.5 }}>{form.formatedAddress}</span>}
                </div>
              )}

              <Divider label="or adjust manually" />

              {/* Manual lat/lon overrides */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input style={inputStyle} placeholder="e.g. 28.6139"
                    value={form.latitude}
                    onChange={(e) => {
                      set("latitude", e.target.value);
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setMapLat(v);
                    }}
                    onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input style={inputStyle} placeholder="e.g. 77.2090"
                    value={form.longitude}
                    onChange={(e) => {
                      set("longitude", e.target.value);
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setMapLng(v);
                    }}
                    onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Formatted address</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  placeholder="Full address visible to customers..."
                  value={form.formatedAddress}
                  onChange={(e) => set("formatedAddress", e.target.value)}
                  onFocus={focus} onBlur={blur}
                />
              </div>

              <InfoPill
                icon="⚡"
                title="Delivery handled automatically"
                body="Time & charges are calculated at order time based on customer ↔ restaurant distance."
              />
            </div>
          )}

          {/* ── step 3: review — unchanged ── */}
          {step === 3 && (
            <div>
              <SectionTitle>Review & submit</SectionTitle>

              <div style={{ borderRadius: 20, overflow: "hidden", border: "1.5px solid #FDE8F0", marginBottom: 24 }}>
                <div style={{ height: 120, background: form.imagePreview ? "transparent" : "linear-gradient(135deg,#E23774,#FF6B35)", overflow: "hidden" }}>
                  {form.imagePreview && <img src={form.imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ padding: "20px 24px", background: "white" }}>
                  <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#1A0A00", margin: "0 0 4px", letterSpacing: 1 }}>
                    {form.name || "Restaurant Name"}
                  </h3>
                  {form.description && (
                    <p style={{ color: "#888", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{form.description}</p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { icon: "📧", val: form.email },
                      { icon: "📞", val: form.phone },
                      { icon: "📍", val: form.formatedAddress ? form.formatedAddress.slice(0, 70) + (form.formatedAddress.length > 70 ? "…" : "") : "—" },
                    ].map(({ icon, val }) => val && (
                      <div key={icon} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 13 }}>{icon}</span>
                        <span style={{ fontSize: 12, color: "#888" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[["Latitude", form.latitude || "—"], ["Longitude", form.longitude || "—"]].map(([k, v]) => (
                  <div key={k} style={{ background: "#FFF8F0", borderRadius: 12, padding: "12px 16px" }}>
                    <p style={{ fontSize: 11, color: "#E23774", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>{k}</p>
                    <p style={{ fontSize: 14, color: "#444", margin: 0, fontWeight: 500 }}>{v}</p>
                  </div>
                ))}
              </div>

              <InfoPill
                icon="⚡"
                title="Delivery handled automatically"
                body="Time & charges are calculated at order time based on customer ↔ restaurant distance."
              />
            </div>
          )}

          {/* nav buttons — unchanged */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
            <button
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              style={{ padding: "12px 28px", borderRadius: 14, border: "1.5px solid #F0E0E8", background: "white", color: step > 1 ? "#888" : "#ddd", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 2, cursor: step > 1 ? "pointer" : "not-allowed", opacity: step > 1 ? 1 : 0.4 }}
            >
              ← Back
            </button>

            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ width: n === step ? 20 : 7, height: 7, borderRadius: 4, transition: "all 0.3s", background: n === step ? "linear-gradient(90deg,#E23774,#FF6B35)" : n < step ? "#F4B0C8" : "#F0E0E8" }} />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={() => setStep((step + 1) as Step)}
                style={{ padding: "12px 32px", borderRadius: 14, background: "linear-gradient(135deg,#E23774,#FF6B35)", color: "white", border: "none", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, cursor: "pointer", boxShadow: "0 8px 24px rgba(226,55,116,0.3)" }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: "12px 32px", borderRadius: 14, background: submitting ? "#F0E0E8" : "linear-gradient(135deg,#E23774,#FF6B35)", color: submitting ? "#E23774" : "white", border: "none", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 8px 24px rgba(226,55,116,0.3)", minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #E23774", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Submitting...
                  </>
                ) : "Submit →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ─── small shared pieces — unchanged ─────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#1A0A00", margin: 0, letterSpacing: 1 }}>{children}</h2>
    <div style={{ width: 40, height: 3, background: "linear-gradient(90deg,#E23774,#FF6B35)", borderRadius: 2, marginTop: 6 }} />
  </div>
);

const Divider = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
    <div style={{ flex: 1, height: 1, background: "#F0E0E8" }} />
    <span style={{ fontSize: 12, color: "#ccc" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: "#F0E0E8" }} />
  </div>
);

const InfoPill = ({ icon, title, body }: { icon: string; title: string; body: string }) => (
  <div style={{ padding: "14px 18px", borderRadius: 14, background: "linear-gradient(135deg,rgba(226,55,116,0.06),rgba(255,107,53,0.06))", border: "1px solid #FDE8F0", display: "flex", gap: 10, alignItems: "flex-start" }}>
    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#E23774", margin: "0 0 2px" }}>{title}</p>
      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{body}</p>
    </div>
  </div>
);

export default CreateRestaurant;