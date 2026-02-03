import express from "express";
import {
  getBlogs,
  getBlogBySlug,
  adminGetBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  createBlogSchema,
  updateBlogSchema,
} from "../modules/blogs/blogController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import validate from "../middlewares/validation.js";

const router = express.Router();

// Public
router.get("/", getBlogs);

// Admin (scoped to /admin)
router.use("/admin", authenticate, requireAdmin);
router.get("/admin", adminGetBlogs);
router.post("/admin", validate(createBlogSchema), createBlog);
router.put("/admin/:id", validate(updateBlogSchema), updateBlog);
router.delete("/admin/:id", deleteBlog);

// Public detail route placed last to avoid catching /admin
router.get("/:slug", getBlogBySlug);

export default router;
