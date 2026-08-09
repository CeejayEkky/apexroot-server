import express from 'express'
import { auth, protect } from '../middlewares/authMiddlewares.js'
import { approveSeller, blockUser, delPropty, delUser, getAllInquiries, getAllProperties, getAllUsers, getDashboardStats, getPendingSellers } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.use(protect, auth("admin"))
adminRouter.get("/users", getAllUsers)

adminRouter.patch("/users/:id/block", blockUser)
adminRouter.delete("/users/:id", delUser)

adminRouter.get("/properties", getAllProperties)
adminRouter.delete("/properties/:id", delPropty)
adminRouter.get("/inquiries", getAllInquiries)

adminRouter.get("/stats", getDashboardStats)

adminRouter.get("/pending-sellers", getPendingSellers)
adminRouter.patch("/approve-seller/:id", approveSeller)

export default adminRouter