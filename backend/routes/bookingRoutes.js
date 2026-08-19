import express from "express";
import {
  createBooking,
  createPaymentIntent,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyBookings);
router.post("/", protect, createBooking);
router.post("/:id/pay", protect, createPaymentIntent);
router.put("/:id/status", protect, updateBookingStatus);

export default router;
