import express from "express";
import {
  createGalleryItem,
  getGallery,
  updateGalleryItem,
  getAllGalleryAdmin,
  deleteGalleryItem,
  toggleGalleryItem,
} from "../modules/media/mediaController.ts";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

/* =======================
   PUBLIC
======================= */
router.get("/public", getGallery);

/* =======================
   ADMIN
======================= */
router.use(authenticate);
router.use(requireAdmin);

router.get("/admin", getAllGalleryAdmin);
router.post("/admin", createGalleryItem);
router.put("/admin/:id", updateGalleryItem);
router.patch("/admin/:id/toggle", toggleGalleryItem);
router.delete("/admin/:id", deleteGalleryItem);

export default router;
