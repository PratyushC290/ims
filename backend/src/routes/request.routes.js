import { Router } from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  fulfillRequest,
} from "../controllers/request.controller.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protectRoute, createRequest);
router.get("/my-requests", protectRoute, getMyRequests);
router.get("/all", protectRoute, adminOnly, getAllRequests);
router.patch("/:requestId/status", protectRoute, adminOnly, updateRequestStatus);
router.post("/:requestId/fulfill", protectRoute, adminOnly, fulfillRequest);

export default router;