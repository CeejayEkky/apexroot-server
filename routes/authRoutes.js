import express from 'express'
import { forgotPassword, getMyself, login, register, resetPassword, verifyEmail } from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddlewares.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login)

authRouter.get("/me", protect, getMyself)
authRouter.post("/verify-email", verifyEmail)

authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter