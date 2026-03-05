import { createContext } from "react";
import { add_role, fetch_User } from "../api/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { apiInterfaceType, AppContextType, UserType } from "../type";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";



export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: apiInterfaceType) => {
  

  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user"], //as useState()
    queryFn: fetch_User, //as useEffect() , which fetched data
  });

  const roleMutation=useMutation({
    mutationFn:add_role,
    onSuccess:()=>{
      toast.success("Role set successfully!")
    },
    onError:(error)=>{
      console.log(`Error from roleMutuation in AppProvider.tsx ${error}`);
      toast.error("Failed to set role. Try again.")
      throw error
    }
  })

  return (
    <AppContext.Provider value={{ userData:data?.msg , isauth:data?.success , isLoading, isError ,roleMutation}}>
      {children}
    </AppContext.Provider>
  );
};
