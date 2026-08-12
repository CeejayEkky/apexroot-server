import express from 'express'
import { protect, auth } from '../middlewares/authMiddlewares.js'
import { getSellerInquiries, markAsRead, sendInquiry } from '../controllers/inquiryController.js'
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware.js';

const inquiryRouter = express.Router()

inquiryRouter.post("/", protect, auth("buyer"), sendInquiry);
inquiryRouter.get("/seller", protect, auth("seller"), requireActiveSubscription, getSellerInquiries);

inquiryRouter.patch("/:id/read", protect, markAsRead)

export default inquiryRouter