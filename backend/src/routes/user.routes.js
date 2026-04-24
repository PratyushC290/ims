import express from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// GET /api/users
router.get("/", getAllUsers);
router.get("/:userId", getUserById);

export default router;
