import type { UseMutationResult } from "@tanstack/react-query";
import type { cartItemType} from "./CartType";
import type { AxiosResponse } from "axios";
import { createContext, type ReactNode } from "react";

export const roles = {
  user: "user",
  resturant: "resturant",
  rider: "rider",
} as const;

export type roles = (typeof roles)[keyof typeof roles];
interface addtocart{itemId: string; restaurantId: string}

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: roles;
}

// This matches the structure of your fetch_User response
export interface UserType {
  success: boolean;
  msg: User; 
}

export interface RoleResponse {
  success: boolean;
  msg: string;
}

export interface CartResponse{
  success:boolean;
  msg:cartItemType
}

export interface AppContextType {
  userData: User | undefined;
  cartData: cartItemType[] | undefined; // Array of items in cart
  cartQuantity: number;
  cartPrice: number;
  isauth: boolean;
  isLoading: boolean;
  isError: boolean;
  cartLoading:boolean;
  cartError:boolean;
  addToCart:UseMutationResult<AxiosResponse<CartResponse>, Error, addtocart, unknown>
  roleMutation:UseMutationResult<AxiosResponse<RoleResponse>, Error, roles, unknown>;
 // Keep your UseMutationResult type here
}

export interface apiInterfaceType {
  children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
