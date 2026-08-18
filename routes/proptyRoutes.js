import express from 'express'
import { addProperty, delProperty, getAllProperties, getMyProperties, getPropertyCounts, getPropertyDets, getSellerDashboard, updateProperty, updatePropertyStatus } from '../controllers/proptyController.js'
import { auth, protect } from '../middlewares/authMiddlewares.js'
import upload from '../middlewares/uploadMiddlewares.js'
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";
import { checkPropertyLimit } from '../middlewares/propertyLimitMiddleware.js';

const propertyRouter = express.Router()

propertyRouter.get("/", getAllProperties)
propertyRouter.get("/counts", getPropertyCounts)

propertyRouter.get("/my", protect, auth("seller"), getMyProperties)
propertyRouter.get("/seller/dashboard", protect, auth("seller"), getSellerDashboard);
propertyRouter.post("/", protect, auth("seller"), checkPropertyLimit, upload.array("images", 10), addProperty);
propertyRouter.put("/:id", protect, auth("seller"), upload.array("images", 10), updateProperty)
propertyRouter.delete("/:id", protect, auth("seller"), delProperty)
propertyRouter.patch("/:id/status", protect, auth("seller"), updatePropertyStatus)
propertyRouter.get("/:id", getPropertyDets)

export default propertyRouter
