
import { add_role, fetch_User } from "../api/api.user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppContext, type apiInterfaceType, type UserType } from "../types/user.type";
import toast from "react-hot-toast";


export const AppProvider = ({ children }: apiInterfaceType) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user"],
    queryFn: fetch_User,
    staleTime: 1000 * 60 * 5,        
    retry: false,                      
  });

  const roleMutation = useMutation({
    mutationFn: add_role,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }); // ✅ fixed v5 syntax
      toast.success("Role set successfully!");
    },
    onError: (error) => {
      console.log(`Error from roleMutation: ${error}`);
      toast.error("Failed to set role. Try again.");
    },
  });

  return (
    <AppContext.Provider value={{
      userData: data?.msg,
      isauth: data?.success as boolean,
      isLoading,
      isError,
      roleMutation,
    }}>
      {children}
    </AppContext.Provider>
  );
};