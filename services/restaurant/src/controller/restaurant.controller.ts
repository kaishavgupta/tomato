import axios, { AxiosResponse } from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isauth.middleware.js";
import TryCatch from "../middleware/tryCatch.middleware.js";
import { IRestaurant, restaurant_Model } from "../model/restaurant.model.js";
import DataURIParser from "datauri/parser.js";
import {
  delete_service,
  reUpload_service,
  upload_service,
} from "../config/utils.apiCaller.js";
import {
  clearCookie,
  updateTokenSetCookie,
  updateTokenSetCookie2,
} from "../middleware/updateToken.js";
import { log } from "console";

interface UploadServiceResponse {
  success: boolean;
  msg: {
    url: string;
    public_id: string;
  };
}

export const loginCreateResturant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const role = req.user?.role;
    if (!user || !role) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized user or Selected role is not restaurant",
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

    const {
      name,
      email,
      description,
      latitude,
      longitude,
      formatedAddress,
      phone,
    } = req.body;

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

    const fileBuffer: DataURIParser = await getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        success: false,
        msg: "Failed to create File Buffer",
      });
    }

    const response = await upload_service(fileBuffer);

    const restaurant_created = await restaurant_Model.create({
      name,
      email,
      description,
      phone,
      image: {
        url: response.msg.url,
        public_id: response.msg.public_id,
      },
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formatedAddress,
      },
    });
    updateTokenSetCookie(restaurant_created as IRestaurant, res);
    res.status(201).json({
      success: true,
      msg: "Restaurant added successfully",
    });
  },
);

export const fetchmyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const id = req.user?._id;

    if (!id) {
      return res.status(401).json({
        success: true,
        msg: "Unauthorized user or Restaurant not created",
      });
    }

    const findResturant = await restaurant_Model.findOne({ ownerId: id });
    if (findResturant) {
      updateTokenSetCookie(findResturant as IRestaurant, res);
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

export const openRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    console.log("IM openRestaurant controller");
    
    const { open } = req.query;
    console.log(open);
    
    const restaurant_id = req.user?.restaurant_id;

    const findResturant = await restaurant_Model.findById(restaurant_id);

    if (!findResturant) {
      return res.status(401).json({
        success: false,
        msg: "Restaurant Not found",
      });
    }

    // If restaurant is not verified
    if (!findResturant.isVerified) {
      return res.status(401).json({
        success: false,
        msg: "Your Restaurant is not verified yet",
      });
    }

    if (findResturant.pauseRestaurent) {
      return res.status(401).json({
        success: false,
        msg: "Your Restaurant is Currently Paused By you Please Activate it in Settings",
      });
    }
    const openClose = await restaurant_Model.findByIdAndUpdate(
      restaurant_id,
      { isOpen: open },
      { new: true, runValidators: true },
    );

    if (openClose?.isOpen) {
      return res.status(200).json({
        success: true,
        msg: "Your restaurant is Open Now",
      });
    } else {
      return res.status(200).json({
        success: true,
        msg: "Your restaurant is Closed Now",
      });
    }
  },
);

export const edit_Restaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const restaurant_id = req.user?.restaurant_id;

    if (!restaurant_id) {
      //status code 400 for bad request
      return res.status(400).json({
        success: true,
        msg: "Unauthorized user or Restaurant not created",
      });
    }

    const public_id=req.params.public_id
    const { name, phone, email, description,cusiene } = req.body;
    const file = req.file;
    const updateData = {} as IRestaurant;

    if (file) {
      const fileBuffer = await getBuffer(file);

      if (!fileBuffer?.content) {
        return res.status(500).json({
          success: false,
          msg: "Failed to create File Buffer",
        });
      }
      const response = await reUpload_service(
        fileBuffer,
        public_id as string,
      );

      updateData.image = {
        url: response.msg.url,
        public_id: response.msg.public_id,
      };
    }

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (description) updateData.description = description;
    if (cusiene) updateData.cusiene = cusiene;

    const updateRestaurant = await restaurant_Model.findByIdAndUpdate(
      restaurant_id,
      { $set: updateData },
      { new: true ,runValidators: true},
    );

    if (!updateRestaurant) {
      return res.status(400).json({
        success: false,
        msg: "Can't Update Your Restaurant",
      });
    }
    return res.status(200).json({
      success: true,
      msg: updateRestaurant,
    });
  },
);



export const delete_Restaurent = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const restaurant_id = req?.user?.restaurant_id;
    console.log(restaurant_id);
    

    if (!restaurant_id) {
      //status code 400 for bad request
      return res.status(400).json({
        success: false,
        msg: "Unauthorized user or Restaurant not Found",
      });
    }

    
    
    
    const delete_Restaurent =
    await restaurant_Model.findByIdAndDelete(restaurant_id);

    const deleteImage = await delete_service(delete_Restaurent?.image.public_id as string);

    if (!deleteImage) {
      return res.status(400).json({
        success: false,
        msg: "Cant't Delete Restaurent Image",
      });
    }
    
    if (!delete_Restaurent) {
      return res.status(401).json({
        success: false,
        msg: "Restaurant not Found or Already Deleted",
      });
    }
    clearCookie(res);
    updateTokenSetCookie2(delete_Restaurent, res);
    return res.status(200).json({
      success: true,
      msg: "Your restaurent is Permananetly Deleted from our DataBase",
    });
  },
);

export const pause_Restaurent = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const restaurant_id = req?.user?.restaurant_id;
    const { pauseRestaurent } = req.body;
    if (!restaurant_id) {
      //status code 400 for bad request
      return res.status(400).json({
        success: false,
        msg: "Unauthorized user or Restaurant not Found",
      });
    }

    const findByIdAndUpdate = await restaurant_Model.findByIdAndUpdate(
      restaurant_id,
      { pauseRestaurent: pauseRestaurent },
      { new: true, runValidators: true },
    );

    if (!findByIdAndUpdate) {
      return res.status(400).json({
        success: false,
        msg: "Your Restaurant is either Deleted or Not Existed",
      });
    }

    res.status(200).json({
      success: true,
      msg: `Your Restaurant is ${findByIdAndUpdate.pauseRestaurent ? "Pause" : "Resume"}`,
    });
  },
);
