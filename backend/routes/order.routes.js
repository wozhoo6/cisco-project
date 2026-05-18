import { Router } from "express";
import {
    createOrder,
    getStoreOrders,
    updateOrderStatus
} from "../controllers/order.controller.js"

import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = new Router();

router.post("/", createOrder)

router.get('/storeOrders/', protectRoute, getStoreOrders)
router.put('/updateStatus/:orderId', protectRoute, updateOrderStatus)



export default router;
