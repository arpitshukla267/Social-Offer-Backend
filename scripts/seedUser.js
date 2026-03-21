import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-offer';

async function seedUser() {
  try {
    // Validate MongoDB URI
    if (!MONGODB_URI || (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://'))) {
      console.error('Invalid MongoDB URI. Please set MONGODB_URI in .env file');
      console.error('Example: mongodb://localhost:27017/social-offer');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'shuklaarpit440@gmail.com';
    const password = 'arpit267';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      await mongoose.disconnect();
      return;
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    console.log('User created successfully:', email);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUser();
