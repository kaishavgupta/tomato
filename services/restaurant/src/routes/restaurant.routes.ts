import { Router } from "express";
import { fetchmyRestaurant, loginCreateResturant, openRestaurant } from "../controller/restaurant.controller.js";
import { isAuth, isRestaurant } from "../middleware/isauth.middleware.js";
import uploadFile from "../middleware/multer.middleware.js";
// import {} from "../controller/restaurants.controller.js"

const routes=Router();
routes.route('/new-restaurant').post(isAuth,isRestaurant,uploadFile,loginCreateResturant)
routes.route('/my-restaurant').get(isAuth, fetchmyRestaurant)
routes.route('/close-restaurant').post(isAuth, isRestaurant,openRestaurant)

export const restaurant_route=routes;