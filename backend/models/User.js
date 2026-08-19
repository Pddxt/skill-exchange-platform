import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    location: { type: String, default: "" },

    // Skills this user can teach / offer
    skillsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    // Skills this user wants to learn
    skillsWanted: [{ type: String, trim: true }],

    // Time-credit balance used for skill exchange (1 credit = 1 hour of teaching)
    credits: { type: Number, default: 5 },

    // Average rating, computed from reviews
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
