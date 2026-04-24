import mongoose from "mongoose";
import { seedNotifications } from "../controllers/notification.controller.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    
    await seedNotifications();
    console.log("Notifications seeded successfully");
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
