import { createContext } from "react";
import { fetch_User } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import type { apiInterfaceType, AppContextType, UserType } from "../type";



export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: apiInterfaceType) => {
  

  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user"], //as useState()
    queryFn: fetch_User, //as useEffect() , which fetched data
  });
  return (
    <AppContext.Provider value={{ data , isLoading, isError }}>
      {children}
    </AppContext.Provider>
  );
};
