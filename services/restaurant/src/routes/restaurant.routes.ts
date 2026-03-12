import { Router } from "express";
import { fetchmyRestaurant, loginResturant } from "../controller/restaurant.controller.js";
import { isAuth, isRestaurant } from "../middleware/isauth.middleware.js";
// import {} from "../controller/restaurants.controller.js"

const routes=Router();
routes.route('/new-restaurant').post(isAuth,isRestaurant,loginResturant)
routes.route('/my-restaurant').get(isAuth, fetchmyRestaurant)

export const restaurant_route=routes;