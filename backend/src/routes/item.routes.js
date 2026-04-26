import express from "express";
import {
  createItem,
  getAllItems,
  assignItem,
  returnItem,
  createBulkItems,
  toggleMaintenance,
  moveItem,
  bulkAssignFolder,
  bulkUnassignFolder,
  undoAction,
  deleteItem,
  getItemHistory
} from "../controllers/item.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/bulk", createBulkItems);
router.post("/bulk-assign-folder", bulkAssignFolder);
router.post("/bulk-unassign-folder", bulkUnassignFolder);

router.post("/", createItem);
router.get("/", getAllItems);
router.get("/:itemId/history", getItemHistory);

router.put("/:itemId/assign", assignItem);
router.put("/:itemId/return", returnItem);
router.put("/:itemId/maintenance", toggleMaintenance);
router.put("/:itemId/move", moveItem);
router.delete("/:itemId", deleteItem);

router.post("/undo/:actionLogId", undoAction);

export default router;
