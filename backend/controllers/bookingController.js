import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
  const Stripe = (await import("stripe")).default;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// @desc    Request a booking for a skill session
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { skillId, scheduledAt, durationMinutes = 60, notes } = req.body;

  const skill = await Skill.findById(skillId).populate("user");
  if (!skill || !skill.isActive) {
    res.status(404);
    throw new Error("Skill listing not found or no longer active");
  }

  if (skill.user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot book your own skill listing");
  }

  const hours = durationMinutes / 60;
  let booking;

  if (skill.isPaid) {
    const amount = Math.round(skill.pricePerHour * hours * 100) / 100;
    booking = await Booking.create({
      skill: skill._id,
      teacher: skill.user._id,
      learner: req.user._id,
      scheduledAt,
      durationMinutes,
      isPaid: true,
      amount,
      paymentStatus: stripe ? "pending" : "not_required",
      notes,
    });
  } else {
    const creditsNeeded = Math.ceil(hours);
    const learner = await User.findById(req.user._id);
    if (learner.credits < creditsNeeded) {
      res.status(400);
      throw new Error(
        `Not enough credits. You need ${creditsNeeded} credit(s) but have ${learner.credits}.`
      );
    }
    booking = await Booking.create({
      skill: skill._id,
      teacher: skill.user._id,
      learner: req.user._id,
      scheduledAt,
      durationMinutes,
      isPaid: false,
      creditsUsed: creditsNeeded,
      paymentStatus: "not_required",
      notes,
    });
  }

  res.status(201).json(booking);
});

// @desc    Create a Stripe payment intent for a paid booking
// @route   POST /api/bookings/:id/pay
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error(
      "Payments are not configured on this server. Add a STRIPE_SECRET_KEY to enable paid sessions."
    );
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.learner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this booking");
  }
  if (!booking.isPaid) {
    res.status(400);
    throw new Error("This booking does not require payment");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.amount * 100),
    currency: "usd",
    metadata: { bookingId: booking._id.toString() },
  });

  booking.stripePaymentIntentId = paymentIntent.id;
  await booking.save();

  res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc    Get bookings for the logged-in user (as teacher or learner)
// @route   GET /api/bookings/mine
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    $or: [{ teacher: req.user._id }, { learner: req.user._id }],
  })
    .populate("skill", "title category isPaid pricePerHour")
    .populate("teacher", "name avatar")
    .populate("learner", "name avatar")
    .sort("-scheduledAt");

  res.json(bookings);
});

// @desc    Update booking status (confirm / reject / cancel / complete)
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["confirmed", "completed", "cancelled", "rejected"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const isTeacher = booking.teacher.toString() === req.user._id.toString();
  const isLearner = booking.learner.toString() === req.user._id.toString();
  if (!isTeacher && !isLearner) {
    res.status(403);
    throw new Error("Not authorized for this booking");
  }

  // Only the teacher can confirm/reject; either party can cancel; either can mark completed
  if ((status === "confirmed" || status === "rejected") && !isTeacher) {
    res.status(403);
    throw new Error("Only the teacher can confirm or reject a booking");
  }

  const previousStatus = booking.status;
  booking.status = status;
  await booking.save();

  // Settle time-credits once a free (non-paid) session is marked completed
  if (status === "completed" && previousStatus !== "completed" && !booking.isPaid) {
    await User.findByIdAndUpdate(booking.learner, { $inc: { credits: -booking.creditsUsed } });
    await User.findByIdAndUpdate(booking.teacher, { $inc: { credits: booking.creditsUsed } });
  }

  res.json(booking);
});
