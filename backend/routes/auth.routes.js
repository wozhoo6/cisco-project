import { Router } from "express";
import {
  checkAuth,
  createStore,
  login,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = new Router();

router.post("/createStore", createStore);
router.post("/login", login);

router.get("/checkAuth", protectRoute, checkAuth);

export default router;
