import express from "express";
import { contactCreate, getAllContacts } from "../controllers/contactController.js";
import { auth, protect } from "../middlewares/authMiddlewares.js";

const contactRouter = express.Router()

contactRouter.post("/", contactCreate)
contactRouter.get("/", protect, auth("admin"), getAllContacts)

export default contactRouter