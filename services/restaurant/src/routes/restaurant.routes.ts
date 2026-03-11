import { Router } from "express";
import { loginResturant } from "../controller/restaurant.controller.js";
import { isAuth, isRestaurant } from "../middleware/isauth.middleware.js";
// import {} from "../controller/restaurants.controller.js"

const routes=Router();
routes.route('/new').post(isAuth,isRestaurant,loginResturant)

export const restaurant_route=routes;