const express = require("express");
const router = express.Router();
const {
  getMinistries,
  getMinistry,
  createMinistry,
  updateMinistry,
  deleteMinistry,
  createMinistrySchema,
} = require("../modules/ministries/ministryController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

// Public routes
router.get("/", getMinistries);
router.get("/:slug", getMinistry);

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createMinistrySchema),
  createMinistry,
);
router.put("/:slug", authenticate, requireAdmin, updateMinistry);
router.delete("/:slug", authenticate, requireAdmin, deleteMinistry);

module.exports = router;
