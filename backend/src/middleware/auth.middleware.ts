import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AuthRequest } from "../types/auth.types";

/**
 * Protect a route by requiring a valid Bearer token.
 * Attaches the decoded JWT payload to req.user.
 *
 * Usage:  router.get("/protected", requireAuth, handler)
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authentication token required." });
    return;
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
