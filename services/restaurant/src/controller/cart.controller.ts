import mongoose from "mongoose";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { AuthenticatedRequest } from "../middleware/isauth.middleware.js";
import { cartModel, ICart } from "../model/cart.model.js";
import { restaurant_Model } from "../model/restaurant.model.js";
import { MenuModel } from "../model/menu.model.js";

// ── Add item / increment quantity ─────────────────────────────────────────────
export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {

  const userId = req.user?._id;
  const { restaurantId, itemId } = req.params; 
  console.log(itemId);
  

  const item = await MenuModel.findById(itemId);
  if (!item) {
    return res.status(404).json({ success:false, msg:"Item not found" });
  }

  const restaurant = await restaurant_Model.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ success:false, msg:"Restaurant not found" });
  }

  const effectivePrice =
    item.discountedPrice as number > 0 ? Number(item.discountedPrice) : Number(item.price);

  let cart = await cartModel.findOne({userId})

  // ⭐ cart exists but different restaurant
  if (cart && cart.restaurantId.toString() !== restaurantId) {
    return res.status(409).json({
      success:false,
      msg:"Cart contains items from another restaurant",
    });
  }

  // ⭐ create cart first time
  if (!cart) {
    cart = await cartModel.create({
      userId:userId,
      restaurantId: restaurantId,
      restaurant: {
        name: restaurant.name,
        logo: restaurant.image?.url,
      },
      items: [],
      totalAmount: 0,
      totalQty: 0,
    });
  }

  // ⭐ check item already in cart
  const existingItem = cart.items.find(
    (i) => i.itemId.toString() === itemId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      itemId,
      name: item.item_name,
      price: effectivePrice,
      quantity: 1,
    });
  }

  // ⭐ recompute totals (very important)
  cart.totalAmount = cart.items.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  cart.totalQty = cart.items.reduce(
    (acc, i) => acc + i.quantity,
    0
  );

  await cart.save();

  return res.status(200).json({
    success:true,
    msg:cart,
  });

});

// ── Update quantity of a specific item ────────────────────────────────────────
export const updateCartQuantity = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const userId = req.user?._id as string;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success:false,
        msg:"Unauthorized"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success:false,
        msg:"Invalid itemId"
      });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({
        success:false,
        msg:"Quantity must be ≥ 1"
      });
    }

    const cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success:false,
        msg:"Cart not found"
      });
    }

    const item = cart.items.find(
      (i) => i.itemId.toString() === itemId
    );

    if (!item) {
      return res.status(404).json({
        success:false,
        msg:"Item not present in cart"
      });
    }

    // ⭐ update quantity
    item.quantity = quantity;

    // ⭐ recompute totals (never incremental)
    cart.totalAmount = cart.items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    cart.totalQty = cart.items.reduce(
      (acc, i) => acc + i.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      success:true,
      cart
    });

  }
);

// ── Remove a single item from cart ────────────────────────────────────────────
export const removeCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const userId = req.user?._id as string;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success:false,
        msg:"Unauthorized"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success:false,
        msg:"Invalid itemId"
      });
    }

    const cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success:false,
        msg:"Cart not found"
      });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.itemId.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success:false,
        msg:"Item not present in cart"
      });
    }

    // ⭐ remove item
    cart.items.splice(itemIndex, 1);

    // ⭐ if cart becomes empty → delete whole cart
    if (cart.items.length === 0) {
      await cartModel.deleteOne({ _id: cart._id });
      return res.json({
        success:true,
        msg:"Cart cleared"
      });
    }

    // ⭐ recompute totals
    cart.totalAmount = cart.items.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    cart.totalQty = cart.items.reduce(
      (acc, i) => acc + i.quantity,
      0
    );

    await cart.save();

    return res.json({
      success:true,
      cart
    });

  }
);

// ── Clear entire cart ─────────────────────────────────────────────────────────
export const clearCart = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const userId = req.user?._id as string;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success:false,
        msg:"Unauthorized"
      });
    }

    const deleted = await cartModel.findOneAndDelete({ userId });

    if (!deleted) {
      return res.status(404).json({
        success:false,
        msg:"Cart already empty"
      });
    }

    return res.json({
      success:true,
      msg:"Cart cleared"
    });

  }
);

// ── View cart ─────────────────────────────────────────────────────────────────
export const viewCart = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const userId = req.user?._id as string;

    if (!userId) {
      return res.status(401).json({
        success:false,
        msg:"Unauthorized"
      });
    }

    const cart = await cartModel.findOne({ userId }).populate('restaurantId','isOpen').populate('items.itemId','image.url');

    if (!cart) {
      return res.status(200).json({
        success:true,
        cart:null,
        msg:"Cart empty"
      });
    }

    return res.status(200).json({
      success:true,
      msg:cart
    });

  }
);