import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.restaurant.js";
import { restaurant_route } from "./routes/restaurant.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const app = express();
// parse JSON and urlencoded request bodies
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", restaurant_route);

const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`App is running on http://localhost:${PORT}/`);
  } catch (error) {
    console.log(`Error from index.ts ${error}`);
  }
});
