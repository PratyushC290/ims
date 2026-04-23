import express from "express";
import {
  createItem,
  getAllItems,
  assignItem,
  returnItem,
  createBulkItems,
} from "../controllers/item.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// POST /api/items/bulk
router.post("/bulk", createBulkItems);

// POST /api/items
router.post("/", createItem);

// GET /api/items
router.get("/", getAllItems);

// PUT /api/items/:itemId/assign
router.put("/:itemId/assign", assignItem);

// PUT /api/items/:itemId/return
router.put("/:itemId/return", returnItem);

// PUT /api/items/:itemId/maintenance
router.put("/:itemId/maintenance", toggleMaintenance);

export default router;
