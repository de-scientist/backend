import express from "express";
import {
  createPrayerRequest,
  getPrayerRequests,
  updatePrayerRequestStatus,
  createPrayerRequestSchema,
} from "../modules/prayer/prayerController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public route
router.post("/", validate(createPrayerRequestSchema), createPrayerRequest);

// Admin routes
router.get("/", authenticate, requireAdmin, getPrayerRequests);
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updatePrayerRequestStatus,
);

export default router;
