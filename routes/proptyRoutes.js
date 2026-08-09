import express from 'express'
import { addProperty, delProperty, getAllProperties, getMyProperties, getPropertyCounts, getPropertyDets, getSellerDashboard, updateProperty, updatePropertyStatus } from '../controllers/proptyController.js'
import { auth, protect } from '../middlewares/authMiddlewares.js'
import upload from '../middlewares/uploadMiddlewares.js'

const propertyRouter = express.Router()

propertyRouter.get("/", getAllProperties)
propertyRouter.post("/", protect, auth("seller"), upload.array("images", 10), addProperty);
propertyRouter.get("/my", protect, auth("seller"), getMyProperties)
propertyRouter.put("/:id", protect, auth("seller"), upload.array("images", 10), updateProperty)
propertyRouter.delete("/:id", protect, auth("seller"), delProperty)
propertyRouter.get("/counts", getPropertyCounts)
propertyRouter.patch("/:id/status", protect, auth("seller"), updatePropertyStatus)
propertyRouter.get("/:id", getPropertyDets)
propertyRouter.get("/seller/dashboard", protect, auth("seller"), getSellerDashboard);

export default propertyRouter
