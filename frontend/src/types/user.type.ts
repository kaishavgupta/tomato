import type { UseMutationResult } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { createContext, type ReactNode } from "react";

export const roles = {
  user: "user",
  resturant: "resturant",
  rider: "rider",
} as const;

export type roles = (typeof roles)[keyof typeof roles];

export interface ApiResponse {
  success: boolean;
  msg: UserType;
}

export interface User {
  name: string;
  email: string;
  image: string;
  role: roles;
  _id: string;
}
export interface UserType {
  msg: User; // The 'msg' property contains the User object
  success: boolean;
}


// type.ts

export interface RoleResponse {
  success: boolean;
  msg: string;
}

export interface AppContextType {
  userData: User | undefined;
  isLoading: boolean;
  isError: boolean;
  isauth: boolean;
  roleMutation: UseMutationResult<AxiosResponse<RoleResponse>, Error, roles, unknown>
}

export interface apiInterfaceType {
  children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
