import { Router } from "express";
import { isAuth } from "../middleware/isauth.middleware.js";
import {
  addToCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  viewCart,
} from "../controller/cart.controller.js";

const routes = Router();

// POST   /api/cart/add/:restaurantid/:ItemId      — add item (increments qty if exists)
routes.route("/add/:restaurantId/:itemId").post(isAuth, addToCart);

// PATCH  /api/cart/quantity/:itemId               — set exact quantity  { quantity: number }
routes.route("/quantity/:itemId").patch(isAuth, updateCartQuantity);

// DELETE /api/cart/remove/:itemId                 — remove one item
routes.route("/remove/:itemId").delete(isAuth, removeCartItem);

// DELETE /api/cart/clear                          — wipe entire cart
routes.route("/clear").delete(isAuth, clearCart);

// GET    /api/cart/viewcart                       — fetch full cart (populated)
routes.route("/viewcart").get(isAuth, viewCart);

export const Cart_route = routes;