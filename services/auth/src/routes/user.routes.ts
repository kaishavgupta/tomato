import express  from "express";
import { addUserRole, user_profile, userLogin } from "../controller/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";


const routes = express.Router();

// use direct http verb method to avoid any prototype-binding edge cases
routes.post('/login', userLogin);
routes.post('/add_role', isAuth,addUserRole);
routes.get('/user_profile', isAuth,user_profile);

export const user_routes = routes;