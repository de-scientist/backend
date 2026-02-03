import express from "express";
import {
  getMinistries,
  getMinistry,
  createMinistry,
  updateMinistry,
  deleteMinistry,
  createMinistrySchema,
} from "../modules/ministries/ministryController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

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

export default router;
