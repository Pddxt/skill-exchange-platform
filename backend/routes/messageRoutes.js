import express from "express";
import { sendMessage, getConversations, getThread } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.post("/", protect, sendMessage);
router.get("/:userId", protect, getThread);

export default router;
