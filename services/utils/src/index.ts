import express  from "express";
import dotenv from "dotenv"
import cloudinary from "cloudinary"
import cors from 'cors';
import uploadRoutes from "./routes/cloudinary.routes";

dotenv.config()

const app =express()

app.use(cors());

app. use(express. json({ limit: "50mb" }));
app.use(express. urlencoded({ limit: "50mb", extended: true }) );

const PORT = process.env.PORT || 3005;


const CLOUD_NAME = process.env.CLOUD_NAME
const CLOUD_API_KEY= process.env.CLOUD_API_KEY
const CLOUD_SECRET_KEY=process.env.CLOUD_SECRET_KEY



if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  throw new Error( `CLOUDINARY Not getting environement variables`)
}

cloudinary.v2.config({
  cloud_name:CLOUD_NAME,
  api_key:CLOUD_API_KEY,
  api_secret:CLOUD_SECRET_KEY
})

app.use('/api',uploadRoutes)

app.listen(PORT, async () => {
  try {
    console.log(`App is running on http://localhost:${PORT}/`);
  } catch (error) {
    console.log(`Error from index.ts ${error}`);
  }
});