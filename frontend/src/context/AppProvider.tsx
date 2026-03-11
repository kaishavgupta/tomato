import { createContext, useState } from "react";
import { add_role, fetch_User } from "../api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { apiInterfaceType, AppContextType, UserType } from "../type";
import toast from "react-hot-toast";

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: apiInterfaceType) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user"],
    queryFn: fetch_User,
    staleTime: 1000 * 60 * 5,        // ✅ cache for 5 min — no refetch on every visit
    retry: false,                      // ✅ don't retry on 401 — unauthenticated is expected
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
      isauth: data?.success,
      isLoading,
      isError,
      roleMutation,
    }}>
      {children}
    </AppContext.Provider>
  );
};