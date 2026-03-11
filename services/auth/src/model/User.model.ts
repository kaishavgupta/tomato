import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

enum role {
  user = "user",
  rider = "rider",
<<<<<<< HEAD
  resturant = "resturant",
=======
  restaurant = "restaurant",
>>>>>>> my-current-work
}

export interface IUser extends Document {
  name:string;
  email: string;
  image: string;
  role?: role|null;
  generateToken:()=>string;

}

const UserSchema: Schema<IUser> = new Schema(
  {
    name:{
      type:String,
      required:true
    },
    email: {
      type: String,
      unique:true,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ["user", "rider", "resturant"],
=======
      enum: ["user", "rider", "restaurant"],
>>>>>>> my-current-work
      default:null
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.generateToken=function(){
  try {
    const signature=process.env.JWT_SECRET as string
     const token =  jwt.sign({user:this.role,id:this._id},signature,{
        expiresIn:'15d'
    });
    return token
  } catch (error) {
    console.log(error);
  }
}

export const user_Model = mongoose.model<IUser>("user", UserSchema);
