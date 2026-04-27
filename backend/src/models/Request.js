import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    items: [
      {
        itemType: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      }
    ],
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
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ status: 1 });

export const Request = mongoose.model("Request", requestSchema);