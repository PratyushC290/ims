import mongoose from "mongoose";
import { seedNotifications } from "../controllers/notification.controller.js";

const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);

    try {
      await seedNotifications();
      console.log("Notifications seeded successfully");
    } catch (seedError) {
      console.error(`Error notifying pending approvals: ${seedError.message}`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.log(`Retrying database connection in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

export default connectDB;
