import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    res.status(400);
    throw new Error("bookingId and rating are required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.learner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the learner can review this session");
  }
  if (booking.status !== "completed") {
    res.status(400);
    throw new Error("You can only review completed sessions");
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) {
    res.status(400);
    throw new Error("This session has already been reviewed");
  }

  const review = await Review.create({
    booking: bookingId,
    reviewer: req.user._id,
    reviewee: booking.teacher,
    skill: booking.skill,
    rating,
    comment,
  });

  // Recompute teacher's average rating
  const stats = await Review.aggregate([
    { $match: { reviewee: booking.teacher } },
    { $group: { _id: "$reviewee", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(booking.teacher, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  }

  res.status(201).json(review);
});

// @desc    Get all reviews for a given user (as teacher)
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getReviewsForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate("reviewer", "name avatar")
    .populate("skill", "title")
    .sort("-createdAt");

  res.json(reviews);
});
