import express from "express";
import { getDashboardStats } from "../modules/admin/adminController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", getDashboardStats);

export default router;
