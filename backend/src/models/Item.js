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
      trim: true,
      default: "General",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    documentUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

itemSchema.index({ name: "text" });
itemSchema.index({ category: 1 });
itemSchema.index({ availableQuantity: 1 });

itemSchema.set("toJSON", { virtuals: true });
itemSchema.set("toObject", { virtuals: true });

export const Item = mongoose.model("Item", itemSchema);