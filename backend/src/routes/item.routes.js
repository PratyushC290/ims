import express from "express";
import {
  createItem, getAllItems, updateItemStock,
  issueAsset, returnAsset, getIssuedAssets, getItemHistory,
  deleteItem, moveItem, createBulkItems, getAllIssued,
  undoAction, bulkAssignFolder, bulkUnassignFolder, getUserIssuedItems
} from "../controllers/item.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/bulk", createBulkItems);
router.post("/bulk-assign-folder", bulkAssignFolder);
router.post("/bulk-unassign-folder", bulkUnassignFolder);

router.post("/", createItem);
router.get("/", getAllItems);
router.get("/issued", getAllIssued);
router.get("/my-issued", getUserIssuedItems);
router.get("/:itemId/history", getItemHistory);

router.put("/:itemId/stock", updateItemStock);
router.put("/:itemId/issue", issueAsset);
router.put("/:itemId/return", returnAsset);

router.put("/:itemId/move", moveItem);
router.delete("/:itemId", deleteItem);

router.post("/undo/:actionLogId", undoAction);

export default router;