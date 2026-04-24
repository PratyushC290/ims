import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(adminOnly);

router.get("/", getNotifications);
router.put("/:notificationId/read", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;