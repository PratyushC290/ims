import express from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// GET /api/stats/dashboard
router.get("/dashboard", getDashboardStats);

export default router;
