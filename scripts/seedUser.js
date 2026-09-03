import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seedUser() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "shuklaarpit440@gmail.com";
    const password = "arpit267";

    let user = await User.findOne({ email });

    if (user) {
      // Password will be automatically hashed by the pre-save hook
      user.password = password;
      await user.save();

      console.log("✅ Existing user password updated:", email);
    } else {
      user = new User({
        email,
        password,
      });

      await user.save();

      console.log("✅ User created successfully:", email);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUser();
