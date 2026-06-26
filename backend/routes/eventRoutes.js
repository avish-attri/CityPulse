import { Router } from "express";

import {
  getEvents,
  getEvent,
  createEvent,
  rsvpEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", protect, upload.single("image"), createEvent);
router.post("/:id/rsvp", protect, rsvpEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
