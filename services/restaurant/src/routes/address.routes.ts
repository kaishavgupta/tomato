import { Router } from "express";
import { isAuth } from "../middleware/isauth.middleware.js";

import {
  adduserAddress,
  fetchUserAddress,
  removeUserAddress,
  setDefaultAddress,
  updateAddress
} from "../controller/Address.controller.js";

const routes = Router();

/* ===============================
   CREATE ADDRESS
=============================== */
routes.post(
  "/add",
  isAuth,
  adduserAddress
);

/* ===============================
   FETCH ALL USER ADDRESSES
=============================== */
routes.get(
  "/my",
  isAuth,
  fetchUserAddress
);

/* ===============================
   DELETE ADDRESS
=============================== */
routes.delete(
  "/remove",
  isAuth,
  removeUserAddress
);

/* ===============================
   SET DEFAULT ADDRESS
=============================== */
routes.patch(
  "/set-default",
  isAuth,
  setDefaultAddress
);


/* ===============================
   SET UPDATE ADDRESS
=============================== */

routes.put("/update-address",isAuth,updateAddress)

export const address_routes = routes;