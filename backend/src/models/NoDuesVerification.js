import mongoose, { Schema } from "mongoose";

const noDuesVerificationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemsAtVerification: [
      {
        itemName: String,
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        identifier: String,
        status: String,
      },
    ],
    returnedItemsAtVerification: [
      {
        itemName: String,
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        identifier: String,
      },
    ],
    pendingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Cleared", "Pending"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

noDuesVerificationSchema.index({ student: 1, createdAt: -1 });
noDuesVerificationSchema.index({ createdAt: -1 });

export const NoDuesVerification = mongoose.model(
  "NoDuesVerification",
  noDuesVerificationSchema
);