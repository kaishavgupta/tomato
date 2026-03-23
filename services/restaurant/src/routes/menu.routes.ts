import { Router } from "express";
import { isAuth, isRestaurant } from "../middleware/isauth.middleware.js";
import uploadFile from "../middleware/multer.middleware.js";
import { addMenuItem,deleteItem,fetchmyMenue, pausedItem, updateItem } from "../controller/menu.controller.js";

const routes=Router();
routes.route('/add-menu').post(isAuth,isRestaurant,uploadFile,addMenuItem)

//  Explore: any visitor, no auth required
routes.get("/", fetchmyMenue);


// Seller dashboard: must be logged in AND have the "resturant" role
// GET /api/menu/seller?page=1
// Note: this must be defined BEFORE /:restaurantId or Express matches "seller" as an id
routes.get("/seller",isAuth,isRestaurant,fetchmyMenue);


// Public restaurant page: single restaurant, anyone can view
// GET /api/menu/:restaurantId?page=1
routes.get("/:restaurantId", fetchmyMenue);

routes.route('/delete-menu/:id').delete(isAuth, isRestaurant,deleteItem)
routes.route('/update-menu/:id/:public_id').patch(isAuth, isRestaurant, uploadFile, updateItem)

export const Menue_route=routes;