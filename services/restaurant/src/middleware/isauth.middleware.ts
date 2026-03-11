import { Response, NextFunction, Request, json } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.Tomato_restaurant as string;
    if (!token) {
      res.status(401).json({
        success: false,
        msg: "Unauthorized Access Token",
      });
      return;
    }
    const parts = token.split(" ");

    if (parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        secure: false,
        msg: "Invalid Token",
      });
      return;
    }
    const decodeUser = jwt.verify(
      token.split(" ")[1] as string,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    req.user = {
      _id: decodeUser.id,
      role: decodeUser.user,
    };
    next();
  } catch (error) {
    console.log(error);
  }
};

export const isRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const role = req?.user?.role;

  if (role !== "restaurant") {
    res.status(401).json({
      success: false,
      msg: "You are Unauthorized seller",
    });
    return;
  } else {
    next();
  }
};
