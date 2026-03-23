import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/isauth.middleware";
import TryCatch from "../middleware/tryCatch.middleware.js";
import {  userAddressModel } from "../model/Address.model.js";
import {
  peakadress_service,
  userAddress_service,
} from "../config/utils.apiCaller.js";

/* =====================================================
   CREATE ADDRESS
===================================================== */

export const adduserAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id as string;

    const {
      phone,
      latitude,
      longitude,
      formatedAddress,
      typeOfAddress,
      setdefault,
    } = req.body;

    if (!phone || !latitude || !longitude || !formatedAddress) {
      return res.status(400).json({
        success: false,
        msg: "All fields required",
      });
    }

    console.log("Hello 1");

    // ⭐ get user meta from auth service
    const userMeta = await peakadress_service(userId);

    console.log("Hello 2", userMeta);

    let makeDefault = false;

    if (userMeta?.msg?.addressCount === 0) {
      makeDefault = true;
    }

    if (setdefault) {
      makeDefault = true;
    }

    // ⭐ if new default → reset old defaults first
    if (makeDefault) {
      await userAddressModel.updateMany(
        { userId, isDeleted: false },
        { $set: { isDefault: false } },
      );
    }

    const address = await userAddressModel.create({
      userId,
      phone,
      userAddress: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formatedAddress,
        typeOfAddress,
      },
      isDefault: makeDefault,
    });

    const addressId = JSON.stringify(address._id);

    // ⭐ sync auth service
    await userAddress_service(userId, addressId as string, "ADD");

    return res.status(201).json({
      success: true,
      msg: "Address added",
      data: address,
    });
  },
);

/* =====================================================
   FETCH USER ADDRESSES
===================================================== */

export const fetchUserAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id as string;

    const addresses = await userAddressModel
      .find({
        userId,
        isDeleted: false,
      })
      .sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  },
);

/* =====================================================
   DELETE ADDRESS
===================================================== */

export const removeUserAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id as string;
    const addressId = req.query.addressId as string;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid addressId",
      });
    }

    const address = await userAddressModel.findOneAndUpdate(
      {
        _id: addressId,
        userId,
        isDeleted: false,
      },
      {
        $set: { isDeleted: true },
      },
      { new: true },
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        msg: "Address not found",
      });
    }

    let fallbackDefault: any = undefined;

    // ⭐ if deleted was default → pick fallback
    if (address.isDefault) {
      const fallback = await userAddressModel
        .findOne({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .select("_id");

      if (fallback) {
        fallbackDefault = fallback._id;

        await userAddressModel.findByIdAndUpdate(fallback._id, {
          $set: { isDefault: true },
        });
      } else {
        fallbackDefault = null;
      }
    }

    // ⭐ sync auth service always (count must reduce)
    await userAddress_service(userId, fallbackDefault, "DELETE");

    return res.status(200).json({
      success: true,
      msg: "Address removed",
    });
  },
);

/* =====================================================
   SET DEFAULT ADDRESS
===================================================== */

export const setDefaultAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id as string;
    const addressId = req.body.addressId as string;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid addressId",
      });
    }

    // ⭐ reset all defaults
    await userAddressModel.updateMany(
      { userId, isDeleted: false },
      { $set: { isDefault: false } },
    );

    const address = await userAddressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: { isDefault: true } },
      { new: true },
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        msg: "Address not found",
      });
    }

    // ⭐ sync auth service
    await userAddress_service(
      userId,
      address._id,
      "ADD", // ⭐ only default change (count unchanged but ok for simple api)
    );

    return res.status(200).json({
      success: true,
      msg: "Default address updated",
    });
  },
);

/* =====================================================
   UPDATE ADDRESS
===================================================== */


type UpdateAddressPayload = {
  phone?: string;
  "userAddress.coordinates"?: number[];
  "userAddress.formatedAddress"?: string;
  "userAddress.typeOfAddress"?: string;
  isDefault?: boolean;
};

export const updateAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id as string;

    const addressId = req.body.addressId as string;

    const {
      phone,
      latitude,
      longitude,
      formatedAddress,
      typeOfAddress,
      setdefault,
    } = req.body;

    const updateDetails = {} as UpdateAddressPayload;

    if (phone) updateDetails.phone = phone;
    if (latitude && longitude) {
      updateDetails["userAddress.coordinates"] = [
        Number(longitude), // ⭐ correct order
        Number(latitude),
      ];
    }
    if (formatedAddress)
      updateDetails["userAddress.formatedAddress"] = formatedAddress;
    if (typeOfAddress) updateDetails["userAddress.typeOfAddress"] = typeOfAddress;
    if (setdefault) {
         await userAddressModel.updateMany(
                    { userId, isDeleted: false },
                    { $set: { isDefault: false } },
            );
        updateDetails.isDefault=setdefault
    }

 const updateUserAddress = await userAddressModel.findByIdAndUpdate(
      { _id: addressId, userId, isDeleted: false }, 
      {$set:updateDetails},
      { new: true ,runValidators: true},
    );

     if (!updateUserAddress) {
      return res.status(404).json({
        success: false,
        msg: "Address not found",
      });
    }
    return res.status(200).json({
      success:true,
      msg:"Address Updated successfully"
    })
  },
);
