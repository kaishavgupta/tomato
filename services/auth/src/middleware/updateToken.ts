import { IUser } from "../model/User.model";
import { Response } from "express";

export const updateTokenSetCookie=(user:IUser,res:Response)=>{
    let token:string=user.generateToken();
    token=`Bearer ${token}`
    res.cookie("Tomato_user", token, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "lax"
    });    

    return token
}