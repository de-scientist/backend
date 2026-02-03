const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  loginSchema,
  registerSchema,
} = require("../modules/auth/authController");
const { authenticate } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/profile", authenticate, getProfile);

module.exports = router;
