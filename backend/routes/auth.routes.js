import { Router } from "express";
import {
  checkAuth,
  createStore,
  login,
  logout,
  fetchStoreIdentifier,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = new Router();

router.post("/createStore", createStore);
router.post("/login", login);

router.post("/logout", protectRoute, logout);

router.get("/checkAuth", protectRoute, checkAuth);
router.get("/fetchStoreIdentfier", protectRoute, fetchStoreIdentifier);

export default router;
