import { Response, NextFunction, Request, json } from "express";
import { IUser } from "../model/User.model";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.Tomato_user as string;
    if (!token) {
      res.status(401).json({
        success: false,
        msg: "Unauthorized Access Token",
      });
      return;
    }
    const parts=token.split(" ")
    
    if (parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        secure:false,
        msg: "Invalid Token",
      });
      return;
    }
    const decodeUser = jwt.verify(
      token.split(" ")[1] as string,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;    
    req.user = decodeUser.id;
    next();
  } catch (error) {
    console.log(error);
  }
};
