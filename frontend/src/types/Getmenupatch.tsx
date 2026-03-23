/**
 * PATCH REQUIRED in your existing api.menu.ts
 *
 * Your current get_menu signature likely looks like:
 *   export const get_menu = async ({ pageParam }: { pageParam: unknown }) => { ... }
 *
 * Update it to accept mode + restaurantId so MenuProvider can pass them:
 */

// ── Updated get_menu function ─────────────────────────────────────────────
// Replace your existing get_menu with this:

import { menuService } from "./api.menu"; // keep your existing axios instance

interface GetMenuParams {
  pageParam: unknown;
  mode?: "owner" | "restaurant";
  restaurantId?: string;
}

export const get_menu = async ({ pageParam = 1, mode = "owner", restaurantId }: GetMenuParams) => {
  try {
    let url: string;

    if (mode === "restaurant" && restaurantId) {
      // Public endpoint — fetch a specific restaurant's menu for users browsing
      url = `api/menu/restaurant/${restaurantId}?page=${pageParam}`;
    } else {
      // Owner endpoint — fetch the logged-in restaurant owner's own menu
      url = `api/menu/get_menu?page=${pageParam}`;
    }

    const response = await menuService.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

/**
 * NOTE: The response shape must stay the same for both endpoints:
 * {
 *   msg: MenuItem[],
 *   pagination: { nextPage: number | null, ... }
 * }
 *
 * If your public restaurant menu API returns a different shape,
 * normalize it in the function above before returning.
 */