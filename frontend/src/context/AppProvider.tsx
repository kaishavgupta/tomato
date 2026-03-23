import { add_role, fetch_User } from "../api/api.user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppContext, type apiInterfaceType, type UserType } from "../types/user.type";
import toast from "react-hot-toast";
import {
  fetch_MyCart,
  add_to_cart,
  update_cart_quantity,
  remove_cart_item,
  clear_cart,
} from "../api/api.cart";
import type { CartResponse } from "../types/CartType";

export const AppProvider = ({ children }: apiInterfaceType) => {
  const queryClient = useQueryClient();

  // ── User ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user"],
    queryFn: fetch_User,
    staleTime: 1000 * 60 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const roleMutation = useMutation({
    mutationFn: add_role,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Role set successfully!");
    },
    onError: (error) => {
      toast.error(error?.msg ||"Failed to set role. Try again.");
    },
  });

  // ── Cart fetch ─────────────────────────────────────────────────────────────
  // Backend: GET /api/cart/viewcart → { success: true, msg: ICart | null }
  // ICart shape: { _id, userId, restaurantId, restaurant: { name, logo },
  //               items: [{ itemId, name, price, quantity }],
  //               totalAmount, totalQty }
  const { data: cartResponse, isLoading: cartLoading, isError: cartError } =
    useQuery<CartResponse>({
      queryKey: ["cart"],
      queryFn: fetch_MyCart,
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnWindowFocus: false,
    });

  // ── Derived cart values ────────────────────────────────────────────────────
  // cartResponse.msg is the full ICart document (or null when empty)
  const cartDoc   = cartResponse?.msg ?? null;           // full ICart | null
  const cartItems = cartDoc?.items ?? [];                // ICart["items"][]
  const cartMeta  = cartDoc
    ? {
        restaurant: cartDoc.restaurant,
        // restaurantId is populated: { _id, isOpen } — extract the plain string _id
        restaurantId: cartDoc.restaurantId?._id?.toString() ?? cartDoc.restaurantId?.toString(),
      }
    : null;

  // ── updateQuantity mutation ────────────────────────────────────────────────
  const updateQuantityMutation = useMutation({
    mutationFn: update_cart_quantity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (error: any) => toast.error(error?.msg || "Failed to update quantity."),
  });

  // ── removeFromCart mutation ────────────────────────────────────────────────
  const removeFromCartMutation = useMutation({
    mutationFn: remove_cart_item,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: (error: any) => toast.error(error?.msg || "Failed to remove item."),
  });

  // ── clearCart mutation ─────────────────────────────────────────────────────
  const clearCartMutation = useMutation({
    mutationFn: clear_cart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared.");
    },
    onError: (error: any) => toast.error(error?.msg || "Failed to clear cart."),
  });

  // ── addToCart ──────────────────────────────────────────────────────────────
  // Plain async fn so we can handle the 409 "different restaurant" toast inline.
  // Signature: addToCart(itemId, restaurantId) — price is resolved server-side.
  const addToCart = async (itemId: string, restaurantId: string) => {
    try {
      await add_to_cart({ restaurantId, itemId });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error: any) {
      // 409: cart belongs to a different restaurant
      if (
        error?.msg === "Cart contains items from another restaurant" ||
        error?.msg === "Cart From Different Restaurant"
      ) {
        toast(
          t => (
            <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
              <p style={{ fontWeight: 700, marginBottom: 6, color: "#1A0A00" }}>
                🛒 Your cart has items from another restaurant
              </p>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                Would you like to clear your cart and add this item?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    try {
                      await clear_cart();
                      await add_to_cart({ restaurantId, itemId });
                      queryClient.invalidateQueries({ queryKey: ["cart"] });
                      toast.success("Item added to cart!");
                    } catch {
                      toast.error("Something went wrong. Try again.");
                    }
                  }}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 10,
                    background: "linear-gradient(135deg,#E23774,#FF6B35)",
                    color: "white", border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12,
                  }}
                >
                  Clear & Add
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 10,
                    background: "rgba(226,55,116,0.07)", color: "#E23774",
                    border: "1.5px solid rgba(226,55,116,0.2)", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12,
                  }}
                >
                  Keep Cart
                </button>
              </div>
            </div>
          ),
          { duration: 8000 },
        );
      } else {
        toast.error(error?.msg || "Failed to add item.");
      }
    }
  };

  // ── Stable wrapper functions exposed on context ────────────────────────────
  const updateQuantity = (itemId: string, quantity: number) =>
    updateQuantityMutation.mutate({ itemId, quantity });

  const removeFromCart = (itemId: string) =>
    removeFromCartMutation.mutate(itemId);

  const clearCart = () =>
    clearCartMutation.mutate();

  return (
    <AppContext.Provider
      value={{
        userData:      data?.msg,
        // cartData = flat items array (consumed by Cart.tsx, CartItemRow, MoreFromRestaurant)
        cartData:      cartItems,
        // cartDoc = full ICart document (consumed if totalAmount / totalQty needed directly)
        cartDoc,
        cartMeta,
        cartQuantity:  cartDoc?.totalQty    ?? 0,
        cartPrice:     cartDoc?.totalAmount ?? 0,
        cartLoading,
        cartError,
        isauth:        data?.success as boolean,
        isLoading,
        isError,
        roleMutation,
        // cart actions
        addToCart,       // (itemId, restaurantId) => Promise<void>
        updateQuantity,  // (itemId, quantity)     => void
        removeFromCart,  // (itemId)               => void
        clearCart,       //  ()                    => void
      }}
    >
      {children}
    </AppContext.Provider>
  );
};