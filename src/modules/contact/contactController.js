const db = require("../../config/drizzle");
const { contactSubmissions } = require("../../db/schema");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../utils/response");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");
const { z } = require("zod");
const { eq } = require("drizzle-orm");

// Validation schemas
const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
  }),
});

/**
 * Submit contact form (public)
 */
const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const [contact] = await db
      .insert(contactSubmissions)
      .values({
        name,
        email,
        subject,
        message,
        status: "NEW",
      })
      .returning();

    return successResponse(
      res,
      contact,
      "Contact form submitted successfully",
      201,
    );
  } catch (error) {
    console.error("Create contact error:", error);
    return errorResponse(res, "Failed to submit contact form", 500);
  }
};

/**
 * Get contact submissions (admin only)
 */
const getContacts = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const whereClauses = [];
    if (status) {
      whereClauses.push(eq(contactSubmissions.status, status));
    }

    const q = db.select().from(contactSubmissions);
    const itemsQuery = whereClauses.length
      ? q
          .where(...whereClauses)
          .limit(limit)
          .offset(skip)
      : q.limit(limit).offset(skip);
    const contacts = await itemsQuery;
    const total = contacts.length;

    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      contacts,
      pagination,
      "Contact submissions retrieved successfully",
    );
  } catch (error) {
    console.error("Get contacts error:", error);
    return errorResponse(res, "Failed to retrieve contact submissions", 500);
  }
};

/**
 * Update contact status (admin only)
 */
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const updatedArr = await db
      .update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    const contact = updatedArr[0];

    return successResponse(res, contact, "Contact status updated successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Contact submission not found", 404);
    }
    console.error("Update contact error:", error);
    return errorResponse(res, "Failed to update contact status", 500);
  }
};

module.exports = {
  createContact,
  getContacts,
  updateContactStatus,
  createContactSchema,
};
