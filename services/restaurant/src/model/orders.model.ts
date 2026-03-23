import mongoose, { Document, Schema } from "mongoose";

export interface orderRestaurentType {
  restaurentId: string;
  restaurent_name: string;
  restaurent_image: string;
  restaurentLocation: {
    coordinates: [number, number]; //[longitude, latitude]
    formatedAddress: string;
  };
  restaurentPhone: string;
}

export interface IOrder extends Document {
  user: {
    userId: string;
    userPhone: string;
    userLocation: {
      addressId: string;
      coordinates: [number, number]; //[longitude, latitude]
      formatedAddress: string;
    };
  };

  restaurent: orderRestaurentType;

  rider: {
    riderId?: string | null;
    rider_name?: string | null;
    riderPhone?: number | null;
  };

  item: {
    itemId: string;
    itemName: string;
    quantity: number;
    item_image:string
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

const orderSchema = new Schema<IOrder>(
  {
    user: {
      userId: {
        type: String,
        required: true,
      },
      userPhone: {
        type: String,
        required: true,
      },
      userLocation: {
        addressId: {
          type: String,
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        }, //[longitude, latitude]
        formatedAddress: {
          type: String,
          required: true,
        },
      },
    },

    restaurent: {
      restaurentId: {
        type: String,
        required: true,
      },
      restaurent_name: {
        type: String,
        required: true,
      },
      restaurent_image: {
        type: String,
        required: true,
      },
      restaurantPhone: {
        type: String,
        required: true,
      },

      restaurentLocation: {
        addressId: {
          type: String,
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        }, //[longitude, latitude]
        formatedAddress: {
          type: String,
          required: true,
        },
      },
    },

    rider: {
      riderId: {
        type: String,
        default: null,
      },
      rider_name: {
        type: String,
        default: null,
      },
      riderPhone: {
        type: Number,
        default: null,
      },
    },

    item: [
      {
        itemId: {
          type: String,
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        item_image:{
          type: String,
          required: true,
        }
      },
    ],

    orderstatus: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "prepairing",
        "ready_forPickup",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    bill: {
      subtotal: {
        type: Number,
        reqquired: true,
      },
      deliverCharges: {
        type: Number,
        reqquired: true,
      },
      platformFee: {
        type: Number,
        reqquired: true,
      },
      totalAmount: {
        type: Number,
        reqquired: true,
      },
    },

    payment: {
      method: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },

    expiredAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

export const order_model = mongoose.model<IOrder>("order", orderSchema);
