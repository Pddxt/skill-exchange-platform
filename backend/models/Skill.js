import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Design",
        "Music",
        "Language",
        "Business",
        "Fitness",
        "Cooking",
        "Writing",
        "Marketing",
        "Other",
      ],
    },
    description: { type: String, required: true, maxlength: 1000 },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Any"], default: "Any" },

    // Exchange mode: pure skill-swap (credits) or optionally paid in real money
    isPaid: { type: Boolean, default: false },
    pricePerHour: { type: Number, default: 0 }, // only used if isPaid

    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

skillSchema.index({ title: "text", description: "text", tags: "text" });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
