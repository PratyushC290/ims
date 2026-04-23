import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Hardware", "Software License", "Accessories"],
    },
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
  },
  {
    timestamps: true,
  },
);

itemSchema.index({ name: "text", identifier: "text" });

itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ assignedTo: 1 });
itemSchema.index({ createdAt: -1 });

export const Item = mongoose.model("Item", itemSchema);
