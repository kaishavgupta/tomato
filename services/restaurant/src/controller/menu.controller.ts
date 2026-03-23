import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isauth.middleware";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { IMenu, MenuModel } from "../model/menu.model.js";
import { reUpload_service, upload_service } from "../config/utils.apiCaller.js";
import mongoose from "mongoose";

export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const restaurant_id = req?.user?.restaurant_id;
  if (!restaurant_id) {
    return res.status(401).json({
      success: false,
      msg: "Unauthorized user or Restaurant not created",
    });
  }
  const {
    item_name,
    description,
    price,
    discountedPrice,
    category,
    isVeg,
    tags,
    preparationTime,
  } = req.body;

  if (!item_name || !price || !category || !isVeg || !preparationTime) {
    console.log(`All fields are required`);
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      msg: "Food Item Image not found",
    });
  }

  const fileBuffer = await getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(500).json({
      success: false,
      msg: "Failed to create File Buffer",
    });
  }

  const response = await upload_service(fileBuffer);

  const addMenuItem = await MenuModel.create({
    item_name,
    description,
    price: Number(price),
    ...(discountedPrice ? { discountedPrice: Number(discountedPrice) } : {}),
    category,
    isVeg: isVeg === "true" || isVeg === true,

    tags:
      typeof tags === "string"
        ? JSON.parse(tags)
        : Array.isArray(tags)
          ? tags
          : [],
    preparationTime: Number(preparationTime),
    image: {
      url: response.msg.url,
      public_id: response.msg.public_id,
    },
    restaurant_id: restaurant_id,
  });
  if (!addMenuItem) {
    res.status(500).json({
      success: false,
      msg: "Unable to add item , Some Internal Server Error",
    });
    return;
  }
  res.status(201).json({
    success: true,
    msg: "Item added successfully",
  });
});

export const fetchmyMenue = TryCatch(async (req: AuthenticatedRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { restaurantId } = req.params;

  // ── OWNER MODE (seller dashboard) ─────────────────────────────────────
  // /seller route — return flat MenuItem[], no grouping needed
  if (req.user?.role === "restaurant") {
    const sellerId = req.user?.restaurant_id;

    if (!sellerId) {
      return res.status(403).json({
        success: false,
        msg: "Seller account has no associated restaurant.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(sellerId))) {
      return res.status(400).json({ success: false, msg: "Invalid seller restaurant ID" });
    }

    const filter = { restaurant_id: new mongoose.Types.ObjectId(String(sellerId)) };

    const [items, totalItems] = await Promise.all([
      MenuModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('restaurant_id', 'name image location isOpen').lean(),
      MenuModel.countDocuments(filter),
    ]);

    const hasMore = skip + items.length < totalItems;

    return res.status(200).json({
      success: true,
      msg: items,                    // flat MenuItem[] — exactly what ItemCard expects
      pagination: {
        totalItems,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
    });
  }

  // ── PUBLIC RESTAURANT PAGE ─────────────────────────────────────────────
  // /:restaurantId route — also return flat MenuItem[] for the Menu.tsx restaurant view
  if (restaurantId) {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant ID" });
    }

    const filter = { restaurant_id: new mongoose.Types.ObjectId(restaurantId) };

    const [items, totalItems] = await Promise.all([
      MenuModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('restaurant_id', 'name image location isOpen').lean(),
      MenuModel.countDocuments(filter),
    ]);

    const hasMore = skip + items.length < totalItems;

    return res.status(200).json({
      success: true,
      msg: items,
      pagination: {
        totalItems,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      },
    });
  }

  // ── GLOBAL / EXPLORE MODE ──────────────────────────────────────────────
  // GET / route — grouped by restaurant for Home + Menu explore pages
  const pipeline: mongoose.PipelineStage[] = [
    { $match: {} },
    {
      $group: {
        _id: "$restaurant_id",
        items: {
          $push: {
            _id: "$_id",
            item_name: "$item_name",
            price: "$price",
            discountedPrice: "$discountedPrice",
            description: "$description",
            image: "$image",
            category: "$category",
            isVeg: "$isVeg",
            status: "$status",
            tags: "$tags",
            preparationTime: "$preparationTime",
            createdAt: "$createdAt",
          },
        },
        totalItems: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalRestaurants" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          { $addFields: { items: { $slice: ["$items", 10] } } },
          {
            $lookup: {
              from: "restaurants",
              localField: "_id",
              foreignField: "_id",
              as: "restaurantInfo",
            },
          },
          { $unwind: { path: "$restaurantInfo", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              restaurant_id: "$_id",
              name: { $ifNull: ["$restaurantInfo.name", "Unknown"] },
              image: "$restaurantInfo.image",
              location: "$restaurantInfo.location",
              isOpen: "$restaurantInfo.isOpen",
              totalItems: 1,
              items: 1,
            },
          },
        ],
      },
    },
  ];

  const [result] = await MenuModel.aggregate(pipeline);

  const totalRestaurants = result?.metadata[0]?.totalRestaurants ?? 0;
  const restaurants = result?.data ?? [];
  const hasMore = skip + restaurants.length < totalRestaurants;

  return res.status(200).json({
    success: true,
    msg: restaurants,
    pagination: { totalRestaurants, hasMore, nextPage: hasMore ? page + 1 : null },
  });
});

export const deleteItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const restaurant_id = req?.user?.restaurant_id;
  const id = req.params.id;

  if (!restaurant_id) {
    return res.status(401).json({
      success: false,
      msg: "Unauthorized user or Restaurant not created",
    });
  }

  const findItemByIdAndDelete = await MenuModel.findByIdAndDelete(id);

  if (!findItemByIdAndDelete) {
    return res.status(400).json({
      success: false,
      msg: "Item not found",
    });
  }

  res.status(200).json({
    success: true,
    msg: `${findItemByIdAndDelete.item_name} Deleted successfully`,
  });
});

export const updateItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const restaurant_id = req.user?.restaurant_id;
  const { id, public_id } = req.params;
  if (!restaurant_id) {
    //status code 400 for bad request
    return res.status(400).json({
      success: true,
      msg: "Unauthorized access",
    });
  }
  console.log(req.params);

  if (!id) {
    return res.status(400).json({
      success: true,
      msg: "Item not found",
    });
  }

  const updateData = {} as IMenu;

  const {
    item_name,
    description,
    price,
    discountedPrice,
    category,
    isVeg,
    tags,
    preparationTime,
  } = req.body;
  
  if (item_name) updateData.item_name = item_name;
  if (description) updateData.description = description;
  if (price) updateData.price = Number(price);
  if (discountedPrice && !isNaN(Number(discountedPrice)))
    updateData.discountedPrice = Number(discountedPrice);
  if (category) updateData.category = category;
  if(tags){
    let t=[...JSON.parse(tags)];
    updateData.tags=t
  }

  if (isVeg !== undefined)
    updateData.isVeg = isVeg === "true" || isVeg === true;
  if (preparationTime) updateData.preparationTime = Number(preparationTime);

  const file = req.file;

  if (file) {
    const fileBuffer = await getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        success: false,
        msg: "Failed to create File Buffer",
      });
    }
    const response = await reUpload_service(fileBuffer, public_id as string);

    updateData.image = {
      url: response.msg.url,
      public_id: response.msg.public_id,
    };
  }

  const updateItem = await MenuModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!updateItem) {
    return res.status(400).json({
      success: false,
      msg: "Can't Update Your Item",
    });
  }

  return res.status(200).json({
    success: true,
    msg: updateItem,
  });
});

export const pausedItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const restaurant_id = req.user?.restaurant_id;
  if (!restaurant_id) {
    //status code 400 for bad request
    return res.status(400).json({
      success: true,
      msg: "Unauthorized access",
    });
  }
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({
      success: true,
      msg: "Item not found",
    });
  }

  const updateItem = await MenuModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  );

  if (!updateItem) {
    return res.status(400).json({
      success: false,
      msg: "Can't Update Status Your Item",
    });
  }

  return res.status(200).json({
    success: true,
    msg: `Your ${updateItem.item_name} status got updated to ${updateItem.status}`,
  });
});