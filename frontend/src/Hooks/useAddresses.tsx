// src/Hooks/useAddresses.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addAddress as apiAdd,
  fetchMyAddresses,
  removeAddress as apiRemove,
  setDefaultAddress as apiSetDefault,
  updateAddressApi,
  type AddAddressPayload,
  type UpdateAddressPayload,
  type UserAddress,
} from "../api/api.address";

export const ADDRESS_QUERY_KEY = ["userAddresses"] as const;

export const useAddress = () => {
  const queryClient = useQueryClient();

  // ── fetch ─────────────────────────────────────────────────────────────────
  const {
    data: addresses = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery<UserAddress[]>({
    queryKey: ADDRESS_QUERY_KEY,
    queryFn: fetchMyAddresses,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const hasAddresses = addresses.length > 0;

  // ── add ───────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (payload: AddAddressPayload) => apiAdd(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      toast.success("Address saved ✓");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.msg || "Failed to save address");
    },
  });

  // ── remove ────────────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (addressId: string) => apiRemove(addressId),
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: ADDRESS_QUERY_KEY });
      const prev = queryClient.getQueryData<UserAddress[]>(ADDRESS_QUERY_KEY);
      queryClient.setQueryData<UserAddress[]>(
        ADDRESS_QUERY_KEY,
        (old) => old?.filter((a) => a._id !== addressId) ?? []
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ADDRESS_QUERY_KEY, ctx.prev);
      toast.error("Failed to remove address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
    },
  });

  // ── set default ───────────────────────────────────────────────────────────
  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) => apiSetDefault(addressId),
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: ADDRESS_QUERY_KEY });
      const prev = queryClient.getQueryData<UserAddress[]>(ADDRESS_QUERY_KEY);
      queryClient.setQueryData<UserAddress[]>(ADDRESS_QUERY_KEY, (old) =>
        old?.map((a) => ({ ...a, isDefault: a._id === addressId })) ?? []
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ADDRESS_QUERY_KEY, ctx.prev);
      toast.error("Failed to set default address");
    },
    onSuccess: () => toast.success("Default address updated ✓"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
    },
  });

  // ── update (edit) ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAddressPayload) => updateAddressApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      toast.success("Address updated ✓");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.msg || "Failed to update address");
    },
  });

  return {
    // data
    addresses,
    defaultAddress,
    hasAddresses,
    isLoading,
    isFetching,
    isError,

    // add
    addAddress: addMutation.mutate,
    addAddressAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,

    // remove
    removeAddress: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    removingId: removeMutation.variables as string | undefined,

    // set default
    setDefault: setDefaultMutation.mutate,
    isSettingDefault: setDefaultMutation.isPending,
    settingDefaultId: setDefaultMutation.variables as string | undefined,

    // update / edit
    updateAddress: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updatingId: (updateMutation.variables as UpdateAddressPayload | undefined)
      ?.addressId,
  };
};