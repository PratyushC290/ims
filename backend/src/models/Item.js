import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Under Maintenance", "Retired"],
      default: "Available",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

itemSchema.index({ identifier: "text" });

itemSchema.index({ status: 1 });
itemSchema.index({ assignedTo: 1 });
itemSchema.index({ folder: 1 });
itemSchema.index({ createdAt: -1 });

export const Item = mongoose.model("Item", itemSchema);
