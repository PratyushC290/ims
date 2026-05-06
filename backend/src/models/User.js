import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    instituteEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Faculty", "Staff", "Admin", "Super Admin"],
      default: "Student",
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    studentId: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    alternativeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phdGuide: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual("requests", {
  ref: "Request",
  localField: "_id",
  foreignField: "user",
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model("User", userSchema);
