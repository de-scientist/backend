const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  subscribeSchema,
} = require("../modules/newsletter/newsletterController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

// Public routes
router.post("/subscribe", validate(subscribeSchema), subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin route
router.get("/", authenticate, requireAdmin, getSubscriptions);

module.exports = router;
