import express from "express";
import {
  register,
  login,
  getProfile,
  loginSchema,
  registerSchema,
} from "../modules/auth/authController.js";
import { authenticate } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/profile", authenticate, getProfile);

export default router;
