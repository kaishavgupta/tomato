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

const cusiene ={
  Indian : "Indian",
  Chinese : "Chinese",
  Italian : "Italian",
  Mexican : "Mexican",
  Japanese : "Japanese",
  Thai : "Thai",
  American : "American",
  Mediterranean : "Mediterranean",
  Korean : "Korean",
}

export type cusiene=(typeof cusiene)[keyof typeof cusiene]

export interface Restaurant {
  name: string;
  email: string;
  phone: string;
  description?: string;
  ownerId: string;
  image: { url: string; public_id: string };  // ✅ was: image: string
  role?: roles | null;
  isVerified: boolean;
  autoLocation: {
    type: "Point";
    coordinates: [number, number];
    formatedAddress: string;
  };
  pauseRestaurent:boolean,
  isOpen: boolean;
  cusiene:cusiene
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
  mutateupdateRestaurant: UseMutationResult<apiMutationResponse,Error,Restaurant>;
  mutatedeleteRestaurant: UseMutationResult<apiMutationResponse,Error,Restaurant>;
  pauseRestaurent: UseMutationResult<apiMutationResponse,Error,boolean>;
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