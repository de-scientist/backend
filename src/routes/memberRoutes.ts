import express from "express";
import {
  registerMember,
  getMembers,
  updateMemberStatus,
  registerMemberSchema,
} from "../modules/members/memberController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public route
router.post("/register", validate(registerMemberSchema), registerMember);

// Admin routes
router.get("/", authenticate, requireAdmin, getMembers);
router.patch("/:id/status", authenticate, requireAdmin, updateMemberStatus);

export default router;
