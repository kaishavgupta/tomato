import { Router } from "express";
import { deleteService, uploadService } from "../controller/cloudinary.controller.js";

const routes = Router();

routes.route("/upload").post(uploadService);

routes.route("/delete/:publicId").delete(deleteService);

const uploadRoutes = routes;

export default uploadRoutes;
