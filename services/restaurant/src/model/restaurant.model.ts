import jwt from "jsonwebtoken";
import mongoose, { Document, Schema, Types } from "mongoose";

enum role {
  user = "user",
  rider = "rider",
  restaurant = "restaurant",
}

enum cusiene {
  Indian = "Indian",
  Chinese = "Chinese",
  Italian = "Italian",
  Mexican = "Mexican",
  Japanese = "Japanese",
  Thai = "Thai",
  American = "American",
  Mediterranean = "Mediterranean",
  Korean = "Korean",
}

enum CATEGORIES {
  Starters = "Starters",
  Main_Course = "Main Course",
  Breads = "Breads",
  Rice_Biryani = "Rice & Biryani", // Note: Avoid spaces/special chars in keys
  Desserts = "Desserts",
  Beverages = "Beverages",
  Soups = "Soups",
  Salads = "Salads",
  Snacks = "Snacks",
  Combos = "Combos",
}

export interface IRestaurant extends Document {
  name: string;
  email: string;
  phone: string;
  description?: string;
  ownerId: Types.ObjectId;
  image: { url: string; public_id: string };
  role?: role | null;
  cusiene?: cusiene;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formatedAddress: string;
  };
  pauseRestaurent:boolean
  isOpen: boolean;
  createdAt: Date;
  generateToken: () => string;
  generateTokenDelete:()=>string
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
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["user", "rider", "restaurant"],
      default: null,
    },
    cusiene: {
      type: String,
      enum: [
        "Indian",
        "Chinese",
        "Italian",
        "Mexican",
        "Japanese",
        "Thai",
        "American",
        "Mediterranean",
        "Korean",
      ],
      default:cusiene.Indian,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    pauseRestaurent:{
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
RestaurantSchema.methods.generateTokenDelete = function () {
  try {
    const signature = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { user: "restaurant", id: this.ownerId },
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
