import axios from "axios";

export const restaurantService = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// ── View cart ─────────────────────────────────────────────────────────────────
export const fetch_MyCart = async () => {
  try {
    const response = await restaurantService.get("api/cart/viewcart");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ── Add item to cart ──────────────────────────────────────────────────────────
// POST /api/cart/add/:restaurantId/:itemId  { price }
// Returns 409 { msg: "Cart From Different Restaurant" } when cart has items from elsewhere
export const add_to_cart = async ({
  restaurantId,
  itemId,
}: {
  restaurantId: string;
  itemId: string;
}) => {
  try {
    const response = await restaurantService.post(
      `api/cart/add/${restaurantId}/${itemId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ── Update quantity of one item ───────────────────────────────────────────────
// PATCH /api/cart/quantity/:itemId  { quantity }
export const update_cart_quantity = async ({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) => {
  try {
    const response = await restaurantService.patch(
      `api/cart/quantity/${itemId}`,
      { quantity },
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ── Remove a single item ──────────────────────────────────────────────────────
// DELETE /api/cart/remove/:itemId
export const remove_cart_item = async (itemId: string) => {
  try {
    const response = await restaurantService.delete(`api/cart/remove/${itemId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ── Clear entire cart ─────────────────────────────────────────────────────────
// DELETE /api/cart/clear
export const clear_cart = async () => {
  try {
    const response = await restaurantService.delete("api/cart/clear");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};