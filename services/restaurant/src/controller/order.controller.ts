import { Mongoose } from "mongoose";
import { AuthenticatedRequest } from "../middleware/isauth.middleware.js";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { cartModel, ICartItem } from "../model/cart.model.js";
import { userAddressModel } from "../model/Address.model.js";
import { haversineKm } from "../config/haversineKm.js";
import { IRestaurant, restaurant_Model } from "../model/restaurant.model.js";
import {
  IOrder,
  order_model,
  orderRestaurentType,
} from "../model/orders.model.js";

export const create_Order = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const { paymentmethod, addressId } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      msg: "Unauthorized user",
    });
  }

  if (!addressId) {
    return res.status(400).json({
      success: false,
      msg: "No address selected",
    });
  }

  const cartItemsdb = await cartModel
    .findOne({ userId })
    .populate("restaurantId")
    .populate({
      path: "items.itemId",
      select: "image itemName price",
    });

  if (!cartItemsdb || cartItemsdb.items.length === 0) {
    return res.status(400).json({
      success: false,
      msg: "Cart is empty",
    });
  }

  const cartItems = cartItemsdb.items;

  const userAddress = await userAddressModel.findById(addressId);

  if (!userAddress || userAddress.isDeleted) {
    return res.status(400).json({
      success: false,
      msg: "Invalid address",
    });
  }

  const [userLng, userLat] = userAddress.userAddress.coordinates || [0, 0];

  const restaurantDoc: any = cartItemsdb.restaurantId;

  const [restLng, restLat] = restaurantDoc?.autoLocation?.coordinates || [0, 0];

  const kmRaw = haversineKm(userLat, userLng, restLat, restLng);

  const km = Number(kmRaw.toFixed(1));

  const deliveryfee = Math.min(80, Math.round((20 + km * 8) / 5) * 5);

  const platformFee = 2;

  const subtotal = cartItemsdb.items.reduce(
    (acc: number, i: ICartItem) => acc + i.price * i.quantity,
    0,
  );

  const totalAmount = subtotal + deliveryfee + platformFee;

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

  // ⭐ fetch only image url string
  const restaurantImageDoc = await restaurant_Model
    .findById(restaurantDoc._id)
    .select("image.url");

  const restaurantPayload = {
    restaurentId: String(restaurantDoc._id),

    restaurent_name: restaurantDoc.name,

    restaurent_image: restaurantImageDoc?.image?.url || "",

    restaurantPhone: restaurantDoc.phone,

    restaurentLocation: {
      addressId: String(restaurantDoc._id),
      coordinates: restaurantDoc?.autoLocation?.coordinates || [0, 0],
      formatedAddress: restaurantDoc?.autoLocation?.formatedAddress || "",
    },
  };

  const order = await order_model.create({
    user: {
      userId: String(userId),
      userPhone: String(userAddress.phone),
      userLocation: {
        addressId: String(addressId),
        coordinates: [userLng, userLat],
        formatedAddress: userAddress.userAddress.formatedAddress,
      },
    },

    restaurent: restaurantPayload,

    item: cartItemsdb.items.map((i: ICartItem) => ({
      itemId: String(i.itemId),
      itemName: i.name, // ⭐ correct field
      quantity: i.quantity,
      price: i.price,
      item_image:i.itemId?.image?.url || "",
    })),

    bill: {
      subtotal,
      deliverCharges: deliveryfee,
      platformFee,
      totalAmount,
    },

    payment: {
      method: paymentmethod,
      status: "pending",
    },

    orderstatus: "placed",

    expiredAt,
  });

  await cartModel.findByIdAndDelete(cartItemsdb._id);

  return res.status(200).json({
    success: true,
    msg: order,
  });
});

export const fetchOrderDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req?.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user or Restaurant not created",
      });
    }

    const { orderId } = req.query;

    const order = await order_model.findById(orderId);

    if (order) {
      return res.status(200).json({
        success: false,
        msg: "order not found or get's expired",
      });
    }

    res.status(200).json({
      success: false,
      msg: order,
    });
  },
);

export const fetch_allOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user or Restaurant not created",
      });
    }

    const [fetch_Orders, totalOrders] = await Promise.all([
      order_model
        .find({ "user.userId": String(userId) })
        .select("user restaurent item bill payment orderstatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      order_model.countDocuments({ "user.userId": String(userId) }),
    ]);
    const hasMore = skip + fetch_Orders.length < totalOrders;
    if (fetch_Orders?.length == 0) {
      return res.status(400).json({
        success: false,
        msg: "Cant fetch orders",
      });
    }

    return res.status(200).json({
      success: true,
      msg: fetch_Orders, // flat MenuItem[] — exactly what ItemCard expects
      pagination: {
        totalOrders,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
    });
  },
);
