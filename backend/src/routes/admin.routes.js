import express from "express";
import {
  getPendingRequests,
  reviewUserRequest,
} from "../controllers/admin.controller.js";
import {
  protectRoute,
  superAdminOnly,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(superAdminOnly);

//GET /api/admin/requests
router.get("/requests", getPendingRequests);

//PUT /api/admin/requests/:userId
router.put("/requests/:userId", reviewUserRequest);

// PUT /api/admin/users/:userId/role
router.put("/users/:userId/role", changeUserRole);

export default router;
