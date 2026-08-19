import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Skill.deleteMany(),
    Booking.deleteMany(),
    Message.deleteMany(),
    Review.deleteMany(),
  ]);

  const users = await User.create([
    { name: "Asha Verma", email: "asha@example.com", password: "password123", bio: "Frontend dev who loves teaching React.", location: "Pune, IN", credits: 8 },
    { name: "Liam Carter", email: "liam@example.com", password: "password123", bio: "Professional guitarist, 10 years teaching.", location: "Austin, US", credits: 5 },
    { name: "Mei Tanaka", email: "mei@example.com", password: "password123", bio: "Japanese language tutor & translator.", location: "Osaka, JP", credits: 6 },
    { name: "Noah Smith", email: "noah@example.com", password: "password123", bio: "Personal trainer & nutrition coach.", location: "London, UK", credits: 4 },
  ]);

  const [asha, liam, mei, noah] = users;

  const skills = await Skill.create([
    {
      user: asha._id,
      title: "Intro to React & Hooks",
      category: "Programming",
      description: "Hands-on session covering components, state, and hooks for beginners.",
      level: "Beginner",
      isPaid: false,
      tags: ["react", "javascript", "frontend"],
    },
    {
      user: liam._id,
      title: "Acoustic Guitar Fundamentals",
      category: "Music",
      description: "Learn chords, strumming patterns, and your first full song.",
      level: "Beginner",
      isPaid: true,
      pricePerHour: 25,
      tags: ["guitar", "music"],
    },
    {
      user: mei._id,
      title: "Conversational Japanese",
      category: "Language",
      description: "Practice everyday conversation, hiragana, and basic grammar.",
      level: "Any",
      isPaid: false,
      tags: ["japanese", "language"],
    },
    {
      user: noah._id,
      title: "Beginner Strength Training Plan",
      category: "Fitness",
      description: "Personalized strength program design and form coaching.",
      level: "Beginner",
      isPaid: true,
      pricePerHour: 20,
      tags: ["fitness", "strength"],
    },
  ]);

  await User.findByIdAndUpdate(asha._id, { $push: { skillsOffered: skills[0]._id } });
  await User.findByIdAndUpdate(liam._id, { $push: { skillsOffered: skills[1]._id } });
  await User.findByIdAndUpdate(mei._id, { $push: { skillsOffered: skills[2]._id } });
  await User.findByIdAndUpdate(noah._id, { $push: { skillsOffered: skills[3]._id } });

  console.log("Seed data created:");
  console.log("Users:", users.map((u) => u.email).join(", "));
  console.log("(password for all seeded users: password123)");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
