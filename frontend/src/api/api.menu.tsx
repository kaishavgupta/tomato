import axios from "axios";
import type { ItemStatus } from "../types/menu.types";

export const menuService = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// There are 3 distinct menu fetch scenarios:
//
//  "owner"      → Restaurant owner (e.g. Dominos) views THEIR OWN listed items.
//                 Auth cookie identifies them on the backend — no ID needed.
//                 GET /api/menu/get-menu/?page=N
//
//  "restaurant" → Customer selected a specific restaurant (e.g. Dominos).
//                 Must pass restaurantId so backend filters by that restaurant.
//                 GET /api/menu/get-menu/:restaurantId/?page=N
//
//  "global"     → Customer browsing ALL restaurants' menus (discovery page).
//                 GET /api/menu/get-global-menu/?page=N
//                 ⚠️  Update this URL to match your actual backend route.
//
// ─────────────────────────────────────────────────────────────────────────────

export type MenuFetchMode = "owner" | "restaurant" | "global";

export interface GetMenuParams {
  page: number;
  mode: MenuFetchMode;
  restaurantId?: string; // required only when mode === "restaurant"
}

export const get_menu = async ({
  pageParam,
  mode,
  restaurantId,
}: GetMenuParams) => {
  let url: string;

  if (mode === "owner") {
    // matches: GET /api/menu/seller
    url = `/api/menu/seller?page=${pageParam}`;

  } else if (mode === "restaurant") {
    if (!restaurantId) throw new Error("restaurantId is required for restaurant mode");
    // matches: GET /api/menu/:restaurantId
    url = `/api/menu/${restaurantId}?page=${pageParam}`;

  } else {
    // global/explore — matches: GET /api/menu/
    url = `/api/menu/?page=${pageParam}`;
    //     ^^^ NOT /api/menu/get-global-menu — that route doesn't exist
  }

  try {
    const response = await menuService.get(url);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
};

console.log(get_menu({page:1,mode:'owner'}));


// ── Mutations (owner-only actions) ────────────────────────────────────────────

export const add_menu = async (formData: FormData) => {
  try {
    const response = await menuService.post(`api/menu/add-menu`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

export const delete_item = async (id: string) => {
  try {
    const response = await menuService.delete(`api/menu/delete-menu/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

export const update_menu = async (formData: FormData, public_id: string, id: string) => {
  try {
    const response = await menuService.patch(
      `api/menu/update-menu/${id}/${public_id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error("Network Error");
  }
};

export const toggleState = async (item_id: string, status: ItemStatus) => {
  try {
    const response = await menuService.patch(`api/menu/pause-menu/${item_id}`, { status });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error("Network Error");
  }
};