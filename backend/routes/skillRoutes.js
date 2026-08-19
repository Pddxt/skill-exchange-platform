import express from "express";
import {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  getMySkills,
} from "../controllers/skillController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMySkills);
router.get("/", getSkills);
router.post("/", protect, createSkill);
router.get("/:id", getSkillById);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

export default router;
