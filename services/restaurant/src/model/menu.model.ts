import mongoose, { Document, Schema, Types } from "mongoose";

type ItemStatus = "available" | "paused" | "out_of_stock";

const CATEGORIES = [
  "Starters",
  "Main Course",
  "Breads",
  "Rice & Biryani",
  "Desserts",
  "Beverages",
  "Soups",
  "Salads",
  "Snacks",
  "Combos",
];

export type CATEGORIES = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export interface IMenu extends Document {
  restaurant_id: Types.ObjectId;
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
  isPaused: boolean;
}

const MenuSchema: Schema<IMenu> = new Schema(
  {
    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },

    item_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [50, "Price cannot be less than ₹50"],
    },

    discountedPrice: {
      type: Number,
      required: false,
      // Works for Model.create() and .save() — `this` is the document
      validate: {
        // During findByIdAndUpdate, `this` is the Query — not the document.
        // We skip here and let the pre("findOneAndUpdate") hook handle that case.
        validator: function (this: any, value: number) {
          if (this instanceof mongoose.Query) return true;
          return value < this.price;
        },
        message: "Discounted price must be less than actual price",
      },
    },

    category: {
      type: String,
      required: true,
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

    isVeg: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "paused", "out_of_stock"],
      default: "available",
    },

    preparationTime: {
      type: Number,
      default: 20,
    },

    tags: [
      {
        type: String,
      },
    ],
    isPaused: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


MenuSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Partial<IMenu> | null;
  if (!update) return next;

  const incomingDiscounted = (update as any).$set?.discountedPrice ?? (update as any).discountedPrice;
  const incomingPrice      = (update as any).$set?.price           ?? (update as any).price;

  // Only validate when discountedPrice is part of this update
  if (incomingDiscounted === undefined) return next;

  // Resolve the effective price: prefer the value being set in this update,
  // otherwise fall back to what's already stored in the document.
  let effectivePrice = incomingPrice;
  if (effectivePrice === undefined) {
    const docId = this.getQuery()._id;
    const existing = await MenuModel.findById(docId).select("price").lean();
    effectivePrice = existing?.price;
  }

  if (effectivePrice !== undefined && Number(incomingDiscounted) >= Number(effectivePrice)) {
    throw(new Error("Discounted price must be less than actual price"));
    return next
  }

  return;
});

export const MenuModel = mongoose.model<IMenu>("menu", MenuSchema);