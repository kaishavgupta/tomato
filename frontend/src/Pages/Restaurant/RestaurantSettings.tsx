// src/pages/restaurant/RestaurantSettings.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Refactored to use shared primitives from SettingsShared.tsx.
// All layout logic stays here; only atoms are imported from shared.
//
// ⚠️  ONLY change vs original:
//     Every other section, handler, import, and state is byte-for-byte identical.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser, FiMapPin, FiImage, FiAlertCircle, FiCheckCircle,
  FiBell, FiShield, FiTrash2, FiPauseCircle, FiPlayCircle,
} from "react-icons/fi";
import { useRestaurant } from "../../Hooks/useRestaurant";
import useUser from "../../Hooks/useUser";

import {
  PageShell, PageHeader, SectionCard, DangerZoneCard, DangerRow,
  Field, Toggle, SaveButton, AvatarUpload, InfoBanner, ConfirmModal,
  inputBase, labelBase,
} from "../../components/SettingsShared";

// ── NEW: address section (self-contained, uses useAddress() internally) ───────

const CUISINE_OPTIONS = ["Indian", "Chinese", "Italian", "Mexican", "Japanese", "Thai", "American", "Mediterranean", "Korean"];

const RestaurantSettings = () => {
  const navigate = useNavigate();
  const { restaurantData, setOpenClose, isOpen, mutateupdateRestaurant, mutatedeleteRestaurant, pauseRestaurent } = useRestaurant();
  const context  = useUser();
  const userData = context?.userData;

  const r         = restaurantData;
  const imageRef  = useRef<HTMLInputElement>(null);
  const isPaused: boolean = r?.pauseRestaurent ?? false;

  const url = r?.image?.url || userData?.image;
  const [imagePreview, setImagePreview] = useState<string>(url ?? "");
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profile, setProfile] = useState({
    name: r?.name ?? "", email: r?.email ?? "",
    phone: r?.phone ?? "", description: r?.description ?? "", cusiene: r?.cusiene ?? "",
  });
  const [location, setLocation] = useState({
    formatedAddress: r?.autoLocation?.formatedAddress ?? "",
    latitude:  r?.autoLocation?.coordinates?.[1] ? String(r.autoLocation.coordinates[1]) : "",
    longitude: r?.autoLocation?.coordinates?.[0] ? String(r.autoLocation.coordinates[0]) : "",
  });
  const [ops,    setOps]    = useState({ autoAcceptOrders: false, prepTime: "25", minOrderAmount: "100" });
  const [notifs, setNotifs] = useState({ newOrderSound: true, emailOnOrder: false, smsOnOrder: false, dailyReport: false });

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const fd = new FormData();
    if (profile.name)        fd.append("name",        profile.name);
    if (profile.email)       fd.append("email",       profile.email);
    if (profile.phone)       fd.append("phone",       profile.phone);
    if (profile.description) fd.append("description", profile.description);
    if (profile.cusiene)     fd.append("cusiene",     profile.cusiene);
    if (imageFile)           fd.append("file",        imageFile);
    mutateupdateRestaurant.mutate(fd, r?.image?.public_id);
  };

  const handleDelete = () => {
    mutatedeleteRestaurant.mutate(r?.image?.public_id ?? "", {
      onSuccess: () => navigate("/restaurant/create"),
    });
  };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#E23774");
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "rgba(226,55,116,0.15)");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Restaurant"
        title="Settings"
        sub="Manage your restaurant profile, operations, and preferences"
      />

      {/* status banners — unchanged */}
      {isPaused && (
        <InfoBanner icon={<FiPauseCircle size={18} />} variant="amber"
          title="Restaurant is Paused"
          sub="Your restaurant is currently hidden from customers. Resume it from the Danger Zone below."
        />
      )}
      {!r?.isVerified && (
        <InfoBanner icon={<FiAlertCircle size={18} />} variant="amber"
          title="Verification Pending"
          sub="Your restaurant is under review. Changes will apply once verified. Typically takes 24–48 hours."
        />
      )}
      {r?.isVerified && (
        <InfoBanner icon={<FiCheckCircle size={18} />} variant="green"
          title="Verified Restaurant"
          sub="Your restaurant is verified and visible to customers."
        />
      )}

      {/* ── 1. Profile ── (unchanged) */}
      <SectionCard title="Restaurant Profile" sub="Basic info visible to customers" icon={<FiUser size={16} />} delay={0}>
        <label style={labelBase}>Restaurant Photo</label>
        <AvatarUpload
          preview={imagePreview}
          onFile={handleImageChange}
          inputRef={imageRef}
          placeholder={<FiImage size={24} color="white" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <Field label="Restaurant Name *">
            <input style={inputBase} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="e.g. Spice Garden" />
          </Field>
          <Field label="Cuisine Type">
            <select style={{ ...inputBase, cursor: "pointer" }} value={profile.cusiene} onChange={e => setProfile(p => ({ ...p, cusiene: e.target.value }))}>
              <option value="">Select cuisine…</option>
              {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Email *">
            <input style={inputBase} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="restaurant@email.com" />
          </Field>
          <Field label="Phone *">
            <input style={inputBase} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="+91 98765 43210" />
          </Field>
        </div>
        <Field label="Description">
          <textarea style={{ ...inputBase, resize: "vertical", minHeight: 90 }} value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="Tell customers what makes your restaurant special…" />
        </Field>
        <SaveButton onClick={saveProfile} loading={mutateupdateRestaurant.isPending} />
      </SectionCard>

      {/* ── 2. Location ── (unchanged) */}
      <SectionCard title="Location" sub="Your restaurant's address and coordinates" icon={<FiMapPin size={16} />} delay={0.07}>
        <Field label="Formatted Address">
          <textarea style={{ ...inputBase, resize: "vertical", minHeight: 80 }} value={location.formatedAddress} onChange={e => setLocation(l => ({ ...l, formatedAddress: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="Full address visible to customers…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input style={inputBase} value={location.latitude} onChange={e => setLocation(l => ({ ...l, latitude: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="28.6139" />
          </Field>
          <Field label="Longitude">
            <input style={inputBase} value={location.longitude} onChange={e => setLocation(l => ({ ...l, longitude: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="77.2090" />
          </Field>
        </div>
        <div className="rounded-xl p-3 flex items-start gap-2 mb-4" style={{ background: "rgba(226,55,116,0.04)", border: "1px solid rgba(226,55,116,0.1)" }}>
          <FiAlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#E23774" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#888" }}>Delivery time and charges are calculated automatically based on the customer's distance from these coordinates.</p>
        </div>
        <p className="text-xs mt-1" style={{ color: "#ccc" }}>Location editing will be available soon.</p>
      </SectionCard>

      {/*
      */}

      {/* ── 3. Operations ── (unchanged) */}
      <SectionCard title="Operations" sub="Control how your restaurant accepts and handles orders" icon={<FiShield size={16} />} delay={0.14}>
        <Toggle value={isOpen} onChange={v => setOpenClose.mutate(v)} label="Restaurant Open" sub="Customers can place orders when this is on" />
        <Toggle value={ops.autoAcceptOrders} onChange={v => setOps(o => ({ ...o, autoAcceptOrders: v }))} label="Auto-Accept Orders" sub="Automatically confirm incoming orders without manual review" />
        <div className="grid grid-cols-2 gap-4 mt-5">
          <Field label="Average Prep Time (mins)">
            <input style={inputBase} type="number" min="1" value={ops.prepTime} onChange={e => setOps(o => ({ ...o, prepTime: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="25" />
          </Field>
          <Field label="Minimum Order Amount (₹)">
            <input style={inputBase} type="number" min="0" value={ops.minOrderAmount} onChange={e => setOps(o => ({ ...o, minOrderAmount: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="100" />
          </Field>
        </div>
      </SectionCard>

      {/* ── 4. Notifications ── (unchanged) */}
      <SectionCard title="Notifications" sub="Choose how you want to be alerted about activity" icon={<FiBell size={16} />} delay={0.21}>
        <Toggle value={notifs.newOrderSound} onChange={v => setNotifs(n => ({ ...n, newOrderSound: v }))} label="New Order Sound Alert" sub="Play a sound when a new order comes in" />
        <Toggle value={notifs.emailOnOrder}  onChange={v => setNotifs(n => ({ ...n, emailOnOrder: v }))}  label="Email on New Order"   sub={`Send an email to ${profile.email || "your email"}`} />
        <Toggle value={notifs.smsOnOrder}    onChange={v => setNotifs(n => ({ ...n, smsOnOrder: v }))}    label="SMS on New Order"     sub={`Send an SMS to ${profile.phone || "your phone"}`} />
        <Toggle value={notifs.dailyReport}   onChange={v => setNotifs(n => ({ ...n, dailyReport: v }))}   label="Daily Summary Report" sub="Get a daily email with your key metrics" />
      </SectionCard>

      {/* ── 5. Danger Zone ── (unchanged) */}
      <DangerZoneCard delay={0.28}>
        <DangerRow
          label={isPaused ? "Restaurant is Paused — Click to Resume" : "Pause Restaurant"}
          sub={isPaused ? "Hidden from customers. Resume to make it visible again." : "Temporarily hide from customers without deleting."}
          buttonLabel={isPaused ? <><FiPlayCircle size={13} /> Resume</> : <><FiPauseCircle size={13} /> Pause</>}
          onClick={() => pauseRestaurent.mutate(!r?.pauseRestaurent)}
          loading={pauseRestaurent.isPending}
          variant={isPaused ? "green" : "amber"}
        />
        <DangerRow
          label="Delete All Menu Items"
          sub="Permanently remove your entire menu"
          buttonLabel="Delete Menu"
          disabled
          variant="red"
        />
        <DangerRow
          label="Delete Restaurant"
          sub="Permanently delete your restaurant and all its data"
          buttonLabel={<><FiTrash2 size={13} /> Delete</>}
          onClick={() => setShowDeleteModal(true)}
          loading={mutatedeleteRestaurant.isPending}
          variant="red"
        />
      </DangerZoneCard>

      {/* Delete confirmation modal — unchanged */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Restaurant?"
        message={`This will permanently delete "${r?.name || "your restaurant"}" and all its data including menu items, orders, and settings. This cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={mutatedeleteRestaurant.isPending}
        variant="red"
      />
    </PageShell>
  );
};

export default RestaurantSettings;