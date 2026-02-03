const express = require("express");
const router = express.Router();
const {
  createPrayerRequest,
  getPrayerRequests,
  updatePrayerRequestStatus,
  createPrayerRequestSchema,
} = require("../modules/prayer/prayerController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

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

module.exports = router;
