import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

enum role {
  "user",
  "rider",
  "restaurant",
}

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  role?: role | null;
  defaultAddressId?:string;
  addressCount?:number;
  generateToken: () => string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
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
    defaultAddressId:{
      type:String,
      required:false
    },
    addressCount:{
      type:Number,
      default:0
    }
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.generateToken = function () {
  try {
    const signature = process.env.JWT_SECRET as string;
    const token = jwt.sign({ user: this.role, id: this._id }, signature, {
      expiresIn: "15d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const user_Model = mongoose.model<IUser>("user", UserSchema);
