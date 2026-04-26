import mongoose, { Schema } from "mongoose";

const itemTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Hardware", "Software License", "Accessories", "Networking"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const ItemType = mongoose.model("ItemType", itemTypeSchema);
