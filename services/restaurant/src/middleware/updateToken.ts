import { IRestaurant } from "../model/restaurant.model";
import { Response } from "express";

export const updateTokenSetCookie=(restaurent:IRestaurant,res:Response)=>{
    let token:string=restaurent.generateToken();
    token=`Bearer ${token}`
    res.cookie("Tomato_user", token, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "lax"
    });    

    return token
}
export const updateTokenSetCookie2=(restaurent:IRestaurant,res:Response)=>{
    let token:string=restaurent.generateTokenDelete();
    token=`Bearer ${token}`
    res.cookie("Tomato_user", token, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "lax"
    });    

    return token
}

export const clearCookie=(res:Response)=>{
  res.clearCookie(`Tomato_user`)
}