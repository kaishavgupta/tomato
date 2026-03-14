import { createContext } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

export const roles = {
  user: "user",
  restaurant: "restaurant",
  rider: "rider",
} as const;

export type roles = (typeof roles)[keyof typeof roles];

type apiMutationResponse = {
  success: boolean;
  message: string;
};

export interface Restaurant {
  name: string;
  email: string;
  phone: string;
  description?: string;
  ownerId: string;
  image: string;
  role?: roles | null;
  isVerified: boolean;
  autoLocation: {
    type: "Point";
    coordinates: [number, number];
    formatedAddress: string;
  };
  isOpen: boolean;
}

export interface ErrorType {
  message: string;
  msg: string;
  success: boolean;
}

export interface RestaurantContextType {
  restaurantData: Restaurant | undefined;
  isLoading: boolean;
  isError: boolean;
  isauth: boolean | undefined;
  errorMsg?: string | null;
  isRestaurantExist?: boolean | null;
  createMutation: UseMutationResult<apiMutationResponse, Error, FormData>;
  setOpenClose: UseMutationResult<apiMutationResponse,Error,boolean>;
  isOpen:boolean
}

export interface RestaurantAPItype {
  error: ErrorType;
  msg: Restaurant;
  success: boolean;
}

export const RestaurantContext = createContext<
  RestaurantContextType | undefined
>(undefined);