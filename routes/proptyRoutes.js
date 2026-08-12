import express from 'express'
import { addProperty, delProperty, getAllProperties, getMyProperties, getPropertyCounts, getPropertyDets, getSellerDashboard, updateProperty, updatePropertyStatus } from '../controllers/proptyController.js'
import { auth, protect } from '../middlewares/authMiddlewares.js'
import upload from '../middlewares/uploadMiddlewares.js'
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";
import { checkPropertyLimit } from '../middlewares/propertyLimitMiddleware.js';

const propertyRouter = express.Router()

propertyRouter.get("/", getAllProperties)
propertyRouter.post("/", protect, auth("seller"), upload.array("images", 10), requireActiveSubscription, checkPropertyLimit, addProperty);
propertyRouter.get("/my", protect, auth("seller"), requireActiveSubscription, getMyProperties)
propertyRouter.put("/:id", protect, auth("seller"), upload.array("images", 10), requireActiveSubscription, updateProperty)
propertyRouter.delete("/:id", protect, auth("seller"), requireActiveSubscription, delProperty)
propertyRouter.get("/counts", getPropertyCounts)
propertyRouter.patch("/:id/status", protect, auth("seller"), requireActiveSubscription, updatePropertyStatus)
propertyRouter.get("/:id", getPropertyDets)
propertyRouter.get("/seller/dashboard", protect, auth("seller"), requireActiveSubscription, getSellerDashboard);

export default propertyRouter
