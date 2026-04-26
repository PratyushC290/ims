import mongoose, { Schema } from "mongoose";

const folderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

folderSchema.index({ parent: 1 });
folderSchema.index({ name: 1 });

export const Folder = mongoose.model("Folder", folderSchema);
