import { request, Request, response, Response } from "express";
import { IUser, user_Model } from "../model/User.model.js";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { AuthenticatedRequest } from "../middleware/isAuth.middleware.js";
import { updateTokenSetCookie } from "../middleware/updateToken.js";
import {oauth2client} from "../config/google.config.js"
import axios from "axios";
import mongoose from "mongoose";

export const userLogin = TryCatch(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      msg: "Authorization code is required",
    });
  }

  const googleTokens = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleTokens.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleTokens.tokens.access_token}`
  );

  const { name, email, picture } = userRes.data;

  let existingUser = await user_Model.findOne({ email });

  if (!existingUser) {
    existingUser = await user_Model.create({
      name,
      email,
      image: picture,
    });
  }

  updateTokenSetCookie(existingUser as IUser, res);

  return res.json({
    success: true,
    msg: "Login successful",
  });
});

const roles = ["user", "restaurant", "rider"] as const;
type Role = (typeof roles)[number];

export const addUserRole = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Unatuthorised Can't add roles" });
    }

    const { role } = req.body as { role: Role };
    if (!roles.includes(role)) {
      return res.status(401).json({ success: false, msg: "Not allowed" });
    }

    const finduser = await user_Model.findByIdAndUpdate(
      user,
      { role },
      { new: true },
    );

    if (!finduser) {
      return res.status(404).json({
        success: false,
        message: `User not Found`,
      });
    }
    updateTokenSetCookie(finduser as IUser, res);
    res.json({
      success: true,
      msg: "Successfully added role",
    });
  },
);

export const user_profile = TryCatch(async (req: Request, res: Response) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unatuthorised access",
    });
  }
  const userData = await user_Model.findById(user).select({createdAt:0,updatedAt:0,__v
:0});

  res.status(200).json({
    success: true,
    msg: userData,
  });
});


export const userUpdateAddress = TryCatch(
 async (req: Request, res: Response) => {

   const { userId, operation, defaultAddressId } = req.body;
   console.log(userId, operation, defaultAddressId);
   

   if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(400).json({
       success:false,
       msg:"Invalid userId"
     });
   }

   let incValue = 0;

   if (operation === "ADD") incValue = 1;
   if (operation === "DELETE") incValue = -1;

   const updatePayload:any = {
     $inc: { addressCount: incValue }
   };

   // ⭐ update default only if provided
   if (defaultAddressId !== undefined) {
     updatePayload.$set = {
       defaultAddressId: defaultAddressId
     };
   }

   const user = await user_Model.findByIdAndUpdate(
     userId,
     updatePayload,
     { new:true }
   );

   if (!user) {
     return res.status(404).json({
       success:false,
       msg:"User not found"
     });
   }

   return res.status(200).json({
     success:true,
     msg:"User address meta updated",
     data:user
   });

 }
);

export const peakadress=TryCatch(async(req:Request,res:Response)=>{
  const {userId}=req.params;
  if(!mongoose.Types.ObjectId.isValid(userId as string)){
     return res.status(400).json({
       success:false,
       msg:"Invalid userId"
     });
  }

  const findUserAdress=await user_Model.findById(userId).select("defaultAddressId, addressCount")

  if(!findUserAdress){
    return res.status(500).json({
      success:false,
      msg:"Internal auth service server error"
    })
  }

  res.status(200).json({
    success:true,
    msg:findUserAdress
  })
})