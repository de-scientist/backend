const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../modules/admin/adminController");
const { authenticate, requireAdmin } = require("../middlewares/auth");

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", getDashboardStats);

module.exports = router;
