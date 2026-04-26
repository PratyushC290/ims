import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  manuallyAddUser,
  deleteUser,
  getUserHistory
} from "../controllers/user.controller.js";
import { protectRoute, adminOnly, superAdminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, adminOnly, getAllUsers);
router.post("/add", protectRoute, adminOnly, manuallyAddUser);
router.get("/:userId", protectRoute, getUserById);
router.delete("/:userId", protectRoute, superAdminOnly, deleteUser);
router.get("/:userId/history", protectRoute, getUserHistory);

export default router;
