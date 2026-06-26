import { Router } from "express";

import {
  getPosts,
  getPost,
  createPost,
  confirmPost,
  resolvePost,
  deletePost,
} from "../controllers/pulseController.js";

import { protect, optionalAuth } from "../middleware/auth.js";

import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", optionalAuth, getPosts);
router.get("/:id", getPost);
router.post("/", protect, upload.single("image"), createPost);
router.post("/:id/confirm", protect, confirmPost);
router.post("/:id/resolve", protect, resolvePost);
router.delete("/:id", protect, deletePost);

export default router;
