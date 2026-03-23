import { Router } from "express";
import { deleteService, reUpload, uploadService } from "../controller/cloudinary.controller.js";

const routes = Router();

routes.route("/upload").post(uploadService);

routes.route("/delete/:publicId").delete(deleteService);

routes.route("/update/:publicId").patch(reUpload);

const uploadRoutes = routes;

export default uploadRoutes;
