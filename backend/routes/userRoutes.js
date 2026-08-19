import express from "express";
import { getUserProfile, updateProfile, listUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listUsers);
router.put("/profile", protect, updateProfile);
router.get("/:id", getUserProfile);

export default router;
