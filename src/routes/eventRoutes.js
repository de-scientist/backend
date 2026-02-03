const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  createEventSchema,
  updateEventSchema,
} = require("../modules/events/eventController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

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

module.exports = router;
