import { Router } from "express";
import { delete_Restaurent, edit_Restaurant, fetchmyRestaurant, loginCreateResturant, openRestaurant, pause_Restaurent } from "../controller/restaurant.controller.js";
import { isAuth, isRestaurant } from "../middleware/isauth.middleware.js";
import uploadFile from "../middleware/multer.middleware.js";
// import {} from "../controller/restaurants.controller.js"

const routes=Router();
routes.route('/new-restaurant').post(isAuth,uploadFile,loginCreateResturant)
routes.route('/my-restaurant').get(isAuth, fetchmyRestaurant)
routes.route('/close-restaurant').post(isAuth, isRestaurant,openRestaurant)
routes.route('/restaurent_update/:public_id').patch(isAuth, isRestaurant,uploadFile,edit_Restaurant)
routes.route('/delete-restaurent').delete(isAuth,isRestaurant,delete_Restaurent)
routes.route('/pause-Restaurent').patch(isAuth,isRestaurant,pause_Restaurent)


export const restaurant_route=routes;