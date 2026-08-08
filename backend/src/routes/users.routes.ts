import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  updateProfileImageController,
  getAvatarController,
} from "../controllers/users.controller";

const router = Router();

// PUT /api/users/me/profile-image — upload/replace own profile image (auth)
router.put("/me/profile-image", requireAuth, updateProfileImageController);

// GET /api/users/:id/avatar — serve a user's profile image bytes (public)
router.get("/:id/avatar", getAvatarController);

export default router;
