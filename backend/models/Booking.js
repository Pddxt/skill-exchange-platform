import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending",
    },

    // Payment / settlement
    isPaid: { type: Boolean, default: false },
    amount: { type: Number, default: 0 }, // real money amount, if isPaid
    creditsUsed: { type: Number, default: 0 }, // time-credits, if not paid
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "refunded", "failed"],
      default: "not_required",
    },
    stripePaymentIntentId: { type: String, default: "" },

    notes: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
