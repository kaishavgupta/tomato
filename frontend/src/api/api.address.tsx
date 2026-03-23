// src/api/api.address.ts
import axios from "axios";

const BASE = import.meta.env.VITE_restaurantService as string;

export interface UserAddress {
  _id: string;
  userId: string;
  phone: string;
  userAddress: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    formatedAddress: string;
    typeOfAddress?: "home" | "work" | "other";
  };
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddAddressPayload {
  phone: string;
  latitude: number;
  longitude: number;
  formatedAddress: string;
  typeOfAddress?: "home" | "work" | "other";
  setdefault?: boolean;
}

// ✅ NEW — matches PUT /api/user-address/update-address in address.routes.ts
export interface UpdateAddressPayload {
  addressId: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  formatedAddress?: string;
  typeOfAddress?: "home" | "work" | "other";
  setdefault?: boolean;
}

const addressService = axios.create({
  withCredentials: true,
  baseURL: BASE,
});

export const fetchMyAddresses = async (): Promise<UserAddress[]> => {
  const { data } = await addressService.get(`/api/user-address/my`);
  return data.data as UserAddress[];
};

export const addAddress = async (
  payload: AddAddressPayload
): Promise<UserAddress> => {
  const { data } = await addressService.post(`/api/user-address/add`, payload);
  return data.data as UserAddress;
};

export const removeAddress = async (addressId: string): Promise<void> => {
  await addressService.delete(`/api/user-address/remove`, {
    params: { addressId },
  });
};

export const setDefaultAddress = async (addressId: string): Promise<void> => {
  await addressService.patch(`/api/user-address/set-default`, { addressId });
};

// ✅ NEW — calls PUT /api/user-address/update-address
export const updateAddressApi = async (
  payload: UpdateAddressPayload
): Promise<void> => {
  await addressService.put(`/api/user-address/update-address`, payload);
};
 