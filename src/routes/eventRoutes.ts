import express from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  createEventSchema,
  updateEventSchema,
} from "../modules/events/eventController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createEventSchema),
  createEvent,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateEventSchema),
  updateEvent,
);
router.delete("/:id", authenticate, requireAdmin, deleteEvent);

export default router;
