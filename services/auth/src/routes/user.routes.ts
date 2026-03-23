
import {Router}  from "express";
import { addUserRole, peakadress, user_profile, userLogin, userUpdateAddress } from "../controller/user.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";


const routes = Router();

// use direct http verb method to avoid any prototype-binding edge cases
routes.post('/login', userLogin);
routes.post('/add_role', isAuth,addUserRole);
routes.get('/user_profile', isAuth,user_profile);

routes.patch('/updateUserAddreess', userUpdateAddress);
routes.get('/peakUserAddress/:userId', peakadress);

export const user_routes = routes;