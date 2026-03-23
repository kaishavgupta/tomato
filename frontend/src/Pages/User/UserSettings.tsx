// src/pages/User/UserSettings.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUser, FiBell, FiTrash2,
  FiPhone, FiMail, FiLogOut,
} from "react-icons/fi";
import useUser from "../../Hooks/useUser";

import {
  PageShell, PageHeader, SectionCard, DangerZoneCard, DangerRow,
  Field, Toggle, SaveButton, AvatarUpload, ConfirmModal,
  inputBase,
} from "../../components/SettingsShared";

import UserSettingsAddressSection from "./Settings/UserSettingsAddressSection";

const UserSettings = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { userData } = useUser();

  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview,    setImagePreview]    = useState<string>(userData?.image ?? "");
  const [imageFile,       setImageFile]       = useState<File | null>(null);
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profile, setProfile] = useState({
    name:  userData?.name  ?? "",
    email: userData?.email ?? "",
    phone: userData?.phone ?? "",
  });

  const [notifs, setNotifs] = useState({
    orderUpdates:  true,
    promoOffers:   false,
    emailReceipts: true,
    smsAlerts:     false,
  });

  // ── scroll to address section when arriving from Cart ──────────────────────
  // Cart sends: navigate("/settings", { state: { scrollTo: "address-section" } })
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      // Small delay so the page finishes rendering/animating before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById(state.scrollTo!);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      // await updateUserProfile({ ...profile, imageFile });
      await new Promise(r => setTimeout(r, 800));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // await deleteAccount();
      await new Promise(r => setTimeout(r, 1000));
      navigate("/");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#E23774");
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "rgba(226,55,116,0.15)");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        sub="Manage your profile, addresses, and preferences"
      />

      {/* ── 1. My Profile ── */}
      <SectionCard title="My Profile" sub="Your personal information and photo" icon={<FiUser size={16} />} delay={0}>
        <AvatarUpload
          preview={imagePreview}
          onFile={handleImageChange}
          inputRef={imageRef}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <Field label="Full Name *">
            <input
              style={inputBase}
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              onFocus={focus} onBlur={blur}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Phone Number">
            <div style={{ position: "relative" }}>
              <FiPhone size={13} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#E23774", pointerEvents: "none" }} />
              <input
                style={{ ...inputBase, paddingLeft: 36 }}
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                onFocus={focus} onBlur={blur}
                placeholder="+91 98765 43210"
              />
            </div>
          </Field>
          <Field label="Email Address">
            <div style={{ position: "relative" }}>
              <FiMail size={13} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#E23774", pointerEvents: "none" }} />
              <input
                style={{ ...inputBase, paddingLeft: 36 }}
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                onFocus={focus} onBlur={blur}
                placeholder="you@email.com"
              />
            </div>
          </Field>
        </div>

        <SaveButton onClick={saveProfile} loading={savingProfile} label="Save Profile" />
      </SectionCard>

      {/* ── 2. Saved Addresses ── */}
      {/*
        id="address-section" lives inside UserSettingsAddressSection.
        UserSettings.tsx scrolls to it via the useEffect above when
        location.state.scrollTo === "address-section".
      */}
      <UserSettingsAddressSection />

      {/* ── 3. Notifications ── */}
      <SectionCard title="Notifications" sub="Control what updates you receive" icon={<FiBell size={16} />} delay={0.14}>
        <Toggle
          value={notifs.orderUpdates}
          onChange={v => setNotifs(n => ({ ...n, orderUpdates: v }))}
          label="Order Status Updates"
          sub="Get notified when your order is confirmed, prepared, or delivered"
        />
        <Toggle
          value={notifs.emailReceipts}
          onChange={v => setNotifs(n => ({ ...n, emailReceipts: v }))}
          label="Email Receipts"
          sub="Receive order receipts and invoices by email"
        />
        <Toggle
          value={notifs.promoOffers}
          onChange={v => setNotifs(n => ({ ...n, promoOffers: v }))}
          label="Offers & Promotions"
          sub="Exclusive deals, discounts, and new restaurant alerts"
        />
        <Toggle
          value={notifs.smsAlerts}
          onChange={v => setNotifs(n => ({ ...n, smsAlerts: v }))}
          label="SMS Alerts"
          sub="Critical order updates via text message"
        />
      </SectionCard>

      {/* ── 4. Danger Zone ── */}
      <DangerZoneCard delay={0.21}>
        <DangerRow
          label="Sign Out Everywhere"
          sub="Log out from all devices and active sessions"
          buttonLabel={<><FiLogOut size={13} /> Sign Out</>}
          onClick={() => navigate("/logout")}
          variant="amber"
        />
        <DangerRow
          label="Delete My Account"
          sub="Permanently delete your account, order history, and all personal data. This cannot be undone."
          buttonLabel={<><FiTrash2 size={13} /> Delete Account</>}
          onClick={() => setShowDeleteModal(true)}
          loading={deletingAccount}
          variant="red"
        />
      </DangerZoneCard>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Your Account?"
        message={`This will permanently delete your account "${profile.name || profile.email || "your account"}", all saved addresses, order history, and preferences. This action cannot be undone.`}
        confirmLabel="Yes, Delete My Account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingAccount}
        variant="red"
      />
    </PageShell>
  );
};

export default UserSettings;