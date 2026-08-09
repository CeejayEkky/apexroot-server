import express from "express";
import { protect } from "../middlewares/authMiddlewares.js";
import {
  getProfile,
  getPublicProfile,
  updateProfile,
} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddlewares.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getProfile);
userRouter.put("/profile", protect, upload.single("profilePic"), updateProfile);
userRouter.get("/public/:id", getPublicProfile);

export default userRouter;
