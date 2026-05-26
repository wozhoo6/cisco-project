import { Router } from "express";
import {
    createOrder,
    getStoreOrders,
    updateOrderStatus,
    getOrderDetails,
    getAllOrders,
    getTotalStatusCounts
} from "../controllers/order.controller.js"

import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = new Router();

router.post("/", createOrder)

router.get('/storeOrders/', protectRoute, getStoreOrders)
router.get('/getOrderDetails/:orderId', protectRoute, getOrderDetails)

router.put('/updateStatus/:orderId', protectRoute, updateOrderStatus)


// Admin routes
router.get('/getAllOrders', protectRoute, adminRoute, getAllOrders)
router.get('/totalStatusCount', protectRoute, adminRoute, getTotalStatusCounts)




export default router;
