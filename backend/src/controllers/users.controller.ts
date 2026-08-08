import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { updateProfileImage, getProfileImage } from "../services/users.service";

/**
 * PUT /api/users/me/profile-image   (auth required)
 * Body: { image: <base64 data URL> }
 * Saves the signed-in user's profile image and returns its versioned URL.
 */
export async function updateProfileImageController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const result = await updateProfileImage(userId, (req.body as { image?: unknown })?.image);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id/avatar   (public — so <img src> can load it)
 * Serves the user's profile image bytes with a long cache lifetime.
 */
export async function getAvatarController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const img = await getProfileImage(req.params.id);
    if (!img) {
      res.status(404).json({ success: false, message: "No profile image." });
      return;
    }
    res.setHeader("Content-Type", img.mime);
    // Versioned URL (?v=updated_at) makes this safely cacheable forever.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(img.buffer);
  } catch (err) {
    next(err);
  }
}
