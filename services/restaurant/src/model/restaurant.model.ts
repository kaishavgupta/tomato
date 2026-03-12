import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

enum role {
  user = "user",
  rider = "rider",
  restaurant = "restaurant",
}

export interface IRestaurant extends Document {
  name: string;
  email: string;
  phone: string;
  description?: string;
  ownerId: string;
  image: string;
  role?: role | null;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formatedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
  generateToken: () => string;
}

const RestaurantSchema: Schema<IRestaurant> = new Schema(
  {
    ownerId: {
  type: Schema.Types.ObjectId,
  ref: "user",
  required: true,
},
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "rider", "restaurant"],
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
      required: true,
    },
    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formatedAddress: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

RestaurantSchema.index({ autoLocation: "2dsphere" });

RestaurantSchema.methods.generateToken = function () {
  try {
    const signature = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { user: "restaurant", restaurant_id: this._id, id: this.ownerId },
      signature,
      {
        expiresIn: "15d",
      },
    );
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const restaurant_Model = mongoose.model<IRestaurant>(
  "restaurant",
  RestaurantSchema,
);
