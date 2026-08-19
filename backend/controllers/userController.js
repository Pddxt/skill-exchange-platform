import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Review from "../models/Review.js";

// @desc    Get a user's public profile by id (with their offered skills)
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("skillsOffered");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const reviews = await Review.find({ reviewee: user._id })
    .populate("reviewer", "name avatar")
    .populate("skill", "title")
    .sort("-createdAt");

  res.json({ user, reviews });
});

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.bio = req.body.bio ?? user.bio;
  user.location = req.body.location ?? user.location;
  user.avatar = req.body.avatar ?? user.avatar;
  if (Array.isArray(req.body.skillsWanted)) {
    user.skillsWanted = req.body.skillsWanted;
  }

  const updated = await user.save();

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar,
    bio: updated.bio,
    location: updated.location,
    skillsWanted: updated.skillsWanted,
    credits: updated.credits,
  });
});

// @desc    List / search users (e.g. to find teachers)
// @route   GET /api/users
// @access  Public
export const listUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const users = await User.find(filter).select("-password").limit(50);
  res.json(users);
});
