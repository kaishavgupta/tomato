// src/pages/Restaurant/Settings/RestaurantSettingsAddressSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Address section for RestaurantSettings.tsx.
//
// singleMode={true} → only ONE address allowed:
//   • No address  → shows the map form to add one
//   • Address exists → shows the card with an "Edit / Replace" pencil button
//                      (clicking it opens the form; saving replaces the old one)
//
// Dropped into RestaurantSettings.tsx between Location and Operations.
// ─────────────────────────────────────────────────────────────────────────────

import { FiMapPin } from "react-icons/fi";
import { useAddress } from "../../Hooks/useAddresses";
import { AddressManager } from "../../components/AddressManager";
import { SectionCard } from "../../components/SettingsShared";

const RestaurantSettingsAddressSection = () => {
  const {
    addresses,
    isLoading,
    isAdding,
    isRemoving,
    removingId,
    isSettingDefault,
    settingDefaultId,
    addAddress,
    removeAddress,
    setDefault,
  } = useAddress();

  return (
    <SectionCard
      title="Owner Address"
      sub="Your personal address linked to this account"
      icon={<FiMapPin size={16} />}
      delay={0.10}
    >
      <AddressManager
        addresses={addresses}
        isLoading={isLoading}
        isAdding={isAdding}
        isRemoving={isRemoving}
        removingId={removingId}
        isSettingDefault={isSettingDefault}
        settingDefaultId={settingDefaultId}
        addAddress={addAddress}
        removeAddress={removeAddress}
        setDefault={setDefault}
        singleMode={true}
      />
    </SectionCard>
  );
};

export default RestaurantSettingsAddressSection;