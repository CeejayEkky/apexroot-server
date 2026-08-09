import express from 'express'
import { protect } from '../middlewares/authMiddlewares.js';
import { addWishlist, getWishlist, removeWishlist } from '../controllers/wishlistController.js';

const wishlistRouter = express.Router();

wishlistRouter.post("/:propertyId", protect, addWishlist)
wishlistRouter.get("/", protect, getWishlist)
wishlistRouter.delete("/:propertyId", protect, removeWishlist);

export default wishlistRouter;