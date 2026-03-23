// src/types/HomeMenueType.ts
// ─────────────────────────────────────────────────────────────────────────────

/** Shape returned by the backend for global / per-restaurant explore queries */
export interface RestaurantMenuDoc {
  restaurant_id: string;
  name: string;
  image?: { url: string; public_id: string } | string;
  location?: { city?: string; address?: string };
  totalItems: number;
  items: MenuItemPreview[];
  /** Whether the restaurant is currently accepting orders */
  isOpen?: boolean;
}

/** Lightweight item shape embedded inside RestaurantMenuDoc.items */
export interface MenuItemPreview {
  _id: string;
  item_name: string;
  price: number;
  discountedPrice?: number;
  image?: { url?: string };
  isVeg?: boolean;
  status?: string;
  category?: string;
  restaurantName?: string;
  restaurant_id?: string;
}

/** Safely unwrap restaurant image */
export const imgUrl = (
  img?: { url: string; public_id: string } | string,
): string | undefined => {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.url || undefined;
};

/** Discount percentage rounded to nearest integer */
export const discountPct = (price: number, discounted?: number) =>
  discounted ? Math.round((1 - discounted / price) * 100) : 0;