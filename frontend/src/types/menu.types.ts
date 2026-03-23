import { createContext } from "react";

export type ItemStatus = "available" | "paused" | "out_of_stock";

const CATEGORIES = [
  "Starters", "Main Course", "Breads", "Rice & Biryani",
  "Desserts", "Beverages", "Soups", "Salads", "Snacks", "Combos",
];

export type CATEGORIES=(typeof CATEGORIES)[keyof typeof CATEGORIES]

export type MenuPage = {
  items: Menu[]
  pagination:{
     nextPage:number | null
     hasMore:boolean
  }
}

export interface MenuItem {
  _id: string;
  item_name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  category: CATEGORIES;
  image: { url: string; public_id: string };
  isVeg: boolean;
  status: ItemStatus;
  preparationTime: number;
  tags: string[];
  _newFile?: File;  
}

export interface Menu extends MenuItem{
    restaurant_id:string
}

export interface MenuContextType{
    menuData:Menu | undefined;
}

export interface ErrorType {
  message: string;
  msg: string;
  success: boolean;
}

export interface MenuAPItype {
  error: ErrorType;
  msg: Menu;
  success: boolean;
}

export interface get_menu_params{
    pageParam: number;
    mode:"global"| "restaurant";
    restaurantId:string | undefined
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);