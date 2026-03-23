import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import TryCatch from "../middleware/TryCatch.js";

import { Request, Response, NextFunction } from "express";

export const uploadService = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileBuffer } = req.body;

    const cloud:UploadApiResponse = await cloudinary.uploader.upload(fileBuffer);

    res.json({
      success: true,
      msg: {
        url: cloud.secure_url,
        public_id: cloud.public_id,
      },
    });
  },
);

export const deleteService = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const publicId = req.params.publicId as string;
    console.log(publicId);

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (result.result === "ok") {
        res.status(200).json("Image deleted successfully");
      } else {
        console.error("Error deleting image:", error);
      }
    });
  },
);

export const reUpload = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {imageurlBuffer}=req.body
    const publicId = req.params.publicId as string;
    const result:UploadApiResponse=await cloudinary.uploader.upload(imageurlBuffer, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
    });
     res.json({
      success: true,
      msg: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  },
);
