import asyncHandler from "express-async-handler";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

// @desc    Create a new skill listing
// @route   POST /api/skills
// @access  Private
export const createSkill = asyncHandler(async (req, res) => {
  const { title, category, description, level, isPaid, pricePerHour, tags } = req.body;

  if (!title || !category || !description) {
    res.status(400);
    throw new Error("Title, category, and description are required");
  }

  const skill = await Skill.create({
    user: req.user._id,
    title,
    category,
    description,
    level,
    isPaid: !!isPaid,
    pricePerHour: isPaid ? Number(pricePerHour) || 0 : 0,
    tags: Array.isArray(tags) ? tags : [],
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { skillsOffered: skill._id } });

  res.status(201).json(skill);
});

// @desc    Get all skill listings (search, filter by category/paid)
// @route   GET /api/skills
// @access  Public
export const getSkills = asyncHandler(async (req, res) => {
  const { search, category, isPaid, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (isPaid === "true") filter.isPaid = true;
  if (isPaid === "false") filter.isPaid = false;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .populate("user", "name avatar rating numReviews location")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Skill.countDocuments(filter),
  ]);

  res.json({ skills, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get single skill by id
// @route   GET /api/skills/:id
// @access  Public
export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).populate(
    "user",
    "name avatar rating numReviews location bio"
  );

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  res.json(skill);
});

// @desc    Update own skill listing
// @route   PUT /api/skills/:id
// @access  Private
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to edit this skill listing");
  }

  const fields = ["title", "category", "description", "level", "isPaid", "pricePerHour", "tags", "isActive"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) skill[field] = req.body[field];
  });

  const updated = await skill.save();
  res.json(updated);
});

// @desc    Delete own skill listing
// @route   DELETE /api/skills/:id
// @access  Private
export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this skill listing");
  }

  await skill.deleteOne();
  await User.findByIdAndUpdate(skill.user, { $pull: { skillsOffered: skill._id } });

  res.json({ message: "Skill listing removed" });
});

// @desc    Get skills belonging to the logged-in user
// @route   GET /api/skills/mine
// @access  Private
export const getMySkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ user: req.user._id }).sort("-createdAt");
  res.json(skills);
});
