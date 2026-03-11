import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";

const routes = Router();

routes.route("/upload").post(async (req, res) => {
  try {
    const {buffer} =req.body;
    const cloud=await cloudinary.uploader
      .upload(buffer)
      .then((result) => console.log(result));

      res.json({url:cloud.secure_url})

  } catch (error) {

  }
});

const uploadRoutes=routes;

export default uploadRoutes