import { Request, response, Response } from "express";
import { IUser, user_Model } from "../model/User.model.js";
import TryCatch from "../middleware/tryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { updateTokenSetCookie } from "../middleware/updateToken.js";
import {oauth2client} from "../config/google.config.js"
import axios from "axios";

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

const roles = ["user", "resturant", "rider"] as const;
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
    res.status(401).json({
      success: false,
      message: "Unatuthorised access",
    });
  }
  const userData = await user_Model.findById(user);

  res.status(200).json({
    success: true,
    msg: userData,
  });
});
