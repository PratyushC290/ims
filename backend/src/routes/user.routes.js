import express from "express";
import { getAllUsers, getUserById, manuallyAddUser } from "../controllers/user.controller.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// GET /api/users
router.get("/", getAllUsers);
router.get("/:userId", getUserById);

// POST /api/users/add - Admin only
router.post("/add", adminOnly, manuallyAddUser);

export default router;
