import type { ReactNode } from "react";

enum roles{
    user="user",
    resturant="resturant",
    rider="rider"
}
export interface UserType {
    name:string;
    email:string;
    image:string;
    role: roles
}

export interface AppContextType {
  data: UserType | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface apiInterfaceType {
  children: ReactNode;
}