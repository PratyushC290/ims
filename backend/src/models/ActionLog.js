import mongoose, { Schema } from "mongoose";

const actionLogSchema = new Schema(
  {
    actionType: {
      type: String,
      enum: ["MOVE_ITEM", "BULK_ASSIGN", "BULK_UNASSIGN", "MOVE_FOLDER"],
      required: true,
    },
    targetIds: [{
      type: Schema.Types.ObjectId,
    }],
    targetType: {
      type: String,
      enum: ["Item", "Folder"],
      required: true,
    },
    previousState: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isReverted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export const ActionLog = mongoose.model("ActionLog", actionLogSchema);
