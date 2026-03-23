// src/pages/User/Settings/UserSettingsAddressSection.tsx
import { FiMapPin } from "react-icons/fi";
import { useAddress } from "../../../Hooks/useAddresses";
import { AddressManager } from "../../../components/AddressManager";
import { SectionCard } from "../../../components/SettingsShared";

const UserSettingsAddressSection = () => {
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
    // ✅ NEW — wired through so AddressManager can call PUT /update-address
    updateAddress,
    isUpdating,
    updatingId,
  } = useAddress();

  return (
    <div id="address-section">
      <SectionCard
        title="Saved Addresses"
        sub="Manage your delivery locations"
        icon={<FiMapPin size={16} />}
        delay={0.07}
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
          updateAddress={updateAddress}
          isUpdating={isUpdating}
          updatingId={updatingId}
        />
      </SectionCard>
    </div>
  );
};

export default UserSettingsAddressSection;