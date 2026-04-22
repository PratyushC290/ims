import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpCode: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
