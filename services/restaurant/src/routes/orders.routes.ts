import { Router } from "express";
import { isAuth } from "../middleware/isauth.middleware.js";
import { create_Order, fetch_allOrder, fetchOrderDetails } from "../controller/order.controller.js";

const routes=Router();

// Create Order's

// POST api/order/create-order
//payload paymentmethod, addressId
routes.route('/create-order').post(isAuth,create_Order)


// It fetches all order's from backend
// GET api/order/get-orders/?page=1
routes.route('/get-All-orders').get(isAuth,fetch_allOrder)


// It fetches particular order details with orderId
// GET api/order/fetch-order-details/?orderId
routes.route('/fetch-order-details').get(isAuth,fetchOrderDetails)

export const Order_route=routes;