import type { ReactNode } from "react";

export enum roles{
    user="user",
    resturant="resturant",
    rider="rider"
}
export interface ApiResponse {
  success: boolean;
  msg: UserType;
}
export interface UserType {
    msg:{
        name:string;
    email:string;
    image:string;
    role: roles;
    _id:string;
    },
    success:boolean
}

export interface AppContextType {
  userData: UserType | undefined;
  isLoading: boolean;
  isError: boolean;
  isauth:boolean;
}

export interface apiInterfaceType {
  children: ReactNode;
}