import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isauth.middleware.js";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { restaurant_Model } from "../model/restaurant.model.js";

export const loginResturant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user",
      });
    }

    // `user` is now definitely defined, so `_id` is a string
    const existingRestaurant = await restaurant_Model.findOne({
      ownerId: user._id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        msg: "You Already have a restaurant",
      });
    }

    const { name, email , description, latitude, longitude, formatedAddress, phone } =
      req.body;

    if (!name || !latitude || !longitude || !phone || !email) {
      return res.status(400).json({
        succcess: false,
        msg: "Please give all details",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        msg: "Restaurant Image not found",
      });
    }

    const fileBuffer = await getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        success: false,
        msg: "Failed to create File Buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const restaurant_created =await restaurant_Model.create({
      name,
      email,
      description,
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formatedAddress,
      },
    });
    const token = await restaurant_created.generateToken();
    res.cookie("Tomato_user", token, {
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(201).json({
      success: true,
      msg: "Restaurant added successfully",
    });
  },
);

export const fetchmyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    // pull the id first and bail out if the user is missing
    const id = req.user?._id;
    if (!id) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user",
      });
    }

    const findResturant = await restaurant_Model.findOne({ ownerId: id });
    if (findResturant) {
      return res.status(200).json({
        success: true,
        msg: findResturant,
      });
    }

    return res.status(400).json({
      success: false,
      msg: "Invalid Restaurant or restaurant not found",
    });

  },
);
