import express from "express";
import { verifyNoDues, getNoDuesVerifications, deleteNoDuesVerification } from "../controllers/noDues.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/verify", verifyNoDues);
router.get("/verifications", getNoDuesVerifications);
router.delete("/verification/:id", deleteNoDuesVerification);

export default router;