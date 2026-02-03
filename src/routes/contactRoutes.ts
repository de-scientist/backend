import express from "express";
import {
  createContact,
  getContacts,
  updateContactStatus,
  createContactSchema,
} from "../modules/contact/contactController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public route
router.post("/", validate(createContactSchema), createContact);

// Admin routes
router.get("/", authenticate, requireAdmin, getContacts);
router.patch("/:id/status", authenticate, requireAdmin, updateContactStatus);

export default router;
