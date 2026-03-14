import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { apiInterfaceType } from "../types/user.type";
import {
  close_Restaurant,
  create_restaurant,
  fetch_Myrestaurant,
} from "../api/api.restaurant";
import {
  RestaurantContext,
  type ErrorType,
  type RestaurantAPItype,
} from "../types/restaurant.type";
import toast from "react-hot-toast";
import { useState } from "react";

export const RestaurantProvider = ({ children }: apiInterfaceType) => {
  const queryClient = useQueryClient();

  // Fetch Restaurant
  const { data, isLoading, isFetching, isError, error } = useQuery<
    RestaurantAPItype,
    ErrorType
  >({
    queryKey: ["restaurant"],
    queryFn: fetch_Myrestaurant,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Create Restaurant

  const createMutation = useMutation({
    mutationFn: create_restaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Restaurant created successfully!");
    },
    onError: (error: ErrorType) => {
      toast.error(error?.msg || "Failed to create restaurant. Try again.");
    },
  });
  const [isOpen, setIsOpen] = useState<boolean>(data?.msg?.isOpen ?? false);

  // Set Open Restaurant

  const setOpenClose = useMutation({
    mutationFn: close_Restaurant,
    onSuccess: (data) => {
      setIsOpen((e: boolean) => !e);
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success(data?.msg);
    },
    onError: (error:ErrorType) => {
      toast.error(error?.msg);
      // toast.error(message);
    },
  });

  const errorMessage = error?.msg || error?.message || "An error occurred";

  // ✅ Restaurant exists only when backend confirmed success with a doc
  const isRestaurantExist = data?.success === true && !!data?.msg;

  // ✅ isLoading: true during initial fetch AND during refetch after creation
  const loading = isLoading || isFetching;

  // ✅ isauth stays true once the query has settled even once —
  // prevents login redirect during the post-creation refetch
  const isauth = data !== undefined || isError;

  return (
    <RestaurantContext.Provider
      value={{
        restaurantData: data?.msg,
        isLoading: loading,
        isError,
        isauth,
        errorMsg: isError ? errorMessage : null,
        isRestaurantExist,
        createMutation,
        setOpenClose,
        isOpen,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
