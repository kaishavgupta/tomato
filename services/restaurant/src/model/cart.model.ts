import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem{
  itemId:Types.ObjectId;
  itemname:string;
  price:number;
  quantity:number;
}


export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
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

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },

    restaurant: {
      name: String,
      logo: String,
    },

    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "menu" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: Number,
    totalQty: Number,
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1 }, { unique: true });

export const cartModel = mongoose.model<ICart>("cart", CartSchema);