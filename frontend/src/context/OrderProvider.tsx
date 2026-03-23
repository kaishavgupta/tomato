import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  OrderContext,
  type OrderContextType,
  type OrderPage,
} from "../types/Order.type";
import type { apiInterfaceType } from "../types/user.type";
import { create_Order, fetch_order_details, get_All_orders } from "../api/api.order";
import type { ErrorType } from "../types/menu.types";
import toast from "react-hot-toast";
import { data, useNavigate } from "react-router-dom";
import { clear_cart } from "../api/api.cart";

export const OrderProvider = ({ children }: apiInterfaceType) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // For Fetching all user's orders
  const {
    data: allOrders,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery<OrderPage, ErrorType>({
    queryKey: ["order"],
    queryFn: ({ pageParam = 1 }) => get_All_orders(Number(pageParam)),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextPage ?? undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const create_order_mutation = useMutation({
    mutationFn: create_Order,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      
      toast.success(
        "Order placed! Redirecting to secure payment. 🚀",
        { duration: 2000 },
      );
      
      clear_cart();

      // Pass the created order via navigation state so Checkout can render
      // instantly (no extra fetch). Also support deep-link via /checkout/:id.
      const order = response?.msg;
      if (order?._id) {
        navigate(`/checkout/${order._id}`, { state: { order } });
      } else {
        navigate("/checkout");
      }
    },
    onError: (error: any) => {
      toast.error(error?.msg || "Failed to create order.");
    },
  });

  console.log(allOrders)
  

  return (
    <OrderContext.Provider
      value={{
        allOrders,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        isError,
        error,
        makeOrder: create_order_mutation,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};