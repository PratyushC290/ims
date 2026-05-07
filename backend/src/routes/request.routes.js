import { Router } from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  fulfillRequest,
  uploadRequestDocument,
  streamRequestDocument,
} from "../controllers/request.controller.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../config/gridfs.js";

const router = Router();

router.post("/", protectRoute, createRequest);
router.get("/my-requests", protectRoute, getMyRequests);
router.get("/all", protectRoute, adminOnly, getAllRequests);
router.patch("/:requestId/status", protectRoute, adminOnly, updateRequestStatus);
router.post("/:requestId/fulfill", protectRoute, adminOnly, upload.single('document'), fulfillRequest);
router.patch("/:requestId/document", protectRoute, adminOnly, upload.single('document'), uploadRequestDocument);
router.get("/:requestId/document", protectRoute, streamRequestDocument);

export default router;