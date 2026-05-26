import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProducts,
  getFeaturedProducts,
  setFeaturedProduct,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = new Router();

router.post(
  "/",
  protectRoute,
  adminRoute,
  upload.single("file"),
  createProduct,
);
router.get("/", getProducts);
router.put("/delete/:product_id", protectRoute, adminRoute, deleteProduct);
router.put("/edit/:product_id", protectRoute, adminRoute, editProduct);

router.put(
  "/setFeaturedProduct/:product_id",
  protectRoute,
  adminRoute,
  setFeaturedProduct,
);
router.get(
  "/getFeaturedProducts",
  protectRoute,
  adminRoute,
  getFeaturedProducts,
);

export default router;
