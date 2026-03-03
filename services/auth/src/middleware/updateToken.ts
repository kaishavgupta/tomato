import { IUser } from "../model/User.model";

export const updateTokenSetCookie=(user:IUser,res:Response)=>{
    let token:string=user.generateToken();
    token=`Bearer ${token}`
    res.cookie("user", token, {
      maxAge: 90000000,
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    return token
}