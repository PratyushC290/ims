import mongoose, { Schema } from "mongoose";

const historySchema = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "Created",
        "Assigned",
        "Returned",
        "Sent to Maintenance",
        "Removed from Maintenance",
        "Retired",
      ],
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    authorizedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

historySchema.index({ createdAt: -1 });

export const History = mongoose.model("History", historySchema);
