import mongoose, { Document, Schema } from "mongoose";

enum addressType {
  home = "home",
  work = "work",
  other = "other",
}

export interface IUserAddress extends Document {
  userId: mongoose.Types.ObjectId;
  phone: number;
  userAddress: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formatedAddress: string;
    typeOfAddress: addressType;
  };
  isDeleted: boolean;
  isDefault: boolean
}

const addressSchema: Schema<IUserAddress> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    userAddress: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formatedAddress: {
        type: String,
        require: true,
      },
      typeOfAddress: {
        type: String,
        enum: ["home", "work", "other"],
        default: addressType.home,
        required: false,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDefault:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  },
);

addressSchema.index({ userAddress: "2dsphere" })

export const userAddressModel = mongoose.model<IUserAddress>(
  "address",
  addressSchema,
);
