import express from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// GET /api/users
router.get("/", getAllUsers);

export default router;
