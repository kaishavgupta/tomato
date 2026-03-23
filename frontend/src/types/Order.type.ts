import { createContext } from "react";
import type Order from "../Pages/User/Order";

export interface IOrder {
  _id?: string;
  user: {
    userId: string;
    userPhone: string;
    userLocation: {
      addressId: string;
      coordinates: [number, number]; //[longitude, latitude]
      formatedAddress: string;
    };
  };

  restaurent: {
    restaurentId: string;
    restaurent_name: string;
    restaurentLocation: {
      coordinates: [number, number]; //[longitude, latitude]
      formatedAddress: string;
    };
    restaurentPhone: string;
  };

  rider: {
    riderId?: string | null;
    rider_name?: string | null;
    riderPhone?: number | null;
  };

  item: {
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }[];

  bill: {
    subtotal: number;
    deliverCharges: number;
    platformFee: number;
    totalAmount: number;
  };

  payment: {
    method: "razorpay" | "stripe";
    status: "pending" | "paid" | "failed";
  };

  orderstatus:
    | "placed"
    | "accepted"
    | "prepairing"
    | "ready_forPickup"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  expiredAt: Date;

  createdAt: Date;
  updatedAt: Date;
}


export interface OrderContextType{
    orderData:IOrder | undefined;
    allOrders:[],
    hasNextPage:boolean,
    isFetchingNextPage:boolean,
    isLoading:boolean,
    isFetching:boolean,
    isError:boolean,
    error:string
}


export interface OrderType {
  success: boolean;
  msg: Order; 
}

export type OrderPage = {
  items: Order[]
  pagination:{
     nextPage:number | null
     hasMore:boolean
  }
}


export const OrderContext = createContext<OrderContextType | undefined>(undefined);