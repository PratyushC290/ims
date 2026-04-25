import express from "express";
import {
  getItemHistory,
  getGlobalAuditLog,
  getLatestActivity,
} from "../controllers/history.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// GET /api/history/item/:itemId
router.get("/item/:itemId", getItemHistory);

// GET /api/history/latest
router.get("/latest", getLatestActivity);

// GET /api/history/global
router.get("/global", getGlobalAuditLog);

export default router;
