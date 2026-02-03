import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscriptions,
  subscribeSchema,
} from "../modules/newsletter/newsletterController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.post("/subscribe", validate(subscribeSchema), subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin route
router.get("/", authenticate, requireAdmin, getSubscriptions);

export default router;
