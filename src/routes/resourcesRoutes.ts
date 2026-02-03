import express from "express";
import {
  getResources,
  getAllResourcesAdmin,
  createResource,
  updateResource,
  toggleResource,
  deleteResource,
} from "../modules/resources/resourcesController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public
router.get("/", getResources);

// All routes protected for admin
router.use(authenticate);
router.use(requireAdmin);

// Admin
router.get("/admin", getAllResourcesAdmin);
router.post("/admin", createResource);
router.put("/admin/:id", updateResource);
router.patch("/admin/:id/toggle", toggleResource);
router.delete("/admin/:id", deleteResource);
export default router;
