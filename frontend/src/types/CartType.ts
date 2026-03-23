export interface ICartItem{
  itemId:string;
  itemname:string;
  price:number;
  quantity:number;
}

export interface cartItemType {
  _id?:string
  userId: string;
  restaurantId: string;
  restaurant:{
    name:string;
    logo:string
  }
  items:ICartItem[];
  totalAmount: number;
  totalQty: number;

  createdAt:Date;
  updatedAt:Date;
}

export interface CartResponse {
  success: boolean;
  msg: {
    cartItem: cartItemType; // Usually an array of items
    quantity: number;        // Total count of items
    totalPrice: number;      // Total cost
  };
}