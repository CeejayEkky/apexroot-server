import express from "express";
import {
  initializeSubscription,
  verifySubscription,
} from "../controllers/subscriptionController.js";
import {protect} from "../middlewares/authMiddlewares.js";

const subscriptionRouter = express.Router();

subscriptionRouter.post("/initialize", protect, initializeSubscription);
subscriptionRouter.post("/verify", protect, verifySubscription);

export default subscriptionRouter;
