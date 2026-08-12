import express from "express";
import {
  initializeSubscription,
  verifySubscription,
} from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { handlePaystackWebhook } from "../controllers/paystackWebhookController.js";

const subscriptionRouter = express.Router();

subscriptionRouter.post("/initialize", protect, initializeSubscription);
subscriptionRouter.post("/verify", protect, verifySubscription);
subscriptionRouter.post("/webhook", handlePaystackWebhook);
export default subscriptionRouter;
