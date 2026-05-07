import express from "express";
import {
  createItem, getAllItems, updateItem, deleteItem,
  issueAsset, returnAsset, returnAllAssets,
  getIssuedAssets, getUserIssuedItems, getUserIssuedItemsById,
  getItemHistory, createBulkItems, getAllIssued,
  undoAction, assignAsset, updateItemStock, attachItemDocument
} from "../controllers/item.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.use(protectRoute);

router.post("/bulk", createBulkItems);

router.post("/", upload.single("document"), createItem);
router.get("/", getAllItems);
router.get("/issued", getAllIssued);
router.get("/my-issued", getUserIssuedItems);
router.get("/user/:userId/issued", getUserIssuedItemsById);
router.get("/:itemId/history", getItemHistory);

router.post("/assign", assignAsset);
router.put("/:itemId", updateItem);
router.patch("/:itemId/document", upload.single("document"), attachItemDocument);
router.put("/:itemId/stock", updateItemStock);
router.put("/:itemId/issue", issueAsset);
router.put("/return/:issuedAssetId", returnAsset);
router.put("/user/:userId/return-all", returnAllAssets);

router.delete("/:itemId", deleteItem);

router.post("/undo/:actionLogId", undoAction);

export default router;