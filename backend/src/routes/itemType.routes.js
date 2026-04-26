import express from "express";
import { createItemType, getAllItemTypes, deleteItemType } from "../controllers/itemType.controller.js";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllItemTypes);
router.post("/", adminOnly, createItemType);
router.delete("/:id", adminOnly, deleteItemType);

export default router;
