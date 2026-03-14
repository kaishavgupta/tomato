import { use } from "react"
import { RestaurantContext, type RestaurantContextType } from "../types/restaurant.type"

export const useRestaurant=()=>{
    const data = use(RestaurantContext) as RestaurantContextType;
    if (!data) {
        throw new Error("useRestaurant must be used within a RestaurantProvider");
    }
    return data
}