import mongoose, { Schema } from "mongoose";

const issuedAssetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    catalogItem: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Issued", "Returned", "Maintenance"],
      default: "Issued",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

issuedAssetSchema.index({ user: 1, status: 1 });
issuedAssetSchema.index({ catalogItem: 1, status: 1 });

export const IssuedAsset = mongoose.model("IssuedAsset", issuedAssetSchema);