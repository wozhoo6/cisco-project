import { Router } from "express";
import {
  checkAuth,
  createStore,
  login,
  fetchStoreIdentifier
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = new Router();

router.post("/createStore", createStore);
router.post("/login", login);

router.get("/checkAuth", protectRoute, checkAuth);
router.get("/fetchStoreIdentfier", protectRoute, fetchStoreIdentifier);


export default router;
