import express from "express";
import cors from "cors";
import env from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

env.config();

const API_VERSION = "/api/v1";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for form text (non-file)
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.8.15:5173"],
    credentials: true, // if using cookies
  }),
);

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/product`, productRoutes);
app.use(`${API_VERSION}/order`, orderRoutes);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(
    `${new Date().toLocaleTimeString()}: Server is running on port ${process.env.PORT}...`,
  );
});
