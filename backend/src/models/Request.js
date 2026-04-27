import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedItem: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Fulfilled"],
      default: "Pending",
    },
    assignedItem: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ status: 1 });

export const Request = mongoose.model("Request", requestSchema);