import express from "express";
import {
  listUsers,
  getUser,
  updateUser,
  deactivateUser,
} from "../modules/users/usersController.ts";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All routes protected for admin
router.use(authenticate);
router.use(requireAdmin);

router.get("/", listUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.patch("/:id/deactivate", deactivateUser);

export default router;
