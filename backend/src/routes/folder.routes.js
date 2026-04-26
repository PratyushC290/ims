import express from "express";
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder
} from "../controllers/folder.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getFolders);
router.post("/", createFolder);
router.put("/:folderId", updateFolder);
router.delete("/:folderId", deleteFolder);

export default router;
