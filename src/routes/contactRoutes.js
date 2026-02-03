const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
  createContactSchema,
} = require("../modules/contact/contactController");
const { authenticate, requireAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validation");

// Public route
router.post("/", validate(createContactSchema), createContact);

// Admin routes
router.get("/", authenticate, requireAdmin, getContacts);
router.patch("/:id/status", authenticate, requireAdmin, updateContactStatus);

module.exports = router;
